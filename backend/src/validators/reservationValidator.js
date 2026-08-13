const { body, param, query } = require("express-validator");

const idParam = [param("id").isMongoId().withMessage("Invalid reservation id.")];

/**
 * Reject dates that have already been and gone.
 *
 * Compared as plain YYYY-MM-DD strings against the venue's own day rather
 * than via Date parsing, which would drag the server's timezone into a
 * decision that belongs to Dallas.
 */
function notInThePast(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Use a date in YYYY-MM-DD form.");
  }
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
  }).format(new Date());
  if (value < today) throw new Error("That date has already passed.");
  return true;
}

const reservationCreateValidator = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 120 }),
  body("email").trim().isEmail().withMessage("Valid email is required.").normalizeEmail(),
  body("phone").trim().notEmpty().withMessage("Phone is required.").isLength({ max: 40 }),
  body("date").trim().notEmpty().withMessage("Date is required.").custom(notInThePast),
  body("time")
    .trim()
    .notEmpty()
    .withMessage("Time is required.")
    .matches(/^([01]?\d|2[0-3]):[0-5]\d$/)
    .withMessage("Use a time like 20:00."),
  body("guests").isInt({ min: 1, max: 100 }).withMessage("Guests must be between 1 and 100."),
  body("specialRequest").optional({ values: "falsy" }).trim().isLength({ max: 1000 }),
];

// Status and table are deliberately absent: both move the floor plan and have
// their own endpoints, which run the clash and capacity checks.
const reservationUpdateValidator = [
  ...idParam,
  body("name").optional().trim().notEmpty().isLength({ max: 120 }),
  body("email").optional().trim().isEmail().normalizeEmail(),
  body("phone").optional().trim().notEmpty().isLength({ max: 40 }),
  body("date").optional().trim().notEmpty(),
  body("time").optional().trim().notEmpty(),
  body("guests").optional().isInt({ min: 1, max: 100 }),
  body("specialRequest").optional({ values: "falsy" }).trim().isLength({ max: 1000 }),
];

const reservationListValidator = [
  query("status")
    .optional()
    .isIn([
      "pending",
      "confirmed",
      "seated",
      "completed",
      "cancelled",
      "no-show",
      "Pending",
      "Approved",
      "Rejected",
    ]),
  query("date").optional().trim().notEmpty(),
  query("page").optional().isInt({ min: 1 }),
  // Matches buildPagination's ceiling; the admin table requests 500.
  query("limit").optional().isInt({ min: 1, max: 500 }),
];

module.exports = {
  idParam,
  reservationCreateValidator,
  reservationUpdateValidator,
  reservationListValidator,
};
