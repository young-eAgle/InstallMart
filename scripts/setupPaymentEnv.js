/**
 * Payment Environment Setup Script
 * 
 * This script helps set up the environment variables needed for payment gateway integration.
 * It creates example configuration files and provides guidance on obtaining credentials.
 */

import fs from 'fs';
import path from 'path';

// Define the environment template
const serverEnvTemplate = `
# ================================
# Payment Gateway Configuration
# ================================

# JazzCash Configuration (Sandbox/Test Credentials)
# Get your credentials from: https://sandbox.jazzcash.com.pk/
JAZZCASH_MERCHANT_ID=your_sandbox_merchant_id
JAZZCASH_PASSWORD=your_sandbox_password
JAZZCASH_INTEGRITY_SALT=your_sandbox_integrity_salt
JAZZCASH_RETURN_URL=http://localhost:5173/payment/callback

# EasyPaisa Configuration (Sandbox/Test Credentials)
# Get your credentials from: https://easypay-sandbox.easypaisa.com.pk/
EASYPAISA_STORE_ID=your_sandbox_store_id
EASYPAISA_HASH_KEY=your_sandbox_hash_key
EASYPAISA_POSTBACK_URL=http://localhost:3000/api/payment/easypaisa/callback

# Production URLs (Uncomment when going live)
# JAZZCASH_API_URL=https://jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/
# EASYPAISA_API_URL=https://easypay.easypaisa.com.pk/easypay/Index.jsf
`;

const clientEnvTemplate = `
# ================================
# Frontend Payment Configuration
# ================================

VITE_JAZZCASH_RETURN_URL=http://localhost:5173/payment/callback
VITE_EASYPAISA_RETURN_URL=http://localhost:5173/payment/callback
`;

// Function to create or update environment files
function setupPaymentEnvironment() {
  console.log('🔧 Setting up Payment Gateway Environment...\n');
  
  try {
    // Server environment setup
    const serverEnvPath = path.join(process.cwd(), 'server', '.env');
    if (fs.existsSync(serverEnvPath)) {
      console.log('📄 Updating server .env file...');
      const currentEnv = fs.readFileSync(serverEnvPath, 'utf8');
      
      // Check if payment configs already exist
      if (!currentEnv.includes('JAZZCASH_MERCHANT_ID') && !currentEnv.includes('EASYPAISA_STORE_ID')) {
        fs.appendFileSync(serverEnvPath, serverEnvTemplate);
        console.log('✅ Added payment gateway configuration to server .env');
      } else {
        console.log('ℹ️  Payment gateway configuration already exists in server .env');
      }
    } else {
      console.log('📄 Creating server .env file...');
      fs.writeFileSync(serverEnvPath, serverEnvTemplate.trim());
      console.log('✅ Created server .env with payment gateway configuration');
    }
    
    // Client environment setup
    const clientEnvPath = path.join(process.cwd(), 'client', '.env');
    if (fs.existsSync(clientEnvPath)) {
      console.log('📄 Updating client .env file...');
      const currentEnv = fs.readFileSync(clientEnvPath, 'utf8');
      
      // Check if payment configs already exist
      if (!currentEnv.includes('VITE_JAZZCASH_RETURN_URL') && !currentEnv.includes('VITE_EASYPAISA_RETURN_URL')) {
        fs.appendFileSync(clientEnvPath, clientEnvTemplate);
        console.log('✅ Added payment gateway configuration to client .env');
      } else {
        console.log('ℹ️  Payment gateway configuration already exists in client .env');
      }
    } else {
      console.log('📄 Creating client .env file...');
      fs.writeFileSync(clientEnvPath, clientEnvTemplate.trim());
      console.log('✅ Created client .env with payment gateway configuration');
    }
    
    console.log('\n🎉 Payment Environment Setup Complete!\n');
    
    console.log('📋 Next Steps:');
    console.log('1. Visit https://sandbox.jazzcash.com.pk/ to get JazzCash sandbox credentials');
    console.log('2. Visit https://easypay-sandbox.easypaisa.com.pk/ to get EasyPaisa sandbox credentials');
    console.log('3. Update the placeholder values in your .env files with real sandbox credentials');
    console.log('4. Restart your development servers');
    console.log('5. Run the payment integration tests');
    
    console.log('\n⚠️  Security Reminders:');
    console.log('- Never commit real credentials to version control');
    console.log('- Use different credentials for development, staging, and production');
    console.log('- Rotate credentials periodically');
    console.log('- Restrict access to production credentials');
    
    console.log('\n📖 Documentation:');
    console.log('- See PAYMENT_GATEWAY_CREDENTIALS.md for detailed setup instructions');
    console.log('- See PAYMENT_INTEGRATION_TESTING.md for testing procedures');
    
  } catch (error) {
    console.error('❌ Environment setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupPaymentEnvironment();
}

export { setupPaymentEnvironment };