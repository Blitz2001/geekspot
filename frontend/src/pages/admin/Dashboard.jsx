import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatCard } from '../../components/admin/StatCard';
import { ShoppingCart, Package, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { getDashboardStats, getTopProducts } from '../../services/adminService';
import toast from 'react-hot-toast';

export const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch dashboard stats
            const statsResponse = await getDashboardStats();
            setStats(statsResponse.stats);

            // Fetch top products
            const productsResponse = await getTopProducts(5);
            setTopProducts(productsResponse.products);

            // Fetch low stock products (stock < 5)
            const { productService } = await import('../../services/productService');
            const lowStockResponse = await productService.getAllProductsAdmin({ limit: 10 });
            const lowStock = lowStockResponse.products.filter(p => p.stock < 5 && p.stock >= 0);
            setLowStockProducts(lowStock);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-white text-lg">Loading dashboard...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
                    <p className="text-gray-400">Welcome back! Here's what's happening with your store.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={ShoppingCart}
                        title="Total Orders"
                        value={stats?.totalOrders || 0}
                        subtitle={`${stats?.ordersToday || 0} orders today`}
                        color="lime"
                    />
                    <StatCard
                        icon={DollarSign}
                        title="Total Revenue"
                        value={`LKR ${(stats?.totalRevenue || 0).toLocaleString()}`}
                        subtitle={`LKR ${(stats?.revenueThisMonth || 0).toLocaleString()} this month`}
                        color="green"
                    />
                    <StatCard
                        icon={Package}
                        title="Total Products"
                        value={stats?.totalProducts || 0}
                        subtitle={`${stats?.pendingOrders || 0} pending orders`}
                        color="purple"
                    />
                    <StatCard
                        icon={Users}
                        title="Total Customers"
                        value={stats?.totalCustomers || 0}
                        subtitle="All registered customers"
                        color="orange"
                    />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Payment Status */}
                    <div className="bg-navy-900 p-6 rounded-lg border border-navy-800">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-lime-400" />
                            Payment Status
                        </h3>
                        {stats?.paymentStats && stats.paymentStats.length > 0 ? (
                            <div className="space-y-3">
                                {stats.paymentStats.map((stat) => (
                                    <div key={stat._id} className="flex items-center justify-between">
                                        <span className="text-gray-300 capitalize">{stat._id || 'Unknown'}</span>
                                        <span className="text-white font-semibold">{stat.count}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">No payment data available</p>
                        )}
                    </div>

                    {/* Order Status */}
                    <div className="bg-navy-900 p-6 rounded-lg border border-navy-800">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-lime-400" />
                            Order Status
                        </h3>
                        {stats?.orderStatusStats && stats.orderStatusStats.length > 0 ? (
                            <div className="space-y-3">
                                {stats.orderStatusStats.map((stat) => (
                                    <div key={stat._id} className="flex items-center justify-between">
                                        <span className="text-gray-300">{stat._id || 'Unknown'}</span>
                                        <span className="text-white font-semibold">{stat.count}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">No order data available</p>
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-navy-900 p-6 rounded-lg border border-navy-800">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5 text-lime-400" />
                        Top Selling Products
                    </h3>
                    {topProducts && topProducts.length > 0 ? (
                        <div className="space-y-4">
                            {topProducts.map((product, index) => (
                                <div key={product._id} className="flex items-center gap-4 p-4 bg-navy-950 rounded-lg">
                                    <div className="text-2xl font-bold text-lime-400 w-8">
                                        #{index + 1}
                                    </div>
                                    {product.images && product.images[0] && (
                                        <img
                                            src={product.images[0].url}
                                            alt={product.title}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h4 className="text-white font-medium">{product.title}</h4>
                                        <p className="text-sm text-gray-400">
                                            LKR {product.price?.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-semibold">{product.totalSold} sold</p>
                                        <p className="text-sm text-gray-400">
                                            LKR {product.totalRevenue?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">No sales data available yet</p>
                        </div>
                    )}
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-navy-900 p-6 rounded-lg border border-orange-600/30">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-400" />
                        Low Stock Alerts
                    </h3>
                    {lowStockProducts && lowStockProducts.length > 0 ? (
                        <div className="space-y-3">
                            {lowStockProducts.map((product) => (
                                <div key={product._id} className="flex items-center justify-between p-3 bg-navy-950 rounded-lg border border-navy-800 hover:border-orange-600/50 transition-colors">
                                    <div className="flex items-center gap-3 flex-1">
                                        {product.images?.[0]?.url && (
                                            <img
                                                src={product.images[0].url}
                                                alt={product.title}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{product.title}</p>
                                            <p className="text-sm text-gray-400">
                                                LKR {product.price?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-medium ${product.stock === 0 ? 'text-red-400' :
                                            product.stock < 5 ? 'text-orange-400' :
                                                'text-yellow-400'
                                            }`}>
                                            {product.stock} units
                                        </span>
                                        {product.stock === 0 && (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-400 border border-red-600/30">
                                                Out of Stock
                                            </span>
                                        )}
                                        {product.stock > 0 && product.stock < 5 && (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-600/20 text-orange-400 border border-orange-600/30">
                                                Low Stock
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">All products have sufficient stock</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-lime-400/10 to-lime-400/5 border border-lime-400/30 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-white mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href="/admin/orders"
                            className="bg-navy-900 hover:bg-navy-800 p-4 rounded-lg transition-colors text-center"
                        >
                            <ShoppingCart className="h-8 w-8 text-lime-400 mx-auto mb-2" />
                            <p className="text-white font-medium">Manage Orders</p>
                        </a>
                        <a
                            href="/admin/products"
                            className="bg-navy-900 hover:bg-navy-800 p-4 rounded-lg transition-colors text-center"
                        >
                            <Package className="h-8 w-8 text-lime-400 mx-auto mb-2" />
                            <p className="text-white font-medium">Manage Products</p>
                        </a>
                        <a
                            href="/admin/customers"
                            className="bg-navy-900 hover:bg-navy-800 p-4 rounded-lg transition-colors text-center"
                        >
                            <Users className="h-8 w-8 text-lime-400 mx-auto mb-2" />
                            <p className="text-white font-medium">View Customers</p>
                        </a>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};
