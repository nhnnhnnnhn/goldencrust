const Payment = require('../models/payment.model');
const Order = require('../models/order.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a Stripe payment intent
exports.createPaymentIntent = async (req, res) => {
    try {
        const { orderId, paymentMethodId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        // Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order belongs to current user
        if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to pay for this order'
            });
        }

        // Create or retrieve Stripe customer
        let customerId;
        const existingCustomers = await stripe.customers.list({
            email: req.user.email,
            limit: 1
        });

        if (existingCustomers.data.length > 0) {
            customerId = existingCustomers.data[0].id;
        } else {
            const customer = await stripe.customers.create({
                email: req.user.email,
                name: req.user.fullName
            });
            customerId = customer.id;
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order.totalAmount * 100), // Stripe expects amount in cents
            currency: 'usd',
            customer: customerId,
            payment_method: paymentMethodId,
            description: `Order #${order._id}`,
            metadata: {
                orderId: order._id.toString(),
                userId: req.user._id.toString()
            },
            confirmation_method: 'manual',
            confirm: paymentMethodId ? true : false
        });

        // Create a payment record in your database
        const payment = new Payment({
            amount: order.totalAmount,
            userId: req.user._id,
            paymentMethod: 'stripe',
            transactionId: paymentIntent.id,
            orderId: order._id,
            stripePaymentIntentId: paymentIntent.id,
            stripeCustomerId: customerId,
            stripePaymentMethodId: paymentMethodId || null,
            status: 'pending',
            createdBy: req.user._id,
            updatedBy: req.user._id
        });

        await payment.save();

        return res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            paymentId: payment._id
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while creating payment intent',
            error: error.message
        });
    }
};

// Confirm a Stripe payment
exports.confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment Intent ID is required'
            });
        }

        // Find the payment in our database
        const payment = await Payment.findOne({
            stripePaymentIntentId: paymentIntentId
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check if user is authorized to confirm this payment
        if (payment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to confirm this payment'
            });
        }

        // Confirm the payment intent
        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

        // Update the payment status in our database
        payment.status = paymentIntent.status === 'succeeded' ? 'completed' : 'pending';
        payment.updatedBy = req.user._id;

        if (paymentIntent.status === 'succeeded') {
            // Update the order status if payment is successful
            await Order.findByIdAndUpdate(payment.orderId, {
                paymentStatus: 'paid',
                updatedBy: req.user._id
            });
        }

        await payment.save();

        return res.status(200).json({
            success: true,
            status: payment.status,
            message: `Payment ${payment.status}`
        });
    } catch (error) {
        console.error('Error confirming payment:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while confirming payment',
            error: error.message
        });
    }
};

// Cancel a payment
exports.cancelPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment Intent ID is required'
            });
        }

        // Find the payment in our database
        const payment = await Payment.findOne({
            stripePaymentIntentId: paymentIntentId
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check if user is authorized to cancel this payment
        if (payment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to cancel this payment'
            });
        }

        // Cancel the payment intent
        await stripe.paymentIntents.cancel(paymentIntentId);

        // Update the payment status in our database
        payment.status = 'failed';
        payment.updatedBy = req.user._id;
        await payment.save();

        return res.status(200).json({
            success: true,
            message: 'Payment has been cancelled'
        });
    } catch (error) {
        console.error('Error cancelling payment:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while cancelling payment',
            error: error.message
        });
    }
};

// Webhook to handle Stripe events
exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            await handlePaymentIntentSucceeded(event.data.object);
            break;
        case 'payment_intent.payment_failed':
            await handlePaymentIntentFailed(event.data.object);
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send({ received: true });
};

// Get payment history for the current user
exports.getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { userId, deleted: false };

        const payments = await Payment.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('orderId', 'orderNumber totalAmount')
            .lean();

        const total = await Payment.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                payments,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting payment history:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while getting payment history',
            error: error.message
        });
    }
};

// Get payment details
exports.getPaymentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findOne({
            _id: id,
            deleted: false
        }).populate('orderId', 'orderNumber totalAmount items');

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check if user is authorized to view this payment
        if (payment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this payment'
            });
        }

        return res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error('Error getting payment details:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while getting payment details',
            error: error.message
        });
    }
};

// Helper function to handle successful payment intents from webhook
async function handlePaymentIntentSucceeded(paymentIntent) {
    try {
        // Update payment status in our database
        const payment = await Payment.findOne({
            stripePaymentIntentId: paymentIntent.id
        });

        if (payment) {
            payment.status = 'completed';
            payment.stripeChargeId = paymentIntent.latest_charge;
            await payment.save();

            // Update the order status
            await Order.findByIdAndUpdate(payment.orderId, {
                paymentStatus: 'paid'
            });
        }
    } catch (error) {
        console.error('Error handling payment intent succeeded:', error);
    }
}

// Helper function to handle failed payment intents from webhook
async function handlePaymentIntentFailed(paymentIntent) {
    try {
        // Update payment status in our database
        const payment = await Payment.findOne({
            stripePaymentIntentId: paymentIntent.id
        });

        if (payment) {
            payment.status = 'failed';
            await payment.save();
        }
    } catch (error) {
        console.error('Error handling payment intent failed:', error);
    }
}
