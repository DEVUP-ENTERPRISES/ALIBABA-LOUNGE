const Reservation = require("../models/Reservation");
const Menu = require("../models/Menu");
const Event = require("../models/Event");
const { asyncHandler } = require("../utils/asyncHandler");
const { formatReservation } = require("../services/formatters");

const getDashboardStats = asyncHandler(async (_req, res) => {
  const [
    reservations,
    pendingBookings,
    confirmedReservations,
    menuItems,
    upcomingEvents,
    recentReservations,
  ] = await Promise.all([
    Reservation.countDocuments(),
    Reservation.countDocuments({ status: "pending" }),
    Reservation.countDocuments({ status: "confirmed" }),
    Menu.countDocuments(),
    Event.countDocuments({ status: "Published" }),
    Reservation.find().sort("-createdAt").limit(5),
  ]);

  const activityFeed = [
    ...recentReservations.map((item) => ({
      id: item._id.toString(),
      text: `New reservation from ${item.name}`,
      time: item.createdAt,
      type: "reservation",
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 8)
    .map((item) => ({
      ...item,
      time: new Date(item.time).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));

  res.json({
    success: true,
    stats: {
      reservations,
      pendingBookings,
      confirmedReservations,
      menuItems,
      upcomingEvents,
    },
    recentReservations: recentReservations.map(formatReservation),
    activityFeed,
  });
});

module.exports = {
  getDashboardStats,
};
