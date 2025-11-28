import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';

// Get dashboard statistics (Admin only)
export const getDashboardStats = async (req, res) => {
    try {
        // Total orders
        const totalOrders = await Order.countDocuments();

        // Total revenue
        const revenueData = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total' }
                }
            }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // Total products
        const totalProducts = await Product.countDocuments({ isActive: true });

        // Total customers
        const totalCustomers = await Customer.countDocuments();

        // Pending orders
        const pendingOrders = await Order.countDocuments({
            orderStatus: 'Order Placed'
        });

        // Orders today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const ordersToday = await Order.countDocuments({
            createdAt: { $gte: startOfDay }
        });

        // Revenue this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthRevenueData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$total' }
                }
            }
        ]);
        const revenueThisMonth = monthRevenueData.length > 0 ? monthRevenueData[0].revenue : 0;

        // Average order value
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Payment status breakdown
        const paymentStats = await Order.aggregate([
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Order status breakdown
        const orderStatusStats = await Order.aggregate([
            {
                $group: {
                    _id: '$orderStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            stats: {
                totalOrders,
                totalRevenue,
                totalProducts,
                totalCustomers,
                pendingOrders,
                ordersToday,
                revenueThisMonth,
                avgOrderValue,
                paymentStats,
                orderStatusStats
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
};

// Get revenue data (Admin only)
export const getRevenueData = async (req, res) => {
    try {
        const { period = 'month' } = req.query; // day, week, month, year

        let groupBy;
        let startDate = new Date();

        switch (period) {
            case 'day':
                // Last 24 hours
                startDate.setHours(startDate.getHours() - 24);
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' },
                    hour: { $hour: '$createdAt' }
                };
                break;
            case 'week':
                // Last 7 days
                startDate.setDate(startDate.getDate() - 7);
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                };
                break;
            case 'year':
                // Last 12 months
                startDate.setMonth(startDate.getMonth() - 12);
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                };
                break;
            default: // month
                // Last 30 days
                startDate.setDate(startDate.getDate() - 30);
                groupBy = {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                };
        }

        const revenueData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
        ]);

        res.json({
            success: true,
            period,
            data: revenueData
        });
    } catch (error) {
        console.error('Get revenue data error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching revenue data'
        });
    }
};

// Get top products (Admin only)
export const getTopProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const topProducts = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalSold: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $project: {
                    _id: 1,
                    title: '$productInfo.title',
                    price: '$productInfo.price',
                    images: '$productInfo.images',
                    totalSold: 1,
                    totalRevenue: 1
                }
            }
        ]);

        res.json({
            success: true,
            products: topProducts
        });
    } catch (error) {
        console.error('Get top products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching top products'
        });
    }
};

// Get order trends (Admin only)
export const getOrderTrends = async (req, res) => {
    try {
        const { days = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const trends = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: '$total' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        res.json({
            success: true,
            days: parseInt(days),
            trends
        });
    } catch (error) {
        console.error('Get order trends error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order trends'
        });
    }
};

// Get customer insights (Admin only)
export const getCustomerInsights = async (req, res) => {
    try {
        // New customers this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const newCustomers = await Customer.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        // Repeat customers (customers with more than 1 order)
        const repeatCustomers = await Order.aggregate([
            {
                $group: {
                    _id: '$customer',
                    orderCount: { $sum: 1 }
                }
            },
            {
                $match: {
                    orderCount: { $gt: 1 }
                }
            },
            {
                $count: 'count'
            }
        ]);

        const repeatCustomerCount = repeatCustomers.length > 0 ? repeatCustomers[0].count : 0;

        // Average orders per customer
        const totalCustomers = await Customer.countDocuments();
        const totalOrders = await Order.countDocuments();
        const avgOrdersPerCustomer = totalCustomers > 0 ? totalOrders / totalCustomers : 0;

        // Customer lifetime value
        const lifetimeValue = await Order.aggregate([
            {
                $group: {
                    _id: '$customer',
                    totalSpent: { $sum: '$total' }
                }
            },
            {
                $group: {
                    _id: null,
                    avgLifetimeValue: { $avg: '$totalSpent' }
                }
            }
        ]);

        const avgLifetimeValue = lifetimeValue.length > 0 ? lifetimeValue[0].avgLifetimeValue : 0;

        res.json({
            success: true,
            insights: {
                newCustomersThisMonth: newCustomers,
                repeatCustomers: repeatCustomerCount,
                avgOrdersPerCustomer: parseFloat(avgOrdersPerCustomer.toFixed(2)),
                avgLifetimeValue: parseFloat(avgLifetimeValue.toFixed(2))
            }
        });
    } catch (error) {
        console.error('Get customer insights error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer insights'
        });
    }
};
