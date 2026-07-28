const Admin = require("../models/Admin");
const env = require("../config/env");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");
const { signToken } = require("../utils/token");

function getCookieOptions(rememberMe = false) {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  };
}

const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!admin || !(await admin.comparePassword(password))) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!admin.isActive) {
    throw new AppError("Admin account is disabled.", 403);
  }

  admin.lastLoginAt = new Date();
  await admin.save({ validateBeforeSave: false });

  const token = signToken(admin);

  res.cookie("sheesh_admin_token", token, getCookieOptions(Boolean(rememberMe)));

  res.status(200).json({
    success: true,
    message: "Login successful.",
    token,
    admin: admin.toAuthJSON(),
  });
});

const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("sheesh_admin_token", {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
  });

  res.status(200).json({
    success: true,
    message: "Logout successful.",
  });
});

const getCurrentAdmin = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    admin: req.admin.toAuthJSON(),
  });
});

const getProtectedStatus = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Protected admin route is accessible.",
    admin: {
      id: req.admin._id,
      email: req.admin.email,
      role: req.admin.role,
    },
  });
});

module.exports = {
  login,
  logout,
  getCurrentAdmin,
  getProtectedStatus,
};
