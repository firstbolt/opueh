const AfricasTalking = require('africastalking');

// Initialize Africa's Talking SDK
const africastalking = AfricasTalking({
    apiKey: 'atsk_6c8a593852c10aadd49fc2536a5ba23bbe939c36086c9aaa7d5dc20971a557ae7aac77fe',
    username: 'sandbox'
});

// Get the SMS service
const sms = africastalking.SMS;

/**
 * Send SMS using Africa's Talking API
 * @param {string} to - Recipient phone number in E.164 format (e.g. +2348082225459)
 * @param {string} message - SMS message content
 * @returns {Promise} - API response
 */
async function sendSMS(to, message) {
    try {
        console.log(`\n📱 Attempting to send SMS to: ${to}`);
        console.log(`📝 Message: ${message}`);
        
        const options = {
            to: [to], // Africa's Talking expects an array of recipients
            message: message,
            from: "sandbox" // Required string for sandbox mode
        };

        const response = await sms.send(options);
        
        console.log('✅ SMS API Response:', JSON.stringify(response, null, 2));
        
        // Check if SMS was sent successfully
        if (response.SMSMessageData && response.SMSMessageData.Recipients) {
            const recipient = response.SMSMessageData.Recipients[0];
            if (recipient.status === 'Success') {
                console.log('✅ SMS sent successfully!');
                return {
                    success: true,
                    data: response,
                    messageId: recipient.messageId,
                    cost: recipient.cost
                };
            } else {
                console.error('❌ SMS failed:', recipient.status);
                return {
                    success: false,
                    error: recipient.status,
                    data: response
                };
            }
        } else {
            console.error('❌ Unexpected API response format:', response);
            return {
                success: false,
                error: 'Unexpected API response format',
                data: response
            };
        }
        
    } catch (error) {
        console.error('❌ SMS Error:', error.message);
        console.error('❌ Full Error:', error);
        
        return {
            success: false,
            error: error.message,
            fullError: error
        };
    }
}

module.exports = {
    sendSMS
};