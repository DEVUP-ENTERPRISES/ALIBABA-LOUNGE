const { validationResult } = require("express-validator");

const { AppError } = require("../utils/AppError");

function validateRequest(req, _res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const message = result
    .array()
    .map((error) => error.msg)
    .join(" ");

  return next(new AppError(message || "Invalid request payload.", 400));
}

module.exports = {
  validateRequest,
};
