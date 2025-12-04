import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../src/models/User.js";

dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    
    const users = await User.find();
    console.log("Users in database:");
    users.forEach(u => {
      console.log(`- ${u.fullName} (${u.email}) - ${u.role}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error checking users:", error);
    process.exit(1);
  }
}

checkUsers();