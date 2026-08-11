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
      "Best hookah in Dallas, hands down. The clouds, the setup, the vibe — nothing else comes close.",
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
    role: "Weekly Regular",
    quote:
      "The house mixes are why we keep coming back. Staff actually know their tobacco.",
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
    role: "Hookah Lover",
    quote:
      "Fresh fruit heads are unreal. Ordered the watermelon and it lasted the whole night.",
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
        phone: "+1 (469) 586-5437",
        location: "Dallas, TX",
        email: "alibabahookah2238@gmail.com",
        instagram: "@alibabahookahlounge",
        instagramUrl: "https://instagram.com/alibabahookahlounge",
        hoursSunThu: "1 PM – 2 AM",
        hoursFriSat: "1 PM – 4 AM",
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
