import Customer from '../models/Customer.js';
import Order from '../models/Order.js';

// Get all customers (Admin only)
export const getAllCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', sort = '-createdAt' } = req.query;

        // Build search query
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } }
            ];
        }

        const customers = await Customer.find(query)
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v');

        const count = await Customer.countDocuments(query);

        // Get order count and total spent for each customer
        const customersWithStats = await Promise.all(
            customers.map(async (customer) => {
                const orders = await Order.find({ customer: customer._id });
                const orderCount = orders.length;
                const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

                return {
                    ...customer.toObject(),
                    orderCount,
                    totalSpent
                };
            })
        );

        res.json({
            success: true,
            customers: customersWithStats,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customers'
        });
    }
};

// Get customer by ID (Admin only)
export const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Get customer stats
        const orders = await Order.find({ customer: customer._id });
        const orderCount = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
        const lastOrderDate = orders.length > 0
            ? orders.sort((a, b) => b.createdAt - a.createdAt)[0].createdAt
            : null;

        res.json({
            success: true,
            customer: {
                ...customer.toObject(),
                orderCount,
                totalSpent,
                lastOrderDate
            }
        });
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer'
        });
    }
};

// Get customer orders (Admin only)
export const getCustomerOrders = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const orders = await Order.find({ customer: id })
            .sort('-createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('items.product', 'title price images');

        const count = await Order.countDocuments({ customer: id });

        res.json({
            success: true,
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (error) {
        console.error('Get customer orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer orders'
        });
    }
};

// Get customer statistics (Admin only)
export const getCustomerStats = async (req, res) => {
    try {
        const totalCustomers = await Customer.countDocuments();

        // Get customers with orders
        const customersWithOrders = await Order.distinct('customer');
        const activeCustomers = customersWithOrders.length;

        // Get new customers this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const newCustomersThisMonth = await Customer.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        // Get top customers by spending
        const topCustomers = await Order.aggregate([
            {
                $group: {
                    _id: '$customer',
                    totalSpent: { $sum: '$total' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'customers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'customerInfo'
                }
            },
            { $unwind: '$customerInfo' },
            {
                $project: {
                    _id: 1,
                    name: '$customerInfo.name',
                    email: '$customerInfo.email',
                    totalSpent: 1,
                    orderCount: 1
                }
            }
        ]);

        res.json({
            success: true,
            stats: {
                totalCustomers,
                activeCustomers,
                newCustomersThisMonth,
                topCustomers
            }
        });
    } catch (error) {
        console.error('Get customer stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer statistics'
        });
    }
};

// Search customers (Admin only)
export const searchCustomers = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        const customers = await Customer.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { mobile: { $regex: q, $options: 'i' } }
            ]
        })
            .limit(20)
            .select('name email mobile createdAt');

        res.json({
            success: true,
            count: customers.length,
            customers
        });
    } catch (error) {
        console.error('Search customers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching customers'
        });
    }
};