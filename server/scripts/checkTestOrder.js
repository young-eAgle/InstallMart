import mongoose from "mongoose";
import dotenv from "dotenv";
import { Order } from "../src/models/Order.js";

dotenv.config();

async function checkTestOrder() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    
    const order = await Order.findById('6931528414b08f22d30c250d');
    console.log("Test Order Installments:");
    order.installments.forEach((inst, index) => {
      console.log(`${index + 1}. Rs. ${inst.amount} - ${inst.status} - Due: ${new Date(inst.dueDate).toLocaleDateString()}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error checking test order:", error);
    process.exit(1);
  }
}

checkTestOrder();