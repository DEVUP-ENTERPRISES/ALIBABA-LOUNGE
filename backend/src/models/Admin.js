const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Admin name is required."],
      trim: true,
      minlength: [2, "Admin name must be at least 2 characters."],
      maxlength: [80, "Admin name cannot exceed 80 characters."],
    },
    email: {
      type: String,
      required: [true, "Admin email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address."],
    },
    password: {
      type: String,
      required: [true, "Admin password is required."],
      minlength: [8, "Password must be at least 8 characters."],
      select: false,
    },
    // super-admin  full access, manages staff
    // admin        back office: menu, events, settings
    // manager      floor oversight: all orders, reassign, close
    // server       works the floor: claim and serve orders only
    role: {
      type: String,
      enum: ["super-admin", "admin", "manager", "server"],
      default: "admin",
      index: true,
    },
    // Shown to the floor instead of the full name.
    displayName: { type: String, trim: true, maxlength: 60, default: "" },
    phone: { type: String, trim: true, maxlength: 40, default: "" },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

adminSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

adminSchema.methods.toAuthJSON = function toAuthJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Admin", adminSchema);
