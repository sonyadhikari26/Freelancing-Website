require('dotenv').config();
const emailService = require('./utils/emailService');

async function testEmail() {
  console.log('🧪 Testing email configuration...\n');
  
  console.log('📋 Current email settings:');
  console.log(`Host: ${process.env.EMAIL_HOST}`);
  console.log(`Port: ${process.env.EMAIL_PORT}`);
  console.log(`User: ${process.env.EMAIL_USER}`);
  console.log(`Password: ${process.env.EMAIL_PASSWORD ? '***hidden***' : 'NOT SET'}\n`);
  
  // Test connection
  console.log('🔗 Testing SMTP connection...');
  const connectionTest = await emailService.testConnection();
  
  if (connectionTest) {
    console.log('\n📧 Sending test verification email...');
    const result = await emailService.sendVerificationEmail(
      process.env.EMAIL_USER, // Send to the same email address for testing
      'TestUser',
      'test-token-123'
    );
    
    if (result.success) {
      console.log('✅ Test email would be sent successfully!');
    } else {
      console.log('❌ Test email failed:', result.error);
    }
  }
}

testEmail().catch(console.error);
