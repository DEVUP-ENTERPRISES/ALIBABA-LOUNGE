const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    brandName: { type: String, default: "Alibaba Hookah Lounge", trim: true },
    tagline: { type: String, default: "Where luxury meets flavor.", trim: true },
    description: {
      type: String,
      default: "Dallas's premier hookah lounge & dining destination.",
      trim: true,
    },
    phone: { type: String, default: "+1 (469) 586-5437", trim: true },
    location: { type: String, default: "Dallas, TX", trim: true },
    email: { type: String, default: "alibabahookah2238@gmail.com", trim: true },
    instagram: { type: String, default: "@alibabahookahlounge", trim: true },
    instagramUrl: {
      type: String,
      default: "https://instagram.com/alibabahookahlounge",
      trim: true,
    },
    hoursSunThu: { type: String, default: "1 PM – 2 AM", trim: true },
    hoursFriSat: { type: String, default: "1 PM – 4 AM", trim: true },
    eventsBanner: { type: String, default: "", trim: true },
    cateringBanner: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
