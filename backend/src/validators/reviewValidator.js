const { body, param, query } = require("express-validator");

const reviewIdParam = [param("id").isMongoId().withMessage("Invalid review id.")];

const reviewListValidator = [
  query("featured").optional().isIn(["true", "false"]),
  query("approved").optional().isIn(["true", "false"]),
  query("all").optional().isIn(["true", "false"]),
];

const reviewPayloadValidator = [
  body("author").trim().notEmpty().withMessage("Author is required.").isLength({ max: 120 }),
  body("quote").trim().notEmpty().withMessage("Quote is required.").isLength({ max: 1000 }),
  body("role").optional().trim().isLength({ max: 120 }),
  body("stars").optional().isInt({ min: 1, max: 5 }).withMessage("Stars must be between 1 and 5."),
  body("initial").optional().trim().isLength({ max: 5 }),
  body("isFeatured").optional().isBoolean(),
  body("isApproved").optional().isBoolean(),
];

const reviewUpdateValidator = [
  ...reviewIdParam,
  body("author").optional().trim().notEmpty().isLength({ max: 120 }),
  body("quote").optional().trim().notEmpty().isLength({ max: 1000 }),
  body("role").optional().trim().isLength({ max: 120 }),
  body("stars").optional().isInt({ min: 1, max: 5 }),
  body("initial").optional().trim().isLength({ max: 5 }),
  body("isFeatured").optional().isBoolean(),
  body("isApproved").optional().isBoolean(),
];

module.exports = {
  reviewIdParam,
  reviewListValidator,
  reviewPayloadValidator,
  reviewUpdateValidator,
};
