import mongoose from "mongoose";
import dotenv from "dotenv";
import { markOverdueInstallments } from "../src/utils/scheduler.js";

dotenv.config();

async function testOverdue() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    
    console.log("Running overdue installments check...");
    await markOverdueInstallments();
    
    process.exit(0);
  } catch (error) {
    console.error("Error running overdue check:", error);
    process.exit(1);
  }
}

testOverdue();