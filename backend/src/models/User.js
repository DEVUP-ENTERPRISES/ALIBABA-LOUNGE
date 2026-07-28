const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
      default: "",
    },
    photoURL: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      enum: ["google", "password", "mixed"],
      default: "password",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

userSchema.methods.toProfileJSON = function () {
  return {
    id: this._id,
    firebaseUid: this.firebaseUid,
    email: this.email,
    displayName: this.displayName,
    photoURL: this.photoURL,
    provider: this.provider,
    phone: this.phone,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
