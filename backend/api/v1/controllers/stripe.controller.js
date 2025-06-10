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

// Lấy URL hoá đơn từ Stripe
module.exports.getInvoiceUrl = controllerHandler(async (req, res) => {
    try {
        const { paymentId } = req.params;
        
        // Kiểm tra payment intent có tồn tại không
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        if (!paymentIntent) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        // Lấy invoice từ Stripe nếu có
        let invoiceUrl;
        if (paymentIntent.invoice) {
            // Nếu thanh toán có liên kết với invoice
            const invoice = await stripe.invoices.retrieve(paymentIntent.invoice);
            invoiceUrl = invoice.invoice_pdf;
        } else {
            // Nếu không có invoice, tạo receipt URL
            const charge = paymentIntent.latest_charge 
                ? await stripe.charges.retrieve(paymentIntent.latest_charge)
                : null;
            
            invoiceUrl = charge?.receipt_url || null;
        }

        if (!invoiceUrl) {
            return res.status(404).json({ success: false, message: 'No invoice or receipt available for this payment' });
        }

        return res.status(200).json({ success: true, invoiceUrl });
    } catch (error) {
        logger.error('Error retrieving invoice', { error, paymentId: req.params.paymentId });
        return res.status(500).json({ success: false, message: 'Error retrieving invoice', error: error.message });
    }
});

module.exports.getCustomerDetails = controllerHandler(async (req, res) => {
    try {
        const { paymentId } = req.params;
        logger.info('Getting customer details for paymentId', { paymentId });
        
        // Đặt các header để tránh cache trên browser và proxy
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
        
        // Lấy payment intent với đầy đủ thông tin customer
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId, {
            expand: ['customer', 'charges.data']
        });
        
        if (!paymentIntent) {
            return res.status(404).json({ success: false, message: 'Payment intent not found' });
        }
        
        let customerName = '';
        let customerEmail = '';
        let source = '';
        
        // Thử các phương pháp khác nhau để lấy tên khách hàng
        
        // 1. Lấy trực tiếp từ customer object nếu có
        if (!customerName && paymentIntent.customer && typeof paymentIntent.customer !== 'string') {
            if (paymentIntent.customer.name) {
                customerName = paymentIntent.customer.name;
                customerEmail = paymentIntent.customer.email || customerEmail;
                source = 'customer_object';
                logger.info('Found customer name from expanded customer object', { customerName });
            }
        }
        
        // 2. Lấy từ thông tin shipping
        if (!customerName && paymentIntent.shipping && paymentIntent.shipping.name) {
            customerName = paymentIntent.shipping.name;
            source = 'shipping_info';
            logger.info('Found customer name from payment intent shipping', { customerName });
        }
        
        // 3. Lấy từ thông tin billing của charge đầu tiên
        if (!customerName && paymentIntent.charges && paymentIntent.charges.data && paymentIntent.charges.data.length > 0) {
            const charge = paymentIntent.charges.data[0];
            
            if (charge.billing_details && charge.billing_details.name) {
                customerName = charge.billing_details.name;
                customerEmail = charge.billing_details.email || customerEmail;
                source = 'charge_billing_details';
                logger.info('Found customer name from charge billing details', { customerName });
            }
        }
        
        // 4. Lấy từ metadata của payment intent nếu có
        if (!customerName && paymentIntent.metadata && paymentIntent.metadata.customer_name) {
            customerName = paymentIntent.metadata.customer_name;
            source = 'payment_intent_metadata';
            logger.info('Found customer name from payment intent metadata', { customerName });
        }
        
        // 5. Nếu vẫn chưa tìm được và có customer ID, gọi API để lấy
        if (!customerName && paymentIntent.customer && typeof paymentIntent.customer === 'string') {
            try {
                const customer = await stripe.customers.retrieve(paymentIntent.customer);
                if (customer && !customer.deleted) {
                    customerName = customer.name || '';
                    customerEmail = customer.email || customerEmail;
                    source = 'customer_retrieve_api';
                    logger.info('Found customer name from customer retrieve API', { customerName });
                }
            } catch (error) {
                logger.warn('Error retrieving customer', { error: error.message, customerId: paymentIntent.customer });
            }
        }
        
        // Trả về kết quả với timestamp để tránh cache
        return res.status(200).json({ 
            success: true, 
            customerName: customerName || '',
            customerEmail: customerEmail || '',
            source,
            timestamp: Date.now()
        });
    } catch (error) {
        logger.error('Error retrieving customer details', { error: error.message, paymentId: req.params.paymentId });
        return res.status(500).json({ 
            success: false, 
            message: 'Error retrieving customer details',
            error: error.message 
        });
    }
});

// Xử lý hoàn tiền
module.exports.refundPayment = controllerHandler(async (req, res) => {
    try {
        const { paymentId, amount, reason } = req.body;
        
        // Kiểm tra dữ liệu đầu vào
        if (!paymentId) {
            return res.status(400).json({ success: false, message: 'Payment ID is required' });
        }
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Valid amount is required' });
        }
        
        // Tạo refund trên Stripe
        const refund = await stripe.refunds.create({
            payment_intent: paymentId,
            amount: Math.round(amount), // Đảm bảo số nguyên
            reason: reason || 'requested_by_customer'
        });
        
        return res.status(200).json({ 
            success: true,
            refund: {
                id: refund.id,
                amount: refund.amount,
                status: refund.status,
                created: refund.created
            }
        });
    } catch (error) {
        logger.error('Error processing refund', { error, paymentId: req.body.paymentId });
        return res.status(500).json({ success: false, message: 'Error processing refund', error: error.message });
    }
});

// Lấy danh sách thanh toán
module.exports.getPayments = controllerHandler(async (req, res) => {
    try {
        // Xử lý các tham số query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status; // 'completed', 'pending', 'failed'
        const search = req.query.search;
        const paymentMethod = req.query.paymentMethod; // 'card', 'cash', 'paypal', etc.
        const startDate = req.query.startDate; 
        const endDate = req.query.endDate;

        // Tạo đối tượng query params cho Stripe API
        const queryParams = {
            limit: limit,
            starting_after: page > 1 ? (page - 1) * limit : undefined,
        };
        
        // Lấy danh sách thanh toán từ Stripe API
        const paymentIntents = await stripe.paymentIntents.list(queryParams);

        // Chuyển đổi dữ liệu từ Stripe thành định dạng tương thích với frontend
        const payments = await Promise.all(paymentIntents.data.map(async (intent) => {
            // Lấy thông tin khách hàng (nếu có)
            let user = null;
            if (intent.customer) {
                try {
                    const customer = await stripe.customers.retrieve(intent.customer);
                    user = {
                        _id: customer.id,
                        name: customer.name,
                        email: customer.email,
                        phone: customer.phone,
                    };
                } catch (error) {
                    logger.error('Error retrieving customer', { error });
                }
            }

            // Chuyển đổi trạng thái từ Stripe sang định dạng frontend
            let paymentStatus = 'pending';
            if (intent.status === 'succeeded') paymentStatus = 'completed';
            else if (intent.status === 'canceled') paymentStatus = 'failed';

            // Tạo đối tượng payment theo định dạng frontend
            return {
                _id: intent.id,
                amount: intent.amount / 100, // Chuyển từ cents sang dollars
                userId: intent.customer || '',
                paymentMethod: intent.payment_method_types[0] || 'card',
                transactionId: intent.id,
                orderId: intent.metadata?.order_id || '',
                stripePaymentIntentId: intent.id,
                stripeCustomerId: intent.customer || '',
                stripeChargeId: intent.latest_charge || '',
                stripePaymentMethodId: intent.payment_method || '',
                currency: intent.currency,
                status: paymentStatus,
                createdBy: '',
                updatedBy: '',
                deleted: false,
                createdAt: new Date(intent.created * 1000), // Chuyển từ timestamp sang Date
                updatedAt: new Date(intent.created * 1000),
                user: user,
                order: intent.metadata?.order_id ? { _id: intent.metadata.order_id } : null
            };
        }));
        
        // Lọc kết quả dựa trên các tham số query
        const filteredPayments = payments.filter(payment => {
            // Lọc theo trạng thái
            if (status && status !== 'all' && payment.status !== status) return false;
            
            // Lọc theo phương thức thanh toán
            if (paymentMethod && paymentMethod !== 'all' && payment.paymentMethod !== paymentMethod) return false;
            
            // Lọc theo từ khóa tìm kiếm
            if (search && search.trim() !== '') {
                const searchLower = search.toLowerCase();
                const matchesId = payment._id.toLowerCase().includes(searchLower);
                const matchesOrderId = payment.orderId.toLowerCase().includes(searchLower);
                const matchesUserName = payment.user?.name?.toLowerCase().includes(searchLower);
                
                if (!matchesId && !matchesOrderId && !matchesUserName) return false;
            }
            
            // Lọc theo ngày bắt đầu
            if (startDate) {
                const paymentDate = new Date(payment.createdAt);
                const filterStartDate = new Date(startDate);
                if (paymentDate < filterStartDate) return false;
            }
            
            // Lọc theo ngày kết thúc
            if (endDate) {
                const paymentDate = new Date(payment.createdAt);
                const filterEndDate = new Date(endDate);
                filterEndDate.setHours(23, 59, 59, 999); // Kết thúc của ngày
                if (paymentDate > filterEndDate) return false;
            }
            
            return true;
        });

        // Trả về kết quả
        res.status(200).json({
            success: true,
            totalCount: filteredPayments.length,
            page,
            limit,
            payments: filteredPayments
        });
    } catch (error) {
        logger.error('Failed to get payments', { error });
        res.status(500).json({ 
            success: false,
            message: 'Failed to retrieve payments',
            error: error.message 
        });
    }
});
