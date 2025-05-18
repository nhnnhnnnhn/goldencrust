const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const controllerHandler = require('../../../helpers/controllerHandler');
const logger = require('../../../helpers/logger');
const Order = require('../models/order.model');

// Tạo checkout session
module.exports.createCheckoutSession = controllerHandler(async (req, res) => {
    const { items, customer, orderIds } = req.body;

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
                    currency: 'vnd',
                    product_data: {
                        name: item.name,
                        description: item.description || '',
                        // Chỉ thêm hình ảnh nếu URL hợp lệ
                        ...(isValidImageUrl ? { images: [item.image] } : {})
                    },
                    unit_amount: Math.round(item.price), // Sử dụng VND không cần nhân 100
                },
                quantity: item.quantity,
            };
        });

        // Thêm phí vận chuyển nếu cần
        if (req.body.deliveryFee) {
            lineItems.push({
                price_data: {
                    currency: 'vnd',
                    product_data: {
                        name: 'Phí vận chuyển',
                        description: 'Phí giao hàng',
                    },
                    unit_amount: Math.round(req.body.deliveryFee),
                },
                quantity: 1,
            });
        }

        // Tạo Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/dashboard/orders?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/dashboard/orders?payment=failed&session_id={CHECKOUT_SESSION_ID}`,
            allow_promotion_codes: true,
            metadata: {
                customer_name: customer?.name || '',
                customer_phone: customer?.phone || '',
                customer_address: customer?.address || '',
                order_notes: customer?.notes || '',
                order_ids: orderIds ? JSON.stringify(orderIds) : ''
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
        
        // Nếu thanh toán thành công và có order IDs trong metadata
        if (session.payment_status === 'paid' && session.metadata.order_ids) {
            try {
                // Cập nhật trạng thái đơn hàng thành 'completed'
                const orderIds = JSON.parse(session.metadata.order_ids);
                
                if (orderIds && orderIds.length > 0) {
                    await Order.updateMany(
                        { _id: { $in: orderIds } },
                        { $set: { status: 'completed', paymentMethod: 'card' } }
                    );
                    
                    logger.info(`Updated ${orderIds.length} orders to completed status`);
                }
            } catch (updateError) {
                logger.error('Failed to update orders after payment', { error: updateError });
            }
        }
        
        res.status(200).json({
            status: session.payment_status,
            customer: {
                name: session.metadata.customer_name,
                phone: session.metadata.customer_phone,
                address: session.metadata.customer_address,
                notes: session.metadata.order_notes
            },
            orderIds: session.metadata.order_ids ? JSON.parse(session.metadata.order_ids) : []
        });
    } catch (error) {
        logger.error('Stripe payment status check failed', { error });
        res.status(500).json({ 
            message: 'Failed to check payment status',
            error: error.message 
        });
    }
});

// Xử lý webhook thanh toán từ Stripe
module.exports.handleWebhook = controllerHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Xác thực webhook từ Stripe
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        // Xử lý sự kiện thanh toán thành công
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            
            // Nếu có order IDs trong metadata
            if (session.metadata && session.metadata.order_ids) {
                try {
                    const orderIds = JSON.parse(session.metadata.order_ids);
                    
                    if (orderIds && orderIds.length > 0) {
                        await Order.updateMany(
                            { _id: { $in: orderIds } },
                            { $set: { status: 'completed', paymentMethod: 'card' } }
                        );
                        
                        logger.info(`Updated ${orderIds.length} orders to completed status via webhook`);
                    }
                } catch (updateError) {
                    logger.error('Failed to update orders in webhook', { error: updateError });
                }
            }
        }

        // Trả về thành công cho Stripe
        res.status(200).json({ received: true });
    } catch (error) {
        logger.error('Stripe webhook processing failed', { error });
        res.status(400).json({ message: `Webhook Error: ${error.message}` });
    }
});
