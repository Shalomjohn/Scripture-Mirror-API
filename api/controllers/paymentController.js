const https = require('https');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config();
const paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.initializePaystackPayment = async (req, res) => {
    let { amount, customerEmail, currency } = req.body;

    if (!currency) {
        currency = 'NGN'
    }

    try {
        // Generate a reference for the payment
        const reference = `sm-payment-${Date.now()}-${uuidv4()}`;

        // Initialize the payment on Paystack
        const response = await paystack.transaction.initialize({
            amount: amount * 100, // Paystack expects amount in kobo for NGN
            email: customerEmail,
            currency,
            reference: reference,
        });

        // Return the authorization URL to the client
        res.status(200).json({ reference, authorizationUrl: response.data.authorization_url });
    } catch (error) {
        res.status(500).json({ message: 'Error processing payment', error });
    }
};

exports.verifyPaystackPayment = async (req, res) => {
    const { reference } = req.body;
    try {
        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: `/transaction/verify/${reference}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        };

        const apiReq = https.request(options, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', async () => {
                const parsedResponse = JSON.parse(data);
                var responseData = {};
                if (parsedResponse["status"] == true) {
                    if (parsedResponse["data"]["paidAt"] == null) {
                        responseData.status = false;
                    } else {
                        responseData.status = true;
                    }
                    responseData.message = parsedResponse["data"]["gateway_response"];
                } else {
                    responseData.status = false;
                    responseData.message = parsedResponse["message"];
                }
                console.log(parsedResponse);
                if (responseData["status"] === true) {
                    return res.status(200).json(responseData);
                } else {
                    return res.status(500).json(responseData);
                }
            });
        }).on('error', (error) => {
            console.error(error);
            res.status(500).json({ error: error.message });
        });

        apiReq.on('error', (error) => {
            console.error(error);
            res.status(500).json({ error: error.message });
        });

        // End the request
        apiReq.end();
    } catch (error) {
        // Handle any errors that occur during the request
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.stripeCreatePaymentIntent = async (req, res) => {
    try {
        const { amount, currency, customer_email } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(amount),
            currency: currency,
            receipt_email: customer_email,
            metadata: {
                type: 'donation',
            },
        });

        res.json({
            client_secret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}