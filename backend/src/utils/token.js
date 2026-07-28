const jwt = require("jsonwebtoken");

const env = require("../config/env");
const { AppError } = require("./AppError");

function signToken(admin) {
  return jwt.sign(
    {
      sub: admin._id.toString(),
      role: admin.role,
    },
    env.jwt.secret,
    {
      expiresIn: env.jwt.expiresIn,
    }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, env.jwt.secret);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError("Authentication token has expired.", 401);
    }

    throw new AppError("Invalid authentication token.", 401);
  }
}

module.exports = {
  signToken,
  verifyToken,
};
