const Admin = require("../models/Admin");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");
const { verifyToken } = require("../utils/token");

function getBearerToken(req) {
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    return header.split(" ")[1];
  }

  return req.cookies?.sheesh_admin_token ?? null;
}

const protect = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    throw new AppError("Authentication token is required.", 401);
  }

  const payload = verifyToken(token);
  const admin = await Admin.findById(payload.sub);

  if (!admin || !admin.isActive) {
    throw new AppError("Admin account is not authorized.", 401);
  }

  req.admin = admin;
  next();
});

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return next(new AppError("You do not have permission for this action.", 403));
    }

    return next();
  };
}

module.exports = {
  protect,
  requireRole,
};
