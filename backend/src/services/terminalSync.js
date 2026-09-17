const TerminalOrder = require("../models/TerminalOrder");
const Table = require("../models/Table");
const Order = require("../models/Order");
const clover = require("./clover");
const floorState = require("./floorState");

/**
 * Mirror the Clover terminal into our floor view.
 *
 * Orders rung up on the terminal never touch the website, so without this the
 * admin page sits empty through a busy night while the venue is full. This
 * pulls them in read-only: the terminal remains the source of truth and
 * nothing here writes back.
 *
 * Runs on a timer rather than webhooks because a webhook needs this server to
 * be publicly reachable and registered with Clover. Polling works the same on
 * a laptop as on Render, and a missed poll is self-correcting where a missed
 * webhook is gone for good.
 */

const POLL_MS = Number(process.env.CLOVER_POLL_MS || 20000);

let timer = null;
let running = false;
let lastRun = null;
let lastError = "";
let lastCount = 0;

/**
 * Tabs we pushed ourselves, keyed by Clover's id.
 *
 * They come back from every poll like any other order. Mirroring them into
 * TerminalOrder would double every web order on the floor view — once as our
 * Order, again as a mirrored tab — so they never become a TerminalOrder. But
 * the poll is the only way we learn what happened to them afterwards: when a
 * card gets charged at the till, Clover does not tell us, we have to notice
 * paymentState change on the next pass. Skipping them outright, as this used
 * to, meant a guest could pay in full and the app would never know.
 */
async function ownOrdersByCloverId() {
  const ours = await Order.find({ "clover.orderId": { $ne: null } })
    .select("clover.orderId clover.paymentState")
    .lean();
  return new Map(ours.map((o) => [o.clover.orderId, o]));
}

async function syncOnce() {
  if (!clover.isConfigured()) return { skipped: true, reason: "not configured" };
  if (running) return { skipped: true, reason: "already running" };

  running = true;
  try {
    const { orders } = await clover.fetchRecentOrders(50);
    const ourOrders = await ownOrdersByCloverId();

    // Resolve table codes to real tables in one query rather than per order.
    const codes = [...new Set(orders.map((o) => o.tableCode).filter(Boolean))];
    const tables = await Table.find({ code: { $in: codes } }).select("code").lean();
    const tableByCode = new Map(tables.map((t) => [t.code, t._id]));

    let upserted = 0;
    let paymentsSeen = 0;
    for (const o of orders) {
      const ours = ourOrders.get(o.cloverOrderId);
      if (ours) {
        // Not a mirror — but check whether the till has marked it paid since
        // we last looked.
        if (o.paymentState && o.paymentState !== ours.clover?.paymentState) {
          const paid = o.paymentState === "PAID" || o.state === "locked";
          await Order.updateOne(
            { _id: ours._id },
            {
              $set: {
                "clover.paymentState": o.paymentState,
                ...(paid ? { "clover.paidAt": new Date() } : {}),
              },
            }
          );
          paymentsSeen++;
        }
        continue;
      }

      await TerminalOrder.updateOne(
        { cloverOrderId: o.cloverOrderId },
        {
          $set: {
            ...o,
            table: tableByCode.get(o.tableCode) || null,
            lastSeenAt: new Date(),
          },
        },
        { upsert: true }
      );
      upserted++;
    }

    // Put the floor plan back in step with the till. A tab opened on the
    // terminal has to take its table out of circulation everywhere — the
    // website's table picker and the booking form both read Table.status —
    // and a tab that just closed has to hand it back.
    const touched = new Set();
    for (const o of orders) {
      const id = tableByCode.get(o.tableCode);
      if (id) touched.add(String(id));
    }
    for (const id of touched) await floorState.reconcileTable(id);

    lastRun = new Date();
    lastError = "";
    lastCount = upserted;
    return {
      skipped: false,
      upserted,
      paymentsSeen,
      seen: orders.length,
      tablesReconciled: touched.size,
    };
  } catch (err) {
    lastError = String(err.message || err).slice(0, 400);
    console.error(`[clover-sync] ${lastError}`);
    return { skipped: false, error: lastError };
  } finally {
    running = false;
  }
}

function start() {
  if (timer || !clover.isConfigured()) {
    if (!clover.isConfigured()) {
      console.log("[clover-sync] not configured — terminal mirror is off");
    }
    return;
  }
  console.log(`[clover-sync] mirroring the terminal every ${POLL_MS / 1000}s`);
  // A first pass immediately, so a restart does not leave the floor blank
  // for a whole interval.
  void syncOnce();
  timer = setInterval(() => void syncOnce(), POLL_MS);
  // Never hold the process open on this alone.
  if (timer.unref) timer.unref();
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

/** For the admin panel: is the mirror actually alive? */
function status() {
  return {
    configured: clover.isConfigured(),
    running: Boolean(timer),
    pollMs: POLL_MS,
    lastRun,
    lastError,
    lastCount,
  };
}

module.exports = { syncOnce, start, stop, status };
