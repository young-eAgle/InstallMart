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

const fullscreenTakeoverBanner = {
  title: "Welcome to Our Store!",
  subtitle: "🌟 Amazing Deals Await",
  description:
    "Enjoy exclusive discounts and flexible payment plans on all electronics",
  image_url:
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200",
  link: "/products",
  buttonText: "Start Shopping",
  type: "splash",
  position: 1,
  isActive: true,
  backgroundColor: "#1e40af",
  textColor: "#ffffff",
};

async function createFullscreenTakeover() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("📦 Connected to MongoDB");

    // Create fullscreen takeover banner
    const createdBanner = await Banner.create(fullscreenTakeoverBanner);
    console.log(`✅ Created fullscreen takeover banner: ${createdBanner.title}`);

    console.log("\n🎉 Fullscreen takeover banner creation completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating fullscreen takeover banner:", error);
    process.exit(1);
  }
}

createFullscreenTakeover();