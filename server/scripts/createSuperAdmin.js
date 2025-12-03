import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../src/models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: "superadmin" });
    if (existingSuperAdmin) {
      console.log("❌ Super Admin already exists:");
      console.log(`Email: ${existingSuperAdmin.email}`);
      console.log(`Name: ${existingSuperAdmin.fullName}`);
      process.exit(0);
    }

    // Get super admin credentials from environment variables or use defaults
    const email = process.env.SUPER_ADMIN_EMAIL || "admin@example.com";
    const password = process.env.SUPER_ADMIN_PASSWORD || "Admin@123";
    const fullName = process.env.SUPER_ADMIN_NAME || "Super Administrator";

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create super admin user
    const superAdmin = new User({
      fullName,
      email,
      password: hashedPassword,
      role: "superadmin",
    });

    await superAdmin.save();
    console.log("✅ Super Admin created successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Name: ${fullName}`);

    process.exit(0);
  } catch (error) {
    console.error("Error creating Super Admin:", error);
    process.exit(1);
  }
}

createSuperAdmin();