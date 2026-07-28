const { body, param } = require("express-validator");

const galleryIdParam = [param("id").isMongoId().withMessage("Invalid gallery id.")];

const galleryPayloadValidator = [
  body("title").trim().notEmpty().withMessage("Title is required.").isLength({ max: 140 }),
  body("url").optional({ values: "falsy" }).trim(),
  body("category").optional().isIn(["Food", "Drinks", "Hookah", "Ambiance", "Events", "Desserts"]),
  body("tags").optional().isArray(),
  body("isPublished").optional().isBoolean(),
];

const galleryUpdateValidator = [
  ...galleryIdParam,
  body("title").optional().trim().notEmpty().isLength({ max: 140 }),
  body("url").optional({ values: "falsy" }).trim(),
  body("category").optional().isIn(["Food", "Drinks", "Hookah", "Ambiance", "Events", "Desserts"]),
  body("tags").optional().isArray(),
  body("isPublished").optional().isBoolean(),
];

module.exports = {
  galleryIdParam,
  galleryPayloadValidator,
  galleryUpdateValidator,
};
