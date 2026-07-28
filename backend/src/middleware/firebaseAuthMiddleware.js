const admin = require("../config/firebase");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");

/**
 * Verifies Firebase ID token from Authorization: Bearer <token> header.
 * Attaches decoded token to req.firebaseUser.
 */
const firebaseAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Authorization token is required.", 401);
  }

  const idToken = header.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.firebaseUser = decoded;
    next();
  } catch {
    throw new AppError("Invalid or expired authentication token.", 401);
  }
});

/**
 * Optional auth — attaches user if token present, but never blocks.
 */
const firebaseAuthOptional = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      const decoded = await admin.auth().verifyIdToken(header.split(" ")[1]);
      req.firebaseUser = decoded;
    } catch {
      // token invalid — continue as anonymous
    }
  }
  next();
});

module.exports = { firebaseAuth, firebaseAuthOptional };
