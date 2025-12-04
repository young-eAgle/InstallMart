import mongoose from "mongoose";
import dotenv from "dotenv";
import { Order } from "../src/models/Order.js";
import { User } from "../src/models/User.js";

dotenv.config();

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    
    const orders = await Order.find().populate('user').limit(5);
    console.log("Sample orders:");
    orders.forEach(order => {
      console.log(`- Order ID: ${order.id}`);
      console.log(`  User: ${order.user?.fullName || 'Unknown'}`);
      console.log(`  Total: Rs. ${order.total}`);
      console.log(`  Installments:`);
      order.installments.forEach((inst, index) => {
        console.log(`    ${index + 1}. Rs. ${inst.amount} - ${inst.status} - Due: ${inst.dueDate ? new Date(inst.dueDate).toLocaleDateString() : 'N/A'}`);
      });
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error checking orders:", error);
    process.exit(1);
  }
}

checkOrders();