const Admin = require("../models/Admin");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");
const { buildPagination, paginationPayload } = require("../utils/query");

function formatAdmin(admin) {
  return admin.toAuthJSON ? admin.toAuthJSON() : {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    isActive: admin.isActive,
    lastLoginAt: admin.lastLoginAt,
  };
}

const createAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.create(req.body);
  res.status(201).json({ success: true, admin: formatAdmin(admin) });
});

const listAdmins = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};
  if (req.query.search) filter.$or = [
    { name: new RegExp(req.query.search, "i") },
    { email: new RegExp(req.query.search, "i") },
  ];

  const [admins, total] = await Promise.all([
    Admin.find(filter).sort("name").skip(skip).limit(limit),
    Admin.countDocuments(filter),
  ]);

  res.json({
    success: true,
    admins: admins.map(formatAdmin),
    pagination: paginationPayload({ page, limit, total }),
  });
});

const updateAdmin = asyncHandler(async (req, res) => {
  const { password, ...payload } = req.body;
  const admin = await Admin.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });
  if (!admin) throw new AppError("Admin not found.", 404);
  res.json({ success: true, admin: formatAdmin(admin) });
});

const resetPassword = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id).select("+password");
  if (!admin) throw new AppError("Admin not found.", 404);
  admin.password = req.body.password;
  await admin.save();
  res.json({ success: true, message: "Password reset successfully." });
});

const changePassword = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id).select("+password");
  if (!(await admin.comparePassword(req.body.currentPassword))) {
    throw new AppError("Current password is incorrect.", 400);
  }
  admin.password = req.body.newPassword;
  await admin.save();
  res.json({ success: true, message: "Password changed successfully." });
});

module.exports = {
  createAdmin,
  listAdmins,
  updateAdmin,
  resetPassword,
  changePassword,
};
