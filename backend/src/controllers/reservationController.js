const Reservation = require("../models/Reservation");
const { HOLDING } = require("../models/Reservation");
const Table = require("../models/Table");
const Order = require("../models/Order");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");
const { buildPagination, buildSort, paginationPayload } = require("../utils/query");
const { formatReservation } = require("../services/formatters");

/**
 * How long a booking holds its table.
 *
 * Two hookahs and a round of drinks is comfortably over an hour, and turning
 * a table faster than this in practice means the second party waits at the
 * door. Two bookings on one table inside this window are treated as a clash.
 */
const HOLD_MINUTES = 120;

const OPEN_ORDER_STATUSES = ["placed", "accepted", "preparing", "served"];

/** The venue's own day, so 1am still counts as tonight. */
const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());

/** "20:00" -> 1200. Tolerates "8:00 PM" in case a booking is typed by hand. */
function minutesOf(time) {
  if (!time) return null;
  const t = String(time).trim();

  const h24 = t.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) return Number(h24[1]) * 60 + Number(h24[2]);

  const h12 = t.match(/^(\d{1,2})(?::(\d{2}))?\s*([AaPp])\.?[Mm]\.?$/);
  if (h12) {
    let hour = Number(h12[1]) % 12;
    if (h12[3].toLowerCase() === "p") hour += 12;
    return hour * 60 + Number(h12[2] || 0);
  }
  return null;
}

/**
 * Do two bookings on the same evening collide?
 *
 * The lounge runs past midnight, so a 1am booking belongs to the night before
 * rather than to a fresh day. Anything before 6am is pushed into the previous
 * evening so it compares correctly against a 11pm sitting.
 */
function overlaps(timeA, timeB) {
  const a = minutesOf(timeA);
  const b = minutesOf(timeB);
  if (a === null || b === null) return false;
  const norm = (m) => (m < 6 * 60 ? m + 24 * 60 : m);
  return Math.abs(norm(a) - norm(b)) < HOLD_MINUTES;
}

/** Bookings already holding a table that evening, excluding one being edited. */
async function holdsOn(date, exceptId) {
  const filter = { date, status: { $in: HOLDING }, table: { $ne: null } };
  if (exceptId) filter._id = { $ne: exceptId };
  return Reservation.find(filter).select("table time guests name reference").lean();
}

function normalizeStatus(status) {
  return (
    {
      Pending: "pending",
      Approved: "confirmed",
      Rejected: "cancelled",
      Seated: "seated",
      Completed: "completed",
      "No-show": "no-show",
    }[status] || status
  );
}

/**
 * Hand a table back to whatever still has a claim on it.
 *
 * Three outcomes, because a table one booking has finished with is not
 * necessarily free. Somebody may still be sitting there on a live tab, or a
 * later booking that evening may already be holding it — in which case the
 * table drops back to reserved rather than to available. Releasing it
 * outright would tell the floor a table is free while it is spoken for.
 */
async function releaseTableIfIdle(tableId) {
  if (!tableId) return;

  const [openOrder, otherHold] = await Promise.all([
    Order.exists({ table: tableId, status: { $in: OPEN_ORDER_STATUSES } }),
    // Only tonight's bookings speak for the live floor. A table held for
    // next Friday must not keep tonight's table off the floor.
    Reservation.exists({ table: tableId, status: { $in: HOLDING }, date: today() }),
  ]);

  // People are still at the table with an open tab — leave it alone.
  if (openOrder) return;

  const next = otherHold ? "reserved" : "available";
  await Table.updateOne(
    { _id: tableId, status: { $in: ["reserved", "occupied"] } },
    { $set: { status: next } }
  );
}

/**
 * Reflect a booking onto the live floor — but only if it is for tonight.
 *
 * Table.status is what the ordering flow reads to decide who can sit where
 * right now; it has no notion of a date. Stamping it for a booking a week
 * out would take a table out of service for every evening in between.
 */
async function syncFloor(reservation, status) {
  if (!reservation.table) return;

  const terminal = ["completed", "cancelled", "no-show"].includes(status);

  // Releasing is never date-gated. A booking made for tonight and cancelled
  // tomorrow would otherwise leave its table reserved for good, because by
  // then the date no longer matches. Handing a table back is always safe —
  // the helper only frees it when nothing else holds it and no tab is open.
  if (terminal) {
    await releaseTableIfIdle(reservation.table);
    return;
  }

  // Taking a table out of service is date-gated, because Table.status has no
  // notion of a date: it is what the ordering flow reads right now.
  if (reservation.date !== today()) return;

  if (status === "seated") {
    await Table.updateOne(
      { _id: reservation.table, status: { $in: ["available", "reserved"] } },
      { $set: { status: "occupied" } }
    );
  } else {
    await Table.updateOne(
      { _id: reservation.table, status: "available" },
      { $set: { status: "reserved" } }
    );
  }
}

// ── Guest ────────────────────────────────────────────────────

/**
 * Check a table can take this booking, or say exactly why not.
 *
 * Shared by every path that puts a booking on a table — the guest choosing
 * one, a guest moving, and staff assigning — so the rules cannot drift apart
 * between them. Returns the table document.
 */
async function claimTable({ tableId, date, time, guests, exceptId }) {
  const table = await Table.findById(tableId);
  if (!table) throw new AppError("Choose a table.", 404);
  if (!table.isActive) throw new AppError("That table is not in service.", 400);

  if (table.seats < guests) {
    throw new AppError(
      `Table ${table.code} seats ${table.seats}, but the party is ${guests}.`,
      400
    );
  }

  const holds = await holdsOn(date, exceptId);
  const clash = holds.find(
    (h) => String(h.table) === String(table._id) && overlaps(h.time, time)
  );
  if (clash) {
    // Deliberately vague about who: the guest picking a table has no business
    // knowing another guest's name or booking code.
    throw new AppError(
      `Table ${table.code} was just taken for that time. Please pick another.`,
      409
    );
  }

  return table;
}

/**
 * The staff version of claimTable.
 *
 * Identical rules, but the message names the booking in the way — the person
 * on the floor needs to know which party to talk to, where a guest does not.
 */
async function claimTableForStaff(reservation, tableId) {
  const holds = await holdsOn(reservation.date, reservation._id);
  const clash = holds.find(
    (h) => String(h.table) === String(tableId) && overlaps(h.time, reservation.time)
  );
  if (clash) {
    const table = await Table.findById(tableId).select("code").lean();
    throw new AppError(
      `Table ${table?.code ?? ""} is already held at ${clash.time} for ${clash.reference}.`,
      409
    );
  }
  return claimTable({
    tableId,
    date: reservation.date,
    time: reservation.time,
    guests: reservation.guests,
    exceptId: reservation._id,
  });
}

const createReservation = asyncHandler(async (req, res) => {
  const payload = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    date: req.body.date,
    time: req.body.time,
    guests: req.body.guests,
    specialRequest: req.body.specialRequest || "",
  };

  // Guests choose their own table from the live floor. It stays optional so a
  // booking taken over the phone can still be created without one.
  if (req.body.table) {
    const table = await claimTable({
      tableId: req.body.table,
      date: payload.date,
      time: payload.time,
      guests: payload.guests,
    });
    payload.table = table._id;
    payload.tableCode = table.code;
  }

  const reservation = await Reservation.create(payload);
  await syncFloor(reservation, reservation.status);

  res.status(201).json({ success: true, reservation: formatReservation(reservation) });
});

/**
 * Let the guest move their own booking.
 *
 * Held to the same trust model as the lookup — whoever has the reference
 * code — because that is the only thing a guest who never signs in holds.
 */
const changeTableByReference = asyncHandler(async (req, res) => {
  const reference = String(req.params.reference || "").trim().toUpperCase();
  const reservation = await Reservation.findOne({ reference });
  if (!reservation) throw new AppError("We could not find that reservation.", 404);

  if (!["pending", "confirmed"].includes(reservation.status)) {
    throw new AppError(
      reservation.status === "seated"
        ? "You are already seated — ask your server to move you."
        : "This booking is closed.",
      400
    );
  }

  const table = await claimTable({
    tableId: req.body.table,
    date: reservation.date,
    time: reservation.time,
    guests: reservation.guests,
    exceptId: reservation._id,
  });

  const previous = reservation.table;
  reservation.table = table._id;
  reservation.tableCode = table.code;
  await reservation.save();

  await syncFloor(reservation, reservation.status);
  if (previous && String(previous) !== String(table._id)) {
    await releaseTableIfIdle(previous);
  }

  res.json({
    success: true,
    reservation: {
      reference: reservation.reference,
      tableCode: reservation.tableCode,
      status: reservation.status,
    },
  });
});

/**
 * Look a booking up by the code on the confirmation.
 *
 * Public, because nobody books while signed in. It answers only for an exact
 * reference — there is no listing and no search — and carries a first name
 * rather than the full contact details the staff view holds.
 */
const lookupReservation = asyncHandler(async (req, res) => {
  const reference = String(req.params.reference || "").trim().toUpperCase();

  const reservation = await Reservation.findOne({ reference })
    .select(
      "reference name date time guests status tableCode statusNote confirmedAt seatedAt completedAt cancelledAt createdAt"
    )
    .lean();

  if (!reservation) throw new AppError("We could not find that reservation.", 404);

  res.json({
    success: true,
    reservation: {
      reference: reservation.reference,
      firstName: String(reservation.name).split(" ")[0],
      date: reservation.date,
      time: reservation.time,
      guests: reservation.guests,
      status: reservation.status,
      tableCode: reservation.tableCode || null,
      statusNote: reservation.statusNote || "",
      confirmedAt: reservation.confirmedAt,
      seatedAt: reservation.seatedAt,
      completedAt: reservation.completedAt,
      cancelledAt: reservation.cancelledAt,
      createdAt: reservation.createdAt,
    },
  });
});

// ── Floor ────────────────────────────────────────────────────

const getReservations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};

  if (req.query.status) filter.status = normalizeStatus(req.query.status);
  if (req.query.date) filter.date = req.query.date;
  if (req.query.search) filter.$text = { $search: req.query.search };

  const [reservations, total] = await Promise.all([
    Reservation.find(filter)
      .sort(buildSort(req.query))
      .skip(skip)
      .limit(limit)
      .populate("table", "code section seats"),
    Reservation.countDocuments(filter),
  ]);

  res.json({
    success: true,
    reservations: reservations.map(formatReservation),
    pagination: paginationPayload({ page, limit, total }),
  });
});

const getReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id).populate(
    "table",
    "code section seats"
  );
  if (!reservation) throw new AppError("Reservation not found.", 404);
  res.json({ success: true, reservation: formatReservation(reservation) });
});

/**
 * Which tables could take this booking.
 *
 * Answers the question the person on the floor actually has — not "list the
 * tables" but "who can seat eight people at nine o'clock" — so the clash is
 * caught before the guest is promised anything.
 */
const getAvailability = asyncHandler(async (req, res) => {
  const { date, time } = req.query;
  const guests = Number(req.query.guests) || 1;
  const exceptId = req.query.reservation || null;

  const [tables, holds] = await Promise.all([
    Table.find({ isActive: true }).sort({ code: 1 }).lean(),
    holdsOn(date, exceptId),
  ]);

  const takenBy = new Map();
  for (const h of holds) {
    if (overlaps(h.time, time)) takenBy.set(String(h.table), h);
  }

  // Staff see who holds a table; a guest picking one sees only that it is
  // taken. The same handler serves both routes, so this is the only gate.
  const detailed = Boolean(req.admin);

  const options = tables.map((t) => {
    const clash = takenBy.get(String(t._id));
    return {
      id: t._id,
      code: t.code,
      section: t.section,
      seats: t.seats,
      fits: t.seats >= guests,
      free: !clash,
      heldBy:
        clash && detailed
          ? { reference: clash.reference, time: clash.time, name: clash.name.split(" ")[0] }
          : null,
    };
  });

  res.json({
    success: true,
    date,
    time,
    guests,
    holdMinutes: HOLD_MINUTES,
    // What the floor should offer first: fits the party and nothing on it.
    recommended: options
      .filter((o) => o.fits && o.free)
      .sort((a, b) => a.seats - b.seats)
      .slice(0, 6)
      .map((o) => o.id),
    tables: options,
  });
});

/** Seat a booking at a specific table, refusing double-bookings by name. */
const assignTable = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) throw new AppError("Reservation not found.", 404);
  if (["completed", "cancelled", "no-show"].includes(reservation.status)) {
    throw new AppError("This reservation is closed.", 400);
  }

  const table = await claimTableForStaff(reservation, req.body.table);
  const previous = reservation.table;
  reservation.table = table._id;
  reservation.tableCode = table.code;
  await reservation.save();

  await syncFloor(reservation, reservation.status);
  if (previous && String(previous) !== String(table._id)) {
    await releaseTableIfIdle(previous);
  }

  const populated = await reservation.populate("table", "code section seats");
  res.json({ success: true, reservation: formatReservation(populated) });
});

const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["seated", "cancelled", "no-show"],
  seated: ["completed", "cancelled"],
};

/**
 * Move a booking along its evening.
 *
 * Confirming requires a table. That is the point of the flow — an approval
 * the floor cannot act on is just a nicer-looking pending, and the guest gets
 * told a table number rather than "we will be in touch".
 */
const updateReservationStatus = asyncHandler(async (req, res) => {
  const status = normalizeStatus(req.body.status);
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) throw new AppError("Reservation not found.", 404);

  const allowed = ALLOWED_TRANSITIONS[reservation.status] || [];
  if (!allowed.includes(status)) {
    throw new AppError(`Cannot go from ${reservation.status} to ${status}.`, 400);
  }

  // A table may be chosen in the same breath as the approval.
  if (req.body.table) {
    const table = await claimTableForStaff(reservation, req.body.table);
    reservation.table = table._id;
    reservation.tableCode = table.code;
  }

  if (status === "confirmed" && !reservation.table) {
    throw new AppError("Assign a table before confirming.", 400);
  }

  reservation.status = status;
  if (typeof req.body.statusNote === "string") {
    reservation.statusNote = req.body.statusNote.slice(0, 300);
  }

  const now = new Date();
  if (status === "confirmed") reservation.confirmedAt = now;
  if (status === "seated") reservation.seatedAt = now;
  if (status === "completed") reservation.completedAt = now;
  if (status === "cancelled" || status === "no-show") reservation.cancelledAt = now;

  await reservation.save();

  // Keep the floor plan honest about what each table is doing tonight.
  await syncFloor(reservation, status);

  const populated = await reservation.populate("table", "code section seats");
  res.json({ success: true, reservation: formatReservation(populated) });
});

const updateReservation = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  // Status and table have their own endpoints because both carry floor side
  // effects; letting them through here would skip the checks.
  delete payload.status;
  delete payload.table;
  delete payload.tableCode;
  delete payload.reference;

  const reservation = await Reservation.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  }).populate("table", "code section seats");

  if (!reservation) throw new AppError("Reservation not found.", 404);
  res.json({ success: true, reservation: formatReservation(reservation) });
});

const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findByIdAndDelete(req.params.id);
  if (!reservation) throw new AppError("Reservation not found.", 404);
  await releaseTableIfIdle(reservation.table);
  res.status(204).send();
});

module.exports = {
  createReservation,
  changeTableByReference,
  lookupReservation,
  getReservations,
  getReservation,
  getAvailability,
  assignTable,
  updateReservationStatus,
  updateReservation,
  deleteReservation,
  // exported for tests
  overlaps,
  minutesOf,
};
