const { body, param } = require("express-validator");

const eventIdParam = [param("id").isMongoId().withMessage("Invalid event id.")];

const eventPayloadValidator = [
  body("title").trim().notEmpty().withMessage("Title is required.").isLength({ max: 160 }),
  body("description").optional({ values: "falsy" }).trim().isLength({ max: 1600 }),
  body("date").trim().notEmpty().withMessage("Date is required."),
  body("time").trim().notEmpty().withMessage("Time is required."),
  body("location").trim().notEmpty().withMessage("Location is required.").isLength({ max: 180 }),
  body("category").optional({ values: "falsy" }).trim(),
  body("image").optional({ values: "falsy" }).trim(),
  body("bannerImage").optional({ values: "falsy" }).trim(),
  body("featured").optional().isBoolean(),
  body("status").optional().isIn(["Draft", "Published", "Archived"]),
];

const eventUpdateValidator = [
  ...eventIdParam,
  body("title").optional().trim().notEmpty().isLength({ max: 160 }),
  body("description").optional({ values: "falsy" }).trim().isLength({ max: 1600 }),
  body("date").optional().trim().notEmpty(),
  body("time").optional().trim().notEmpty(),
  body("location").optional().trim().notEmpty().isLength({ max: 180 }),
  body("category").optional({ values: "falsy" }).trim(),
  body("image").optional().trim().notEmpty(),
  body("bannerImage").optional({ values: "falsy" }).trim(),
  body("featured").optional().isBoolean(),
  body("status").optional().isIn(["Draft", "Published", "Archived"]),
];

module.exports = {
  eventIdParam,
  eventPayloadValidator,
  eventUpdateValidator,
};
