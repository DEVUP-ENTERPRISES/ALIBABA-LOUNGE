const Order = require("../models/Order");
const { asyncHandler } = require("../utils/asyncHandler");

/**
 * Platform billing.
 *
 * A flat $1 per completed order. It is never added to the guest's bill — it
 * is what the venue settles with us at the end of the month.
 *
 * The figure is derived from the orders themselves rather than a running
 * counter, so it can always be reconciled against the order list and cannot
 * drift if something is cancelled or replayed.
 */

const FEE_PER_ORDER = 1;

function monthWindow(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
  return { start, end };
}

const getPlatformBilling = asyncHandler(async (req, res) => {
  const { start, end } = monthWindow(0);
  const { start: prevStart, end: prevEnd } = monthWindow(1);

  const [thisMonth, lastMonth, allTime, recent] = await Promise.all([
    Order.countDocuments({ status: "completed", completedAt: { $gte: start, $lt: end } }),
    Order.countDocuments({ status: "completed", completedAt: { $gte: prevStart, $lt: prevEnd } }),
    Order.countDocuments({ status: "completed" }),
    Order.find({ status: "completed" })
      .sort({ completedAt: -1 })
      .limit(8)
      .select("orderNumber tableCode total completedAt")
      .lean(),
  ]);

  // Daily counts for the current month, so the owner can see the shape of it.
  const daily = await Order.aggregate([
    { $match: { status: "completed", completedAt: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$completedAt", timezone: "America/Chicago" },
        },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    feePerOrder: FEE_PER_ORDER,
    currency: "USD",
    period: {
      label: start.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      start,
      end,
    },
    thisMonth: { orders: thisMonth, amount: thisMonth * FEE_PER_ORDER },
    lastMonth: { orders: lastMonth, amount: lastMonth * FEE_PER_ORDER },
    allTime: { orders: allTime, amount: allTime * FEE_PER_ORDER },
    daily: daily.map((d) => ({ date: d._id, orders: d.orders, amount: d.orders * FEE_PER_ORDER })),
    recent: recent.map((o) => ({
      orderNumber: o.orderNumber,
      tableCode: o.tableCode,
      total: o.total,
      completedAt: o.completedAt,
      fee: FEE_PER_ORDER,
    })),
  });
});

module.exports = { getPlatformBilling };
