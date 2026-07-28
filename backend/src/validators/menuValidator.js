const { body, param, query } = require("express-validator");

const menuIdParam = [param("id").isMongoId().withMessage("Invalid menu item id.")];

const menuPayloadValidator = [
  body("title").trim().notEmpty().withMessage("Title is required.").isLength({ max: 140 }),
  body("description").trim().notEmpty().withMessage("Description is required.").isLength({ max: 1200 }),
  body("category").isIn(["food", "hookah", "drinks", "desserts"]).withMessage("Invalid category."),
  body("subcategory").optional({ values: "falsy" }).trim(),
  body("price").isFloat({ min: 0 }).withMessage("Price must be zero or greater."),
  body("image").optional({ values: "falsy" }).trim(),
  body("isAvailable").optional().isBoolean(),
  body("featured").optional().isBoolean(),
  body("layout").optional().isIn(["default", "wide"]),
  body("tags").optional().isArray(),
  body("tags.*").optional().isIn(["Popular", "Staff Pick", "Customer Fav", "New"]),
];

const menuUpdateValidator = [
  ...menuIdParam,
  body("title").optional().trim().notEmpty().isLength({ max: 140 }),
  body("description").optional().trim().notEmpty().isLength({ max: 1200 }),
  body("category").optional().isIn(["food", "hookah", "drinks", "desserts"]),
  body("subcategory").optional({ values: "falsy" }).trim(),
  body("price").optional().isFloat({ min: 0 }),
  body("image").optional().trim().notEmpty(),
  body("isAvailable").optional().isBoolean(),
  body("featured").optional().isBoolean(),
  body("layout").optional().isIn(["default", "wide"]),
  body("tags").optional().isArray(),
  body("tags.*").optional().isIn(["Popular", "Staff Pick", "Customer Fav", "New"]),
];

const menuListValidator = [
  query("category").optional().isIn(["food", "hookah", "drinks", "desserts"]),
  query("isAvailable").optional().isBoolean(),
];

module.exports = {
  menuIdParam,
  menuPayloadValidator,
  menuUpdateValidator,
  menuListValidator,
};
