const { body } = require("express-validator");

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .normalizeEmail(),
  body("password")
    .isString()
    .withMessage("Password is required.")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters."),
  body("rememberMe")
    .optional()
    .isBoolean()
    .withMessage("Remember me must be true or false."),
];

module.exports = {
  loginValidator,
};
