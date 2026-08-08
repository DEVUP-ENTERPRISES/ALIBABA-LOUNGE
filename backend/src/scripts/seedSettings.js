require("dotenv").config();
const mongoose = require("mongoose");
const Setting = require("../models/Setting");
const Review = require("../models/Review");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sheesh";

const initialReviews = [
  {
    author: "Amir K.",
    role: "Regular Guest",
    quote:
      "Alibaba is Dallas's premier hookah lounge — the food, the clouds, the vibe. Nothing else comes close.",
    stars: 5,
    initial: "AK",
    isFeatured: true,
    isApproved: true,
  },
  {
    author: "Sarah M.",
    role: "Event Attendee",
    quote:
      "Voice of Alibaba had production quality you'd expect at a major venue. Season 1 can't come soon enough.",
    stars: 5,
    initial: "SM",
    isFeatured: true,
    isApproved: true,
  },
  {
    author: "James T.",
    role: "Dallas Foodie",
    quote:
      "The BBQ platter and Alibaba Mix are why we keep coming back. True luxury hospitality in Dallas.",
    stars: 5,
    initial: "JT",
    isFeatured: true,
    isApproved: true,
  },
  {
    author: "Layla R.",
    role: "Private Event Host",
    quote:
      "Brought my whole crew for a birthday — flawless service, fire hookah, and the vibes were immaculate.",
    stars: 5,
    initial: "LR",
    isFeatured: true,
    isApproved: true,
  },
  {
    author: "Marcus D.",
    role: "Food Critic",
    quote:
      "The Mediterranean spread is unlike anything else in the city. Feels like you're dining in another world.",
    stars: 5,
    initial: "MD",
    isFeatured: true,
    isApproved: true,
  },
  {
    author: "Priya N.",
    role: "Hookah Enthusiast",
    quote:
      "Premium shisha experience — smooth clouds, exotic flavors, beautiful space. A must-visit in Dallas.",
    stars: 5,
    initial: "PN",
    isFeatured: true,
    isApproved: true,
  },
];

async function seedSettingsAndReviews() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB.");

    // Seed Settings
    const existingSetting = await Setting.findOne();
    if (!existingSetting) {
      await Setting.create({
        brandName: "Alibaba Hookah Lounge",
        tagline: "Where luxury meets flavor.",
        description: "Dallas's premier hookah lounge & dining destination.",
        phone: "+1 (214) 407-7941",
        location: "Dallas, TX",
        email: "info@alibabahookahlounge.com",
        instagram: "@alibabahookahlounge",
        instagramUrl: "https://instagram.com/alibabahookahlounge",
        hoursSunThu: "11 AM – 2 AM",
        hoursFriSat: "11 AM – 3 AM",
      });
      console.log("✅ Default Site Settings created.");
    } else {
      console.log("ℹ️ Site Settings already exist.");
    }

    // Seed Reviews
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      await Review.insertMany(initialReviews);
      console.log(`✅ Inserted ${initialReviews.length} initial guest reviews.`);
    } else {
      console.log(`ℹ️ ${reviewCount} reviews already exist in DB.`);
    }

    console.log("🎉 Settings & Reviews Seeding Complete!");
  } catch (error) {
    console.error("❌ Seeding Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedSettingsAndReviews();
