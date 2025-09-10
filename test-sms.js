// Test file for Africa's Talking SMS integration
const { sendSMS } = require('./utils/sms');

/**
 * Test the SMS sending functionality
 * 
 * BEFORE RUNNING THIS TEST:
 * 1. Go to https://account.africastalking.com/apps/sandbox
 * 2. Navigate to SMS → Simulator
 * 3. Add +2348082225459 to your simulator
 * 4. Set environment variables:
 *    export AT_API_KEY="your_api_key"
 *    export AT_USERNAME="sandbox"
 */

async function testSMS() {
    console.log('🧪 Testing Africa\'s Talking SMS API...\n');
    
    // Test phone number - MUST be added to Sandbox Simulator first!
    const testPhoneNumber = '+2348082225459';
    
    // Test message
    const testMessage = 'Hello from Africa\'s Talking Sandbox! This is a test message.';

    try {
        console.log(`📱 Sending test SMS to: ${testPhoneNumber}`);
        console.log(`📝 Message: "${testMessage}"\n`);
        
        const result = await sendSMS(testPhoneNumber, testMessage);
        
        console.log('\n🎉 SMS Test PASSED!');
        console.log('✅ Result:', result);
        
    } catch (error) {
        console.log('\n❌ SMS Test FAILED!');
        console.error('❌ Error:', error.message);
        
        // Provide helpful troubleshooting tips
        if (error.message.includes('InvalidSenderId')) {
            console.log('\n💡 TROUBLESHOOTING TIPS:');
            console.log('- Make sure AT_USERNAME is set to "sandbox"');
            console.log('- Verify the from field is set to "sandbox" in sandbox mode');
        } else if (error.message.includes('SMS API Error')) {
            console.log('\n💡 TROUBLESHOOTING TIPS:');
            console.log('- Add your phone number to the Sandbox Simulator first');
            console.log('- Go to: https://account.africastalking.com/apps/sandbox');
            console.log('- Navigate to SMS → Simulator');
            console.log(`- Add ${testPhoneNumber} to the simulator`);
        }
    }
}

// Example usage as requested
async function exampleUsage() {
    console.log('\n📖 EXAMPLE USAGE:\n');
    
    try {
        // This is the exact example requested
        const result = await sendSMS('+2348082225459', 'Hello Sandbox SMS!');
        console.log('Example result:', result);
    } catch (error) {
        console.error('Example error:', error.message);
    }
}

// Run tests
async function runAllTests() {
    await testSMS();
    await exampleUsage();
}

// Execute if run directly
if (require.main === module) {
    runAllTests();
}

module.exports = {
    testSMS,
    exampleUsage
};

/*
SETUP INSTRUCTIONS:

1. Launch Africa's Talking Sandbox Simulator:
   - Visit: https://account.africastalking.com/apps/sandbox
   - Go to SMS → Simulator
   - Add +2348082225459 to your simulator

2. Set environment variables:
   export AT_API_KEY="atsk_6c8a593852c10aadd49fc2536a5ba23bbe939c36086c9aaa7d5dc20971a557ae7aac77fe"
   export AT_USERNAME="sandbox"

3. Run the test:
   node test-sms.js

EXPECTED OUTPUT (Success):
🧪 Testing Africa's Talking SMS API...
📱 Sanitized phone number: +2348082225459 → +2348082225459
🧪 Using sandbox mode with from: "sandbox"
📤 SMS Options: {
  "to": ["+2348082225459"],
  "message": "Hello from Africa's Talking Sandbox! This is a test message.",
  "from": "sandbox"
}
🔄 Calling Africa's Talking SMS API...
📥 Raw API Response: { ... }
✅ SMS sent successfully to +2348082225459
💰 Cost: KES 0.8000
🆔 Message ID: ATXid_...

🎉 SMS Test PASSED!
*/