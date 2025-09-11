var request = require('request');

// Option 1: Using fetch (recommended for modern Node.js/Vercel)
async function sendOTPEmail(email_address, code) {
    const BASE_URL = "https://v3.api.termii.com";
    
    const data = {
        "api_key": process.env.TERMIL_API_KEY,
        "email_address": email_address,
        "code": `${code}`,
        "email_configuration_id": process.env.TERMIL_EMAIL_CONFIGURATION_ID,
    };

    try {
        const response = await fetch(`${BASE_URL}/api/email/otp/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.text();
        console.log('OTP sent successfully:', result);
        return { success: true, data: result };
        
    } catch (error) {
        console.error('Error sending OTP:', error.message);
        return { success: false, error: error.message };
    }
}


module.exports = { sendOTPEmail };