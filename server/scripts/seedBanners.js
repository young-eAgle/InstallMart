import mongoose from "mongoose";
import dotenv from "dotenv";
import { Banner } from "../src/models/Banner.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory (mart/server/.env)
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("🔍 Looking for .env at:", path.join(__dirname, "../.env"));
console.log("📊 MONGODB_URI exists:", !!process.env.MONGODB_URI);

const banners = [
  {
    title: "Winter Sale 2024",
    subtitle: "❄️ Exclusive Winter Collection",
    description:
      "Get up to 50% off on selected electronics. Limited time offer!",
    image_url:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800",
    link: "/products",
    buttonText: "Shop Now",
    type: "hero",
    position: 1,
    isActive: true,
    backgroundColor: "#1e40af",
    textColor: "#ffffff",
  },
  {
    title: "Home Appliances",
    subtitle: "🏠 Smart Living Starts Here",
    description:
      "Discover the latest in home technology with easy installments",
    image_url:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    link: "/products?category=home-appliances",
    buttonText: "Browse Collection",
    type: "hero",
    position: 2,
    isActive: true,
    backgroundColor: "#7c3aed",
    textColor: "#ffffff",
  },
  {
    title: "New Arrivals",
    subtitle: "Latest Tech Gadgets",
    description: "Be the first to own the newest electronics",
    image_url:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    link: "/products",
    buttonText: "Explore",
    type: "promotional",
    position: 1,
    isActive: true,
    backgroundColor: "#dc2626",
    textColor: "#ffffff",
  },
  {
    title: "Gaming Zone",
    subtitle: "Level Up Your Game",
    description: "Premium gaming accessories",
    image_url:
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600",
    link: "/products?category=gaming",
    buttonText: "Shop Gaming",
    type: "promotional",
    position: 2,
    isActive: true,
    backgroundColor: "#059669",
    textColor: "#ffffff",
  },
];

async function seedBanners() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("📦 Connected to MongoDB");

    // Clear existing banners
    await Banner.deleteMany({});
    console.log("🗑️  Cleared existing banners");

    // Insert new banners
    const createdBanners = await Banner.insertMany(banners);
    console.log(`✅ Created ${createdBanners.length} banners`);

    console.log("\n🎉 Banner seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding banners:", error);
    process.exit(1);
  }
}

seedBanners();
