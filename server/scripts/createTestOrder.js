import mongoose from "mongoose";
import dotenv from "dotenv";
import { Order } from "../src/models/Order.js";
import { User } from "../src/models/User.js";

dotenv.config();

async function createTestOrder() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    
    // Find a user to associate with the order
    const user = await User.findOne();
    if (!user) {
      console.log("No users found in database");
      process.exit(1);
    }
    
    console.log("Creating test order for user:", user.fullName);
    
    // Create an order with some overdue installments
    const pastDate1 = new Date();
    pastDate1.setDate(pastDate1.getDate() - 10); // 10 days ago
    
    const pastDate2 = new Date();
    pastDate2.setDate(pastDate2.getDate() - 5); // 5 days ago
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
    
    const order = new Order({
      user: user._id,
      items: [{
        product: "6927f50762f0641c8af0a095",
        name: "Test Product",
        price: 10000,
        quantity: 1,
        category: "Electronics",
        image_url: "https://example.com/image.jpg"
      }],
      total: 10000,
      installmentMonths: 3,
      monthlyPayment: 3333,
      shippingAddress: "Test Address",
      phone: "1234567890",
      paymentMethod: "jazzcash",
      installments: [
        {
          dueDate: pastDate1,
          amount: 3333,
          status: "pending" // This should become overdue
        },
        {
          dueDate: pastDate2,
          amount: 3333,
          status: "pending" // This should also become overdue
        },
        {
          dueDate: futureDate,
          amount: 3334,
          status: "pending" // This should remain pending
        }
      ]
    });
    
    await order.save();
    console.log("Test order created successfully!");
    console.log("Order ID:", order.id);
    
    // Now run the overdue check
    const { markOverdueInstallments } = await import("../src/utils/scheduler.js");
    console.log("Running overdue check...");
    await markOverdueInstallments();
    
    // Check the updated order
    const updatedOrder = await Order.findById(order.id);
    console.log("Updated order installments:");
    updatedOrder.installments.forEach((inst, index) => {
      console.log(`  ${index + 1}. Rs. ${inst.amount} - ${inst.status} - Due: ${new Date(inst.dueDate).toLocaleDateString()}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating test order:", error);
    process.exit(1);
  }
}

createTestOrder();