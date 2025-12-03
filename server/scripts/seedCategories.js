import mongoose from "mongoose";
import dotenv from "dotenv";
import { Category } from "../src/models/Category.js";

dotenv.config();

const categories = [
  {
    name: "Smartphones",
    slug: "smartphones",
    icon: "Smartphone",
    color: "#FF6B6B",
    description: "Latest smartphones with easy installments",
    order: 1,
    subcategories: [
      { name: "iPhone", slug: "iphone" },
      { name: "Samsung Galaxy", slug: "samsung-galaxy" },
      { name: "OnePlus", slug: "oneplus" },
      { name: "Xiaomi", slug: "xiaomi" },
      { name: "Oppo", slug: "oppo" },
      { name: "Vivo", slug: "vivo" },
    ],
  },
  {
    name: "Laptops",
    slug: "laptops",
    icon: "Laptop",
    color: "#4ECDC4",
    description: "Gaming and business laptops",
    order: 2,
    subcategories: [
      { name: "Gaming Laptops", slug: "gaming-laptops" },
      { name: "Business Laptops", slug: "business-laptops" },
      { name: "MacBooks", slug: "macbooks" },
      { name: "Chromebooks", slug: "chromebooks" },
    ],
  },
  {
    name: "TVs & Audio",
    slug: "tv-audio",
    icon: "Tv",
    color: "#95E1D3",
    description: "Smart TVs and audio systems",
    order: 3,
    subcategories: [
      { name: "Smart TVs", slug: "smart-tvs" },
      { name: "LED TVs", slug: "led-tvs" },
      { name: "Soundbars", slug: "soundbars" },
      { name: "Home Theater", slug: "home-theater" },
    ],
  },
  {
    name: "Gaming",
    slug: "gaming",
    icon: "Gamepad2",
    color: "#A8D8EA",
    description: "Gaming consoles and accessories",
    order: 4,
    subcategories: [
      { name: "PlayStation", slug: "playstation" },
      { name: "Xbox", slug: "xbox" },
      { name: "Nintendo", slug: "nintendo" },
      { name: "Gaming Accessories", slug: "gaming-accessories" },
    ],
  },
  {
    name: "Cameras",
    slug: "cameras",
    icon: "Camera",
    color: "#FCBAD3",
    description: "Professional cameras and equipment",
    order: 5,
    subcategories: [
      { name: "DSLR Cameras", slug: "dslr-cameras" },
      { name: "Mirrorless", slug: "mirrorless" },
      { name: "Action Cameras", slug: "action-cameras" },
      { name: "Security Cameras", slug: "security-cameras" },
    ],
  },
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing categories
    await Category.deleteMany({});
    console.log("Cleared existing categories");

    // Insert new categories
    await Category.insertMany(categories);
    console.log(`✅ Successfully seeded ${categories.length} categories`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
