const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");
const { AppError } = require("../utils/AppError");

/**
 * POST /api/users/sync
 * Called by client immediately after Firebase sign-in.
 * Upserts user record in MongoDB, returns profile.
 */
const syncUser = asyncHandler(async (req, res) => {
  const { uid, email, name, picture, firebase } = req.firebaseUser;

  const provider =
    firebase?.sign_in_provider === "google.com" ? "google" : "password";

  const user = await User.findOneAndUpdate(
    { firebaseUid: uid },
    {
      $set: {
        email: email || "",
        displayName: name || req.body.displayName || "",
        photoURL: picture || "",
        lastLoginAt: new Date(),
      },
      $setOnInsert: { provider },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({ success: true, user: user.toProfileJSON() });
});

/**
 * GET /api/users/me
 * Returns the authenticated user's MongoDB profile.
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.firebaseUser.uid });
  if (!user) throw new AppError("User profile not found. Please sync first.", 404);
  res.status(200).json({ success: true, user: user.toProfileJSON() });
});

/**
 * PUT /api/users/me
 * Update display name and phone.
 */
const updateMe = asyncHandler(async (req, res) => {
  const { displayName, phone } = req.body;

  const allowed = {};
  if (displayName !== undefined) allowed.displayName = String(displayName).trim().slice(0, 80);
  if (phone !== undefined) allowed.phone = String(phone).trim().slice(0, 20);

  const user = await User.findOneAndUpdate(
    { firebaseUid: req.firebaseUser.uid },
    { $set: allowed },
    { new: true }
  );

  if (!user) throw new AppError("User not found.", 404);
  res.status(200).json({ success: true, user: user.toProfileJSON() });
});

/**
 * DELETE /api/users/me
 * Soft-delete: removes MongoDB record (Firebase account stays — handled client-side).
 */
const deleteMe = asyncHandler(async (req, res) => {
  await User.findOneAndDelete({ firebaseUid: req.firebaseUser.uid });
  res.status(200).json({ success: true, message: "Account deleted." });
});

/**
 * GET /api/users — admin only
 * Returns paginated user list.
 */
const listAllUsers = asyncHandler(async (req, res) => {
  const page  = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const skip  = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    users: users.map((u) => u.toProfileJSON()),
  });
});

module.exports = { syncUser, getMe, updateMe, deleteMe, listAllUsers };
