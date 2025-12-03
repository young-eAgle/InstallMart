import dotenv from "dotenv";
import { connectDB } from "../src/config/db.js";
import { Product } from "../src/models/Product.js";
import products from "../data/products.json" assert { type: "json" };

dotenv.config();

const seed = async () => {
  await connectDB();
  await Product.deleteMany();
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products`);
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});

