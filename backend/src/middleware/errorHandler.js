const env = require("../config/env");
const { AppError } = require("../utils/AppError");

function normalizeError(error) {
  if (error instanceof AppError) {
    return error;
  }

  if (error.name === "CastError") {
    return new AppError("Invalid resource identifier.", 400);
  }

  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map((err) => err.message)
      .join(", ");
    return new AppError(message || "Validation failed.", 400);
  }

  if (error.code === 11000) {
    return new AppError("Duplicate field value entered.", 409);
  }

  return new AppError("Internal server error.", 500, false);
}

function errorHandler(error, _req, res, _next) {
  const normalizedError = normalizeError(error);
  const statusCode = normalizedError.statusCode || 500;

  if (!normalizedError.isOperational) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message: normalizedError.message,
    ...(env.isDevelopment && {
      stack: error.stack,
    }),
  });
}

module.exports = {
  errorHandler,
};
