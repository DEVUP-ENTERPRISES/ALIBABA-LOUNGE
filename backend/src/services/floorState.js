const Table = require("../models/Table");
const Order = require("../models/Order");
const TerminalOrder = require("../models/TerminalOrder");
const Reservation = require("../models/Reservation");

/**
 * The one place that decides whether a table is free.
 *
 * Three independent systems can put people at a table: an order placed on the
 * website, a tab rung up on the Clover terminal, and a reservation for
 * tonight. Each used to answer that question for itself, so they disagreed —
 * a table with a live terminal tab still showed as bookable, and the website's
 * table picker offered seats that had people in them, because only web orders
 * marked a table occupied.
 *
 * Everything that needs to know now asks here.
 */

/** Statuses on our own orders that mean the tab is still running. */
const OPEN_ORDER_STATUSES = ["placed", "accepted", "preparing", "served"];

/** Reservation states that hold a table for the evening. */
const HOLDING_RESERVATION = ["pending", "confirmed", "seated"];

/**
 * How long a terminal tab counts as live.
 *
 * Tabs get left open on the till and forgotten — there is one in the live data
 * from a month ago. Treating those as occupied would take real tables out of
 * service indefinitely, so a tab only holds a table for the current service.
 */
const STALE_TAB_HOURS = 24;

const staleCutoff = () => new Date(Date.now() - STALE_TAB_HOURS * 3600 * 1000);

/** The venue's own day, so a 1am tab still belongs to tonight. */
const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());

/**
 * Why a table is unavailable, or null if it is free.
 *
 * Returns the reason rather than a boolean so callers can say something useful
 * — "in use right now" reads very differently from "booked at 9pm".
 */
async function tableClaim(tableId) {
  if (!tableId) return null;

  const [webOrder, terminalTab, reservation] = await Promise.all([
    Order.exists({ table: tableId, status: { $in: OPEN_ORDER_STATUSES } }),
    TerminalOrder.exists({
      table: tableId,
      state: "open",
      openedAt: { $gte: staleCutoff() },
    }),
    Reservation.exists({
      table: tableId,
      status: { $in: HOLDING_RESERVATION },
      date: today(),
    }),
  ]);

  if (webOrder) return { kind: "web-order", occupied: true };
  if (terminalTab) return { kind: "terminal-tab", occupied: true };
  if (reservation) return { kind: "reservation", occupied: false };
  return null;
}

/** Tables with someone actually at them right now, as a Set of id strings. */
async function occupiedTableIds() {
  const [webOrders, terminalTabs] = await Promise.all([
    Order.find({ status: { $in: OPEN_ORDER_STATUSES } }).select("table").lean(),
    TerminalOrder.find({ state: "open", openedAt: { $gte: staleCutoff() } })
      .select("table")
      .lean(),
  ]);

  const ids = new Set();
  for (const o of webOrders) if (o.table) ids.add(String(o.table));
  for (const t of terminalTabs) if (t.table) ids.add(String(t.table));
  return ids;
}

/**
 * Put a table's status back in step with reality.
 *
 * Occupied beats reserved beats available. Only ever moves a table between
 * those three — a table a manager has marked "cleaning" is left alone, since
 * that is a human decision no sync should override.
 */
async function reconcileTable(tableId) {
  if (!tableId) return;

  const claim = await tableClaim(tableId);
  const next = claim ? (claim.occupied ? "occupied" : "reserved") : "available";

  await Table.updateOne(
    { _id: tableId, status: { $in: ["available", "occupied", "reserved"] } },
    { $set: { status: next } }
  );
}

module.exports = {
  OPEN_ORDER_STATUSES,
  HOLDING_RESERVATION,
  STALE_TAB_HOURS,
  staleCutoff,
  today,
  tableClaim,
  occupiedTableIds,
  reconcileTable,
};
