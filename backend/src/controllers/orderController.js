import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import { generateInvoicePDF } from '../services/invoiceService.js';
import { sendEmail } from '../services/emailService.js';

// Create new order (guest checkout)
export const createOrder = async (req, res) => {
    try {
        const {
            customerDetails,
            items,
            paymentMethod,
            paymentReceipt,
            notes
        } = req.body;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerDetails.email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Validate required fields
        if (!customerDetails.firstName || !customerDetails.lastName || !customerDetails.mobile ||
            !customerDetails.address || !customerDetails.city || !customerDetails.province) {
            return res.status(400).json({
                success: false,
                message: 'All customer details are required'
            });
        }

        // Find or create customer
        let customer = await Customer.findOne({ email: customerDetails.email });

        if (!customer) {
            // Create new customer
            customer = await Customer.create({
                firstName: customerDetails.firstName,
                lastName: customerDetails.lastName,
                email: customerDetails.email,
                mobile: customerDetails.mobile,
                addresses: [{
                    address: customerDetails.address,
                    city: customerDetails.city,
                    province: customerDetails.province,
                    isDefault: true
                }]
            });
        } else {
            // Update existing customer if needed
            const addressExists = customer.addresses.some(
                addr => addr.address === customerDetails.address &&
                    addr.city === customerDetails.city
            );

            if (!addressExists) {
                customer.addresses.push({
                    address: customerDetails.address,
                    city: customerDetails.city,
                    province: customerDetails.province,
                    isDefault: false
                });
                await customer.save();
            }
        }

        // Validate items and calculate totals
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.productId} not found`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.title}`
                });
            }

            const itemPrice = product.salePrice || product.price;
            subtotal += itemPrice * item.quantity;

            orderItems.push({
                product: product._id,
                name: product.title,
                price: itemPrice,
                quantity: item.quantity,
                image: product.images?.[0] || ''
            });
        }

        // Calculate shipping cost (you can adjust this logic)
        const shippingCost = 500; // Fixed shipping cost
        const total = subtotal + shippingCost;

        // Create order
        const order = await Order.create({
            customer: customer._id,
            customerDetails,
            items: orderItems,
            subtotal,
            shippingCost,
            total,
            total,
            paymentMethod,
            paymentReceipt,
            notes,
            paymentStatus: 'pending',
            orderStatus: 'placed'
        });

        // Reduce stock for each product
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }

        // Update customer stats
        customer.totalOrders += 1;
        customer.totalSpent += total;
        customer.orders.push(order._id);
        await customer.save();

        // Generate Invoice PDF and Send Email
        try {
            const invoiceBuffer = await generateInvoicePDF(order);

            await sendEmail(
                customerDetails.email,
                `Order Confirmation - #${order.orderNumber}`,
                `Dear ${customerDetails.firstName},\n\nThank you for your order! Please find your invoice attached.\n\nBest regards,\nGeekspot Team`,
                [
                    {
                        filename: `Invoice-${order.orderNumber}.pdf`,
                        content: invoiceBuffer
                    }
                ]
            );
        } catch (emailError) {
            console.error('Error sending invoice email:', emailError);
            // Continue execution, don't fail the order
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                total: order.total,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
                customerEmail: customerDetails.email
            }
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
};

// Get order by order number (for tracking)
export const getOrderByNumber = async (req, res) => {
    try {
        const { orderNumber } = req.params;

        const order = await Order.findOne({ orderNumber })
            .populate('items.product')
            .populate('customer');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order'
        });
    }
};

// Get order by ID
export const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product')
            .populate('customer');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order'
        });
    }
};

// Admin: Get all orders
export const getAllOrders = async (req, res) => {
    try {
        const {
            paymentStatus,
            orderStatus,
            page = 1,
            limit = 20,
            sort = '-createdAt'
        } = req.query;

        const filter = {};
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        if (orderStatus) filter.orderStatus = orderStatus;

        const skip = (page - 1) * limit;

        const orders = await Order.find(filter)
            .sort(sort)
            .limit(Number(limit))
            .skip(skip)
            .populate('customer', 'firstName lastName email mobile')
            .populate('items.product', 'title');

        const total = await Order.countDocuments(filter);

        res.json({
            success: true,
            orders,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin: Update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, trackingInfo, note } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Add to status history
        order.statusHistory.push({
            status: orderStatus,
            updatedBy: req.user?.email || 'Admin',
            timestamp: new Date(),
            note: note || `Status changed to ${orderStatus}`
        });

        order.orderStatus = orderStatus;

        // Auto-update payment status when order is confirmed
        if (orderStatus === 'payment-confirmed') {
            order.paymentStatus = 'confirmed';
        }

        // Update tracking info if provided
        if (trackingInfo) {
            order.trackingInfo = {
                ...order.trackingInfo,
                ...trackingInfo
            };
        }

        await order.save();

        res.json({
            success: true,
            message: 'Order status updated successfully',
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                trackingInfo: order.trackingInfo,
                statusHistory: order.statusHistory
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin: Update payment status
export const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus, notes } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.paymentStatus = paymentStatus;
        order.verificationNotes = notes;
        order.verifiedAt = new Date();

        // Update order status based on payment
        if (paymentStatus === 'confirmed' && order.orderStatus === 'placed') {
            order.orderStatus = 'payment-confirmed';
        } else if (paymentStatus === 'failed') {
            order.orderStatus = 'cancelled';

            // Restore stock if payment failed
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            }
        }

        await order.save();

        res.json({
            success: true,
            message: 'Payment status updated successfully',
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Track order by order number and email (public)
export const trackOrder = async (req, res) => {
    try {
        const { orderNumber, email } = req.body;

        // Validate inputs
        if (!orderNumber || !email) {
            return res.status(400).json({
                success: false,
                message: 'Order number and email are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Find order by order number
        const order = await Order.findOne({ orderNumber })
            .populate('items.product')
            .populate('customer');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found. Please check your order number.'
            });
        }

        // Verify email matches
        if (order.customerDetails.email.toLowerCase() !== email.toLowerCase()) {
            return res.status(403).json({
                success: false,
                message: 'Email does not match the order. Please check your details.'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Track order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track order. Please try again.'
        });
    }
};

// Admin: Update tracking information
export const updateTrackingInfo = async (req, res) => {
    try {
        const { trackingNumber, carrier, estimatedDelivery } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.trackingInfo = {
            trackingNumber,
            carrier,
            estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined
        };

        await order.save();

        res.json({
            success: true,
            message: 'Tracking information updated successfully',
            trackingInfo: order.trackingInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Admin: Add order note
export const addOrderNote = async (req, res) => {
    try {
        const { note, isInternal } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (!note || note.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Note cannot be empty'
            });
        }

        order.orderNotes.push({
            note: note.trim(),
            author: req.user?.email || 'Admin',
            isInternal: isInternal !== undefined ? isInternal : true,
            createdAt: new Date()
        });

        await order.save();

        res.json({
            success: true,
            message: 'Note added successfully',
            orderNotes: order.orderNotes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

