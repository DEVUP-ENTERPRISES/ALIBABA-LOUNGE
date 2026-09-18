const WaiterCall = require("../models/WaiterCall");
const Table = require("../models/Table");
const Order = require("../models/Order");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");

const REASON_LABEL = {
  service: "Needs a server",
  bill: "Ready for the bill",
  coals: "Coals need changing",
  water: "Needs water",
};

function format(call) {
  return {
    id: call._id,
    table: call.table?._id || call.table,
    tableCode: call.tableCode,
    order: call.order || null,
    reason: call.reason,
    reasonLabel: REASON_LABEL[call.reason] || "Needs a server",
    status: call.status,
    createdAt: call.createdAt,
    acknowledgedAt: call.acknowledgedAt,
    acknowledgedName: call.acknowledgedName,
    resolvedAt: call.resolvedAt,
    responseSeconds: call.responseSeconds,
  };
}

/**
 * A guest presses the button. No sign-in — the same trust model as ordering,
 * whoever is sitting at the table.
 *
 * Re-pressing an open call refreshes it rather than erroring, so an anxious
 * second tap reads as "still waiting" instead of a failure the guest has to
 * puzzle over.
 */
const createCall = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.body.table);
  if (!table || !table.isActive) throw new AppError("Table not found.", 404);

  const existing = await WaiterCall.findOne({
    table: table._id,
    status: { $in: ["open", "acknowledged"] },
  });
  if (existing) {
    return res.status(200).json({ success: true, call: format(existing), alreadyWaiting: true });
  }

  const order = await Order.findOne({
    table: table._id,
    status: { $in: ["placed", "accepted", "preparing", "served"] },
  })
    .select("_id")
    .sort({ placedAt: -1 });

  const call = await WaiterCall.create({
    table: table._id,
    tableCode: table.code,
    order: order?._id || null,
    reason: ["service", "bill", "coals", "water"].includes(req.body.reason)
      ? req.body.reason
      : "service",
  });

  res.status(201).json({ success: true, call: format(call), alreadyWaiting: false });
});

/** The guest checking whether anyone has come yet. */
const getCallStatus = asyncHandler(async (req, res) => {
  const call = await WaiterCall.findById(req.params.id);
  if (!call) throw new AppError("Not found.", 404);
  res.json({ success: true, call: format(call) });
});

/** Let the table cancel their own call — they got up, or a server already came by informally. */
const cancelCall = asyncHandler(async (req, res) => {
  const call = await WaiterCall.findById(req.params.id);
  if (!call) throw new AppError("Not found.", 404);
  if (!["open", "acknowledged"].includes(call.status)) {
    return res.json({ success: true, call: format(call) });
  }
  call.status = "resolved";
  call.resolvedAt = new Date();
  await call.save();
  res.json({ success: true, call: format(call) });
});

// ── Staff ────────────────────────────────────────────────────

const listCalls = asyncHandler(async (req, res) => {
  const filter =
    req.query.scope === "all" ? {} : { status: { $in: ["open", "acknowledged"] } };
  const calls = await WaiterCall.find(filter).sort({ createdAt: 1 }).limit(50);
  res.json({ success: true, calls: calls.map(format) });
});

/** First staff member to see it claims it, same pattern as claiming an order. */
const acknowledgeCall = asyncHandler(async (req, res) => {
  const staff = req.admin;
  const call = await WaiterCall.findOneAndUpdate(
    { _id: req.params.id, status: "open" },
    {
      $set: {
        status: "acknowledged",
        acknowledgedAt: new Date(),
        acknowledgedBy: staff._id,
        acknowledgedName: staff.displayName || staff.name,
      },
    },
    { new: true }
  );
  if (!call) {
    const existing = await WaiterCall.findById(req.params.id);
    if (!existing) throw new AppError("Not found.", 404);
    throw new AppError(
      existing.acknowledgedName
        ? `Already on it — ${existing.acknowledgedName}.`
        : "Already handled.",
      409
    );
  }
  res.json({ success: true, call: format(call) });
});

const resolveCall = asyncHandler(async (req, res) => {
  const call = await WaiterCall.findById(req.params.id);
  if (!call) throw new AppError("Not found.", 404);
  if (call.status === "resolved") {
    return res.json({ success: true, call: format(call) });
  }

  const now = new Date();
  call.status = "resolved";
  call.resolvedAt = now;
  if (!call.responseSeconds) {
    call.responseSeconds = Math.round((now - call.createdAt) / 1000);
  }
  await call.save();
  res.json({ success: true, call: format(call) });
});

module.exports = {
  createCall,
  getCallStatus,
  cancelCall,
  listCalls,
  acknowledgeCall,
  resolveCall,
};
