const { body, param } = require("express-validator");

const inquiryIdParam = [param("id").isMongoId().withMessage("Invalid inquiry id.")];

const cateringCreateValidator = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 140 }),
  body("email").trim().isEmail().withMessage("Valid email is required.").normalizeEmail(),
  body("phone").optional({ values: "falsy" }).trim(),
  body("guests").optional({ values: "falsy" }).isInt({ min: 1 }),
  body("eventDate").trim().notEmpty().withMessage("Event date is required."),
  body("details").trim().notEmpty().withMessage("Details are required.").isLength({ max: 2000 }),
];

const franchiseCreateValidator = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 140 }),
  body("email").trim().isEmail().withMessage("Valid email is required.").normalizeEmail(),
  body("phone").optional({ values: "falsy" }).trim(),
  body("market").trim().notEmpty().withMessage("Market is required.").isLength({ max: 160 }),
  body("investment").trim().notEmpty().withMessage("Investment range is required.").isLength({ max: 120 }),
  body("background").trim().notEmpty().withMessage("Background is required.").isLength({ max: 2400 }),
];

const inquiryUpdateValidator = [
  ...inquiryIdParam,
  body("status").optional().isIn(["New", "In Review", "Contacted", "Closed"]),
  body("adminNotes").optional({ values: "falsy" }).trim(),
];

module.exports = {
  inquiryIdParam,
  cateringCreateValidator,
  franchiseCreateValidator,
  inquiryUpdateValidator,
};
