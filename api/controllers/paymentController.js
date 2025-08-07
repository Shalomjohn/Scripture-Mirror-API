const https = require('https');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config();

// Payment gateway imports
const paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY);
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// PayPal SDK import and configuration
const paypal = require('@paypal/checkout-server-sdk');

// PayPal environment setup
const Environment = process.env.PAYPAL_ENVIRONMENT === 'live'
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;

// PayPal client configuration
const paypalClient = new paypal.core.PayPalHttpClient(
    new Environment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    )
);

// Paystack functions
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

// Stripe function
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

// PayPal functions
exports.createPaypalOrder = async (req, res) => {
    try {
        const { amount, currency, customer_email, customer_name, return_url, cancel_url } = req.body;

        // Create order request
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: currency,
                    value: amount.toString()
                },
                description: 'Donation to Scripture Mirror'
            }],
            application_context: {
                return_url: return_url,
                cancel_url: cancel_url,
                user_action: 'PAY_NOW',
                shipping_preference: 'NO_SHIPPING'
            }
        });

        // Execute the request
        const response = await paypalClient.execute(request);

        // Find approval URL
        const approvalUrl = response.result.links.find(link => link.rel === 'approve').href;

        res.json({
            order_id: response.result.id,
            approval_url: approvalUrl,
            status: response.result.status
        });
    } catch (error) {
        console.error('PayPal Order Creation Error:', error);
        res.status(400).json({ message: error.message });
    }
}

exports.capturePaypalPayment = async (req, res) => {
    try {
        const { order_id } = req.body;

        // Create capture request
        const request = new paypal.orders.OrdersCaptureRequest(order_id);
        request.requestBody({});

        // Execute the capture
        const response = await paypalClient.execute(request);

        if (response.result.status === 'COMPLETED') {
            // Payment successful
            res.json({
                status: 'success',
                transaction: response.result,
                transaction_id: response.result.id,
                payer_email: response.result.payer.email_address,
                amount: response.result.purchase_units[0].payments.captures[0].amount
            });
        } else {
            res.status(400).json({
                status: 'failed',
                message: 'Payment not completed',
                paypal_status: response.result.status
            });
        }
    } catch (error) {
        console.error('PayPal Capture Error:', error);
        res.status(400).json({ message: error.message });
    }
}

// Get PayPal order details
exports.getPaypalOrderDetails = async (req, res) => {
    try {
        const { order_id } = req.params;

        const request = new paypal.orders.OrdersGetRequest(order_id);
        const response = await paypalClient.execute(request);

        res.json({
            order_id: response.result.id,
            status: response.result.status,
            amount: response.result.purchase_units[0].amount,
            payer: response.result.payer
        });

    } catch (error) {
        console.error('PayPal Get Order Error:', error);
        res.status(400).json({ message: error.message });
    }
}

// Crypto payment functions
exports.createCryptoPayment = async (req, res) => {
    try {
        const { price_amount, price_currency, pay_currency, customer_email, order_description, order_id } = req.body;

        const payment = await fetch('https://api.nowpayments.io/v1/payment', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.NOWPAYMENTS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                price_amount,
                price_currency,
                pay_currency,
                order_id,
                order_description,
                success_url: req.body.success_url,
                cancel_url: req.body.cancel_url
            })
        });

        const result = await payment.json();

        res.json({
            payment_id: result.payment_id,
            payment_address: result.pay_address,
            payment_url: result.invoice_url,
            payment_amount: result.pay_amount,
            currency: result.pay_currency,
            status: result.payment_status
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.checkCryptoPaymentStatus = async (req, res) => {
    try {
        const { payment_id } = req.query;

        const response = await fetch(`https://api.nowpayments.io/v1/payment/${payment_id}`, {
            headers: {
                'x-api-key': process.env.NOWPAYMENTS_API_KEY
            }
        });

        const result = await response.json();

        res.json({
            payment_id: result.payment_id,
            status: result.payment_status,
            transaction_hash: result.outcome?.hash || '',
            actual_amount: result.actually_paid || 0,
            expected_amount: result.pay_amount
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.getSupportedNowpaymentCurrencies = async (req, res) => {
    try {
        const response = await fetch('https://api.nowpayments.io/v1/currencies', {
            headers: {
                'x-api-key': process.env.NOWPAYMENTS_API_KEY
            }
        });

        const result = await response.json();
        res.json({ currencies: result.currencies });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.getCryptoEstimate = async (req, res) => {
    try {
        const { amount, currency_from, currency_to } = req.query;

        const response = await fetch(`https://api.nowpayments.io/v1/estimate?amount=${amount}&currency_from=${currency_from}&currency_to=${currency_to}`, {
            headers: {
                'x-api-key': process.env.NOWPAYMENTS_API_KEY
            }
        });

        const result = await response.json();
        res.json({ estimated_amount: result.estimated_amount });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}