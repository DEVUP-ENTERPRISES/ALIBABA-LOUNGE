const Reservation = require("../models/Reservation");
const Menu = require("../models/Menu");
const Event = require("../models/Event");
const CateringInquiry = require("../models/CateringInquiry");
const FranchiseApplication = require("../models/FranchiseApplication");
const { asyncHandler } = require("../utils/asyncHandler");
const { formatReservation, formatInquiry } = require("../services/formatters");

const getDashboardStats = asyncHandler(async (_req, res) => {
  const [
    reservations,
    pendingBookings,
    confirmedReservations,
    cateringInquiries,
    franchiseApplications,
    menuItems,
    upcomingEvents,
    recentReservations,
    recentCatering,
    recentFranchise,
  ] = await Promise.all([
    Reservation.countDocuments(),
    Reservation.countDocuments({ status: "pending" }),
    Reservation.countDocuments({ status: "confirmed" }),
    CateringInquiry.countDocuments(),
    FranchiseApplication.countDocuments(),
    Menu.countDocuments(),
    Event.countDocuments({ status: "Published" }),
    Reservation.find().sort("-createdAt").limit(5),
    CateringInquiry.find().sort("-createdAt").limit(3),
    FranchiseApplication.find().sort("-createdAt").limit(3),
  ]);

  const activityFeed = [
    ...recentReservations.map((item) => ({
      id: item._id.toString(),
      text: `New reservation from ${item.name}`,
      time: item.createdAt,
      type: "reservation",
    })),
    ...recentCatering.map((item) => ({
      id: item._id.toString(),
      text: `Catering inquiry - ${item.name}`,
      time: item.createdAt,
      type: "catering",
    })),
    ...recentFranchise.map((item) => ({
      id: item._id.toString(),
      text: `Franchise application - ${item.market}`,
      time: item.createdAt,
      type: "franchise",
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
      cateringInquiries,
      franchiseApplications,
      menuItems,
      upcomingEvents,
    },
    recentReservations: recentReservations.map(formatReservation),
    recentCatering: recentCatering.map(formatInquiry),
    recentFranchise: recentFranchise.map(formatInquiry),
    activityFeed,
  });
});

module.exports = {
  getDashboardStats,
};
