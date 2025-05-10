const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const controllerHandler = require('../../../helpers/controllerHandler');
const logger = require('../../../helpers/logger');

// Tạo checkout session
module.exports.createCheckoutSession = controllerHandler(async (req, res) => {
    const { items, customer } = req.body;

    if (!items || !items.length) {
        return res.status(400).json({ message: 'No items provided for checkout' });
    }

    try {
        // Tạo danh sách sản phẩm cho Stripe
        const lineItems = items.map(item => {
            // Kiểm tra xem image có phải là URL hoàn chỉnh không
            const isValidImageUrl = item.image && (
                item.image.startsWith('http://') || 
                item.image.startsWith('https://')
            );

            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        description: item.description || '',
                        // Chỉ thêm hình ảnh nếu URL hợp lệ
                        ...(isValidImageUrl ? { images: [item.image] } : {})
                    },
                    unit_amount: Math.round(item.price * 100), // Stripe yêu cầu số tiền theo xu (cents)
                },
                quantity: item.quantity,
            };
        });

        // Thêm phí vận chuyển nếu cần
        if (req.body.deliveryFee) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Phí vận chuyển',
                        description: 'Phí giao hàng',
                    },
                    unit_amount: Math.round(req.body.deliveryFee * 100),
                },
                quantity: 1,
            });
        }

        // Tạo Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/delivery?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/delivery?payment=failed&session_id={CHECKOUT_SESSION_ID}`,
            metadata: {
                customer_name: customer?.name || '',
                customer_phone: customer?.phone || '',
                customer_address: customer?.address || '',
                order_notes: customer?.notes || ''
            }
        });

        res.status(200).json({ 
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        logger.error('Stripe checkout session creation failed', { error });
        res.status(500).json({ 
            message: 'Failed to create checkout session',
            error: error.message 
        });
    }
});

// Kiểm tra trạng thái thanh toán
module.exports.checkPaymentStatus = controllerHandler(async (req, res) => {
    const { sessionId } = req.params;

    if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        res.status(200).json({
            status: session.payment_status,
            customer: {
                name: session.metadata.customer_name,
                phone: session.metadata.customer_phone,
                address: session.metadata.customer_address,
                notes: session.metadata.order_notes
            }
        });
    } catch (error) {
        logger.error('Stripe payment status check failed', { error });
        res.status(500).json({ 
            message: 'Failed to check payment status',
            error: error.message 
        });
    }
});
