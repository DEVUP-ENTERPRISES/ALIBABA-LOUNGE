const { body } = require("express-validator");

// Only these fields may be written through the settings API.
const SETTING_FIELDS = [
  "brandName",
  "tagline",
  "description",
  "phone",
  "location",
  "email",
  "instagram",
  "instagramUrl",
  "hoursSunThu",
  "hoursFriSat",
  "eventsBanner",
  "cateringBanner",
];

const settingUpdateValidator = [
  body("brandName").optional().trim().notEmpty().isLength({ max: 140 }),
  body("tagline").optional().trim().isLength({ max: 200 }),
  body("description").optional().trim().isLength({ max: 500 }),
  body("phone").optional().trim().isLength({ max: 40 }),
  body("location").optional().trim().isLength({ max: 140 }),
  body("email").optional({ values: "falsy" }).trim().isEmail().withMessage("Invalid email address."),
  body("instagram").optional().trim().isLength({ max: 80 }),
  body("instagramUrl")
    .optional({ values: "falsy" })
    .trim()
    .isURL()
    .withMessage("Invalid Instagram URL."),
  body("hoursSunThu").optional().trim().isLength({ max: 80 }),
  body("hoursFriSat").optional().trim().isLength({ max: 80 }),
  body("eventsBanner").optional({ values: "falsy" }).trim(),
  body("cateringBanner").optional({ values: "falsy" }).trim(),
];

module.exports = {
  SETTING_FIELDS,
  settingUpdateValidator,
};
