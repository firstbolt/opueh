const AfricasTalking = require('africastalking');

/**
 * Africa's Talking SMS Integration Module
 * 
 * This module handles SMS sending using the Africa's Talking API.
 * 
 * IMPORTANT NOTES FOR SANDBOX MODE:
 * - InvalidSenderId error is fixed by using from: "sandbox" in sandbox mode
 * - Phone numbers must be added to the Africa's Talking Sandbox Simulator first
 * - Only numbers in the Simulator will receive SMS in sandbox mode
 * 
 * Environment Variables Required:
 * - AT_API_KEY: Your Africa's Talking API key
 * - AT_USERNAME: "sandbox" for development, your username for production
 * - AT_SENDER: (Optional) Custom sender ID for production mode only
 */

// Read configuration from environment variables
const AT_API_KEY = process.env.AT_API_KEY || 'atsk_6c8a593852c10aadd49fc2536a5ba23bbe939c36086c9aaa7d5dc20971a557ae7aac77fe';
const AT_USERNAME = process.env.AT_USERNAME || 'sandbox';
const AT_SENDER = process.env.AT_SENDER;

// Validate required environment variables
if (!AT_API_KEY) {
    throw new Error('AT_API_KEY environment variable is required');
}

if (!AT_USERNAME) {
    throw new Error('AT_USERNAME environment variable is required');
}

// Initialize Africa's Talking SDK
const africastalking = AfricasTalking({
    apiKey: AT_API_KEY,
    username: AT_USERNAME
});

// Get the SMS service
const sms = africastalking.SMS;

/**
 * Sanitize phone number by removing non-digits except leading +
 * @param {string} phoneNumber - Raw phone number input
 * @returns {string} - Sanitized phone number
 */
function sanitizePhoneNumber(phoneNumber) {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
        throw new Error('Phone number must be a non-empty string');
    }
    
    // Keep leading + and digits only
    let sanitized = phoneNumber.trim();
    if (sanitized.startsWith('+')) {
        sanitized = '+' + sanitized.substring(1).replace(/\D/g, '');
    } else {
        sanitized = sanitized.replace(/\D/g, '');
    }
    
    if (!sanitized || sanitized === '+') {
        throw new Error('Invalid phone number format');
    }
    
    return sanitized;
}

/**
 * Send SMS using Africa's Talking API
 * @param {string} to - Recipient phone number (will be sanitized)
 * @param {string} message - SMS message content
 * @returns {Promise<Object>} - Success response with recipient info
 * @throws {Error} - On API errors, network issues, or validation failures
 */
async function sendSMS(to, message) {
    try {
        // Validate inputs
        if (!to || typeof to !== 'string') {
            throw new Error('Recipient phone number is required and must be a string');
        }
        
        if (!message || typeof message !== 'string') {
            throw new Error('Message is required and must be a string');
        }
        
        // Sanitize phone number
        const sanitizedNumber = sanitizePhoneNumber(to);
        console.log(`📱 Sanitized phone number: ${to} → ${sanitizedNumber}`);
        
        // Determine sender ID based on environment
        let fromSender;
        if (AT_USERNAME === 'sandbox') {
            fromSender = 'sandbox';
            console.log('🧪 Using sandbox mode with from: "sandbox"');
        } else {
            if (!AT_SENDER) {
                throw new Error('AT_SENDER environment variable is required for production mode');
            }
            fromSender = AT_SENDER;
            console.log(`🚀 Using production mode with from: "${fromSender}"`);
        }
        
        // Prepare SMS options
        const options = {
            to: [sanitizedNumber], // Africa's Talking expects an array
            message: message,
            from: fromSender
        };
        
        // Log exact options for debugging
        console.log('📤 SMS Options:', JSON.stringify(options, null, 2));
        
        // Send SMS via Africa's Talking API
        console.log('🔄 Calling Africa\'s Talking SMS API...');
        const response = await sms.send(options);
        
        console.log('📥 Raw API Response:', JSON.stringify(response, null, 2));
        
        // Validate response structure
        if (!response || !response.SMSMessageData) {
            throw new Error('Invalid API response structure');
        }
        
        const { SMSMessageData } = response;
        
        // Check if recipients array exists and has entries
        if (!SMSMessageData.Recipients || SMSMessageData.Recipients.length === 0) {
            // No recipients processed - this usually indicates an error
            const errorMessage = SMSMessageData.Message || 'Unknown API error';
            console.error(`❌ SMS API Error: ${errorMessage}`);
            throw new Error(`SMS API Error: ${errorMessage}`);
        }
        
        // Check first recipient status
        const recipient = SMSMessageData.Recipients[0];
        if (recipient.status !== 'Success') {
            console.error(`❌ SMS failed for ${recipient.number}: ${recipient.status}`);
            throw new Error(`SMS failed: ${recipient.status}`);
        }
        
        // Success!
        console.log(`✅ SMS sent successfully to ${recipient.number}`);
        console.log(`💰 Cost: ${recipient.cost}`);
        console.log(`🆔 Message ID: ${recipient.messageId}`);
        
        return {
            success: true,
            recipient: recipient.number,
            messageId: recipient.messageId,
            cost: recipient.cost,
            status: recipient.status
        };
        
    } catch (error) {
        // Handle different types of errors
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            console.error('🌐 Network Error: Unable to connect to Africa\'s Talking API');
            throw new Error('Network error: Unable to connect to SMS service');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('⏰ Timeout Error: Africa\'s Talking API request timed out');
            throw new Error('Timeout error: SMS service request timed out');
        } else if (error.message && error.message.includes('SMS API Error:')) {
            // Re-throw API errors as-is
            throw error;
        } else {
            console.error('💥 Unexpected SMS Error:', error.message);
            console.error('📋 Full Error Details:', error);
            throw new Error(`SMS sending failed: ${error.message}`);
        }
    }
}

module.exports = {
    sendSMS
};

/*
USAGE EXAMPLE:

const { sendSMS } = require('./utils/sms');

async function testSMS() {
    try {
        const result = await sendSMS('+2348082225459', 'Test message');
        console.log('SMS sent successfully:', result);
    } catch (error) {
        console.error('SMS failed:', error.message);
    }
}

testSMS();

SETUP INSTRUCTIONS:

1. Launch Africa's Talking Sandbox Simulator:
   - Go to https://account.africastalking.com/apps/sandbox
   - Navigate to "SMS" → "Simulator"
   - Add your test phone number (e.g., +2348082225459) to the simulator

2. Set environment variables:
   export AT_API_KEY="your_api_key_here"
   export AT_USERNAME="sandbox"
   
   Or create a .env file:
   AT_API_KEY=your_api_key_here
   AT_USERNAME=sandbox

3. Run your Node.js application:
   node your_app.js

TROUBLESHOOTING:

- InvalidSenderId: Fixed by using from: "sandbox" in sandbox mode
- No recipients: Phone number must be added to Sandbox Simulator first
- Network errors: Check internet connection and API endpoint availability
- Invalid phone number: Ensure number is in E.164 format (e.g., +2348082225459)
*/