import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initScheduler } from "./utils/scheduler.js";
import { testCloudinaryConfig } from "./utils/cloudinary.js";
import { testEmailConfig } from "./utils/mailer.js";
import { configurePayFast } from "./utils/payFastGateways.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const start = async () => {
  // Connect to database
  await connectDB();

  // Configure PayFast
  await configurePayFast(app);

  // Test Cloudinary configuration
  testCloudinaryConfig();

  // Test email configuration
  await testEmailConfig();

  // Initialize task scheduler
  initScheduler();

  // Start server
  app.listen(PORT, () => {
    console.log(`\n🚀 InstallMart API running on http://localhost:${PORT}`);
    console.log(`📊 MongoDB URI: ${process.env.MONGODB_URI}`);
    console.log(`✉️  Email: ${process.env.EMAIL_USER || 'Not configured'}`);
    console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME || 'Not configured'}\n`);
  });
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

app.get("/", (req, res) => {
  res.json({
    message: "InstallMart API Server",
    status: "running",
    version: "1.0.0"
  });
});
