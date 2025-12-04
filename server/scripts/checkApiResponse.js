import mongoose from "mongoose";
import dotenv from "dotenv";
import { Order } from "../src/models/Order.js";
import { User } from "../src/models/User.js";

dotenv.config();

async function checkApiResponse() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    
    const orders = await Order.find().populate('user').limit(3);
    console.log("API Response Sample:");
    
    const response = {
      orders: orders.map(o => ({
        id: o.id,
        user: {
          id: o.user?.id,
          fullName: o.user?.fullName,
          email: o.user?.email
        },
        total: o.total,
        installmentMonths: o.installmentMonths,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        status: o.status,
        installments: o.installments.map(i => ({
          _id: i._id,
          dueDate: i.dueDate,
          amount: i.amount,
          status: i.status
        })),
        createdAt: o.createdAt
      }))
    };
    
    console.log(JSON.stringify(response, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error("Error checking API response:", error);
    process.exit(1);
  }
}

checkApiResponse();