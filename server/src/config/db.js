import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
// require('dotenv').config();


export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Mongo connection error:", error.message);
    process.exit(1);
  }
};

