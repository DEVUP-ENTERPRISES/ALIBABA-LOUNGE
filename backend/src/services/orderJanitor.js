const Order = require("../models/Order");
const AuditLog = require("../models/AuditLog");
const clover = require("./clover");
const floorState = require("./floorState");

/**
 * Closes off tabs nobody ever closed.
 *
 * A tab left open holds its table out of service forever — the floor plan,
 * the website's table picker and the booking form all read that table as
 * occupied, so one forgotten order can cost a table every night until someone
 * notices. There are already two such tabs in the live Clover data, one of
 * them a month old, which is how we know this happens in practice.
 *
 * Every close is written to the audit log with the amount, because a tab
 * disappearing on its own is exactly the kind of thing that needs explaining
 * the next morning.
 */

/** Long enough that no real service is ever caught by it. */
const MAX_OPEN_MINUTES = Number(process.env.ORDER_MAX_OPEN_MINUTES || 500);
const SWEEP_MS = Number(process.env.ORDER_SWEEP_MS || 5 * 60 * 1000);

const OPEN_STATUSES = ["placed", "accepted", "preparing", "served"];

let timer = null;
let running = false;
let lastRun = null;
let lastCancelled = 0;

async function sweepOnce() {
  if (running) return { skipped: true, reason: "already running" };
  running = true;

  try {
    const cutoff = new Date(Date.now() - MAX_OPEN_MINUTES * 60 * 1000);
    const stale = await Order.find({
      status: { $in: OPEN_STATUSES },
      placedAt: { $lt: cutoff },
    });

    let cancelled = 0;
    for (const order of stale) {
      const minutesOpen = Math.round((Date.now() - order.placedAt.getTime()) / 60000);

      order.status = "cancelled";
      order.cancelledAt = new Date();
      await order.save();

      await AuditLog.record({
        action: "order.auto-cancelled",
        orderNumber: order.orderNumber,
        order: order._id,
        tableCode: order.tableCode,
        amount: order.total,
        itemCount: order.items.length,
        reason: `Open ${minutesOpen} minutes — past the ${MAX_OPEN_MINUTES} minute limit, closed automatically.`,
        actor: { kind: "system", name: "Auto-close" },
        meta: { minutesOpen, limitMinutes: MAX_OPEN_MINUTES, placedAt: order.placedAt },
      });

      // Take the matching tab off the terminal too, or the till keeps a live
      // chargeable order for something this system has just written off.
      if (order.clover?.orderId && order.clover.state === "synced") {
        try {
          await clover.deleteOrder(order.clover.orderId);
          order.clover.state = "voided";
          await order.save();
        } catch (err) {
          console.error(`[janitor] could not void #${order.orderNumber}: ${err.message}`);
        }
      }

      await floorState.reconcileTable(order.table);
      cancelled++;
      console.log(
        `[janitor] auto-closed #${order.orderNumber} (${order.tableCode}, $${order.total.toFixed(2)}, open ${minutesOpen}m)`
      );
    }

    lastRun = new Date();
    lastCancelled = cancelled;
    return { skipped: false, cancelled, checked: stale.length };
  } catch (err) {
    console.error(`[janitor] sweep failed: ${err.message}`);
    return { skipped: false, error: err.message };
  } finally {
    running = false;
  }
}

function start() {
  if (timer) return;
  console.log(
    `[janitor] auto-closing tabs open past ${MAX_OPEN_MINUTES} minutes, checking every ${SWEEP_MS / 60000}m`
  );
  void sweepOnce();
  timer = setInterval(() => void sweepOnce(), SWEEP_MS);
  if (timer.unref) timer.unref();
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

function status() {
  return { running: Boolean(timer), maxOpenMinutes: MAX_OPEN_MINUTES, lastRun, lastCancelled };
}

module.exports = { sweepOnce, start, stop, status, MAX_OPEN_MINUTES };
