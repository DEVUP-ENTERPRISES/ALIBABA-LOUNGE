const { body, param, query } = require("express-validator");

const idParam = [param("id").isMongoId().withMessage("Invalid reservation id.")];

const reservationCreateValidator = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 120 }),
  body("email").trim().isEmail().withMessage("Valid email is required.").normalizeEmail(),
  body("phone").trim().notEmpty().withMessage("Phone is required.").isLength({ max: 40 }),
  body("date").trim().notEmpty().withMessage("Date is required."),
  body("time").trim().notEmpty().withMessage("Time is required."),
  body("guests").isInt({ min: 1, max: 100 }).withMessage("Guests must be between 1 and 100."),
  body("specialRequest").optional({ values: "falsy" }).trim().isLength({ max: 1000 }),
];

const reservationUpdateValidator = [
  ...idParam,
  body("name").optional().trim().notEmpty().isLength({ max: 120 }),
  body("email").optional().trim().isEmail().normalizeEmail(),
  body("phone").optional().trim().notEmpty().isLength({ max: 40 }),
  body("date").optional().trim().notEmpty(),
  body("time").optional().trim().notEmpty(),
  body("guests").optional().isInt({ min: 1, max: 100 }),
  body("specialRequest").optional({ values: "falsy" }).trim().isLength({ max: 1000 }),
  body("status").optional().isIn(["pending", "confirmed", "cancelled"]),
];

const reservationListValidator = [
  query("status").optional().isIn(["pending", "confirmed", "cancelled", "Pending", "Approved", "Rejected"]),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  idParam,
  reservationCreateValidator,
  reservationUpdateValidator,
  reservationListValidator,
};
