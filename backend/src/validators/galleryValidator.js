const { body, param } = require("express-validator");


// Multipart uploads cannot carry a real array, so the admin forms send tags
// as a JSON string. Parse it back before isArray() runs, otherwise saving an
// item together with an image fails validation with "Invalid value".
const parseTags = (value) => {
  if (typeof value !== "string") return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : value;
  } catch {
    // Also tolerate a plain comma-separated list.
    return value.includes(",")
      ? value.split(",").map((v) => v.trim()).filter(Boolean)
      : [value].filter(Boolean);
  }
};

const galleryIdParam = [param("id").isMongoId().withMessage("Invalid gallery id.")];

const galleryPayloadValidator = [
  body("title").trim().notEmpty().withMessage("Title is required.").isLength({ max: 140 }),
  body("url").optional({ values: "falsy" }).trim(),
  body("category").optional().isIn(["Food", "Drinks", "Hookah", "Ambiance", "Events", "Desserts"]),
  body("tags").optional().customSanitizer(parseTags).isArray(),
  body("isPublished").optional().isBoolean(),
];

const galleryUpdateValidator = [
  ...galleryIdParam,
  body("title").optional().trim().notEmpty().isLength({ max: 140 }),
  body("url").optional({ values: "falsy" }).trim(),
  body("category").optional().isIn(["Food", "Drinks", "Hookah", "Ambiance", "Events", "Desserts"]),
  body("tags").optional().customSanitizer(parseTags).isArray(),
  body("isPublished").optional().isBoolean(),
];

module.exports = {
  galleryIdParam,
  galleryPayloadValidator,
  galleryUpdateValidator,
};
