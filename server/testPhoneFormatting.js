/**
 * Test phone number formatting for PayFast
 * This script tests various phone number formats to ensure they're properly converted
 */

import dotenv from 'dotenv';
dotenv.config();

// Test different phone formats
const testPhones = [
  { input: '03001234567', description: 'Pakistan number with leading 0' },
  { input: '923001234567', description: 'Pakistan number with 92 prefix' },
  { input: '+92 300 1234567', description: 'Pakistan with + and spaces' },
  { input: '3001234567', description: 'Pakistan without country code' },
  { input: '0092 300 1234567', description: 'Pakistan with 0092' },
  { input: '27712345678', description: 'South Africa number' },
  { input: '+27 712 345 678', description: 'South Africa with + and spaces' },
  { input: undefined, description: 'Undefined (no phone)' },
  { input: '', description: 'Empty string' },
];

// Helper function to format phone (copy from payFastGateways.js)
const formatPhoneNumber = (phone) => {
  if (!phone) return "";
  
  // Remove all non-digit characters and spaces
  let cleaned = phone.replace(/\D/g, '').trim();
  
  if (!cleaned) return "";
  
  // If starts with 0, it's a local Pakistan number - replace 0 with 92
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.substring(1);
  }
  
  // If it's a short number without country code (10 digits or less)
  // and doesn't start with a known country code, assume Pakistan (92)
  if (cleaned.length <= 10 && !cleaned.startsWith('27') && !cleaned.startsWith('92') && !cleaned.startsWith('44') && !cleaned.startsWith('1')) {
    cleaned = '92' + cleaned;
  }
  
  return cleaned;
};

const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  const formatted = formatPhoneNumber(phone);
  return /^\d{9,15}$/.test(formatted);
};

console.log('📱 PayFast Phone Number Format Test\n');
console.log('─'.repeat(80));

testPhones.forEach(test => {
  const formatted = formatPhoneNumber(test.input);
  const isValid = isValidPhoneNumber(test.input);
  
  console.log(`\nInput: ${test.input ? `"${test.input}"` : 'undefined'}`);
  console.log(`Description: ${test.description}`);
  console.log(`Formatted: "${formatted}"`);
  console.log(`Valid: ${isValid ? '✅ Yes' : '❌ No'}`);
  
  if (formatted) {
    console.log(`Length: ${formatted.length} digits`);
  }
});

console.log('\n' + '─'.repeat(80));
console.log('\n✅ Phone formatting test complete!');
console.log('\nPayFast Requirements:');
console.log('  • Format: International (with country code)');
console.log('  • For Pakistan: 92XXXXXXXXXX (11-12 digits)');
console.log('  • For South Africa: 27XXXXXXXXX (10-11 digits)');
console.log('  • Length: 9-15 digits total');
