var request = require('request');

async function sendOTPEmail(email_address, code) {
    BASE_URL = "https://v3.api.termii.com";
    var data = {
        "api_key": process.env.TERMIL_API_KEY,
        "email_address": email_address,
        "code": `${code}`,
        "email_configuration_id": process.env.TERMIL_EMAIL_CONFIGURATION_ID,
    };
    var options = {
        'method': 'POST',
        'url': `${BASE_URL}/api/email/otp/send`,
        'headers': {
            'Content-Type': ['application/json', 'application/json']
        },
        body: JSON.stringify(data)

    };
    console.log(options);
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
    })

}


module.exports = { sendOTPEmail };