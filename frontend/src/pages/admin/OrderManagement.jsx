import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { OrderDetailsModal } from '../../components/admin/OrderDetailsModal';
import { OrderStatusModal } from '../../components/admin/OrderStatusModal';
import { Search, Filter, Eye, Calendar, DollarSign, Edit2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusUpdateOrder, setStatusUpdateOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchOrders();
    }, [currentPage, statusFilter, paymentFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10
            };

            if (statusFilter !== 'all') params.orderStatus = statusFilter;
            if (paymentFilter !== 'all') params.paymentStatus = paymentFilter;
            if (searchTerm) params.search = searchTerm;

            const response = await axios.get(`${API_URL}/orders`, {
                params,
                headers: getAuthHeader()
            });

            setOrders(response.data.orders || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchOrders();
    };

    const getStatusLabel = (status) => {
        const labels = {
            'placed': 'Order Placed',
            'payment-confirmed': 'Payment Confirmed',
            'assembling': 'Assembling',
            'ready': 'Ready for Pickup',
            'on-the-way': 'On the Way',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled',
            'pending': 'Pending',
            'confirmed': 'Confirmed',
            'failed': 'Failed'
        };
        return labels[status] || status;
    };

    const getStatusBadge = (status) => {
        const badges = {
            'placed': 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
            'payment-confirmed': 'bg-blue-600/20 text-blue-400 border-blue-600/30',
            'assembling': 'bg-purple-600/20 text-purple-400 border-purple-600/30',
            'ready': 'bg-indigo-600/20 text-indigo-400 border-indigo-600/30',
            'on-the-way': 'bg-orange-600/20 text-orange-400 border-orange-600/30',
            'delivered': 'bg-green-600/20 text-green-400 border-green-600/30',
            'cancelled': 'bg-red-600/20 text-red-400 border-red-600/30'
        };

        return badges[status] || 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    };

    const getPaymentBadge = (status) => {
        const badges = {
            'pending': 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
            'confirmed': 'bg-green-600/20 text-green-400 border-green-600/30',
            'failed': 'bg-red-600/20 text-red-400 border-red-600/30'
        };

        return badges[status] || 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Order Management</h2>
                    <p className="text-gray-400">Manage and track all customer orders</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-navy-900 p-4 rounded-lg border border-navy-800">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by order number or email..."
                                    className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400"
                                />
                            </div>
                        </form>

                        {/* Order Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                        >
                            <option value="all">All Statuses</option>
                            <option value="placed">Order Placed</option>
                            <option value="payment-confirmed">Payment Confirmed</option>
                            <option value="assembling">Assembling</option>
                            <option value="ready">Ready for Pickup</option>
                            <option value="on-the-way">On the Way</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        {/* Payment Status Filter */}
                        <select
                            value={paymentFilter}
                            onChange={(e) => {
                                setPaymentFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                        >
                            <option value="all">All Payments</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                {/* Orders Table */}
                {loading ? (
                    <div className="bg-navy-900 p-8 rounded-lg border border-navy-800 text-center">
                        <p className="text-gray-400">Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-navy-900 p-8 rounded-lg border border-navy-800 text-center">
                        <p className="text-gray-400">No orders found</p>
                    </div>
                ) : (
                    <div className="bg-navy-900 rounded-lg border border-navy-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-navy-950 border-b border-navy-800">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Order #
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Payment
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-navy-800">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-navy-950 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-white font-medium">{order.orderNumber}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-white font-medium">{order.customerDetails?.name}</p>
                                                    <p className="text-sm text-gray-400">{order.customerDetails?.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-white font-semibold">
                                                    <DollarSign className="h-4 w-4 text-lime-400" />
                                                    LKR {order.total?.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentBadge(order.paymentStatus)}`}>
                                                    {getStatusLabel(order.paymentStatus)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.orderStatus)}`}>
                                                    {getStatusLabel(order.orderStatus)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setStatusUpdateOrder(order);
                                                            setShowStatusModal(true);
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-blue-400 hover:text-blue-500 hover:bg-blue-600/10 rounded transition-colors"
                                                        title="Update status"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                        Status
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-lime-400 hover:text-lime-500 hover:bg-lime-600/10 rounded transition-colors"
                                                        title="View details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-navy-950 px-6 py-4 flex items-center justify-between border-t border-navy-800">
                                <div className="text-sm text-gray-400">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdate={() => {
                        setSelectedOrder(null);
                        fetchOrders();
                    }}
                />
            )}

            {/* Order Status Update Modal */}
            <OrderStatusModal
                isOpen={showStatusModal}
                onClose={() => {
                    setShowStatusModal(false);
                    setStatusUpdateOrder(null);
                }}
                order={statusUpdateOrder}
                onSuccess={() => {
                    setShowStatusModal(false);
                    setStatusUpdateOrder(null);
                    fetchOrders();
                }}
            />
        </AdminLayout>
    );
};
