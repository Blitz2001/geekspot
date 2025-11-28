import { X, User, Mail, Phone, MapPin, TrendingUp, ShoppingBag, DollarSign, Calendar, Send, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { OrderDetailsModal } from './OrderDetailsModal';
import { EmailCampaignModal } from './EmailCampaignModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const CustomerDetailsModal = ({ customerId, isOpen, onClose, onEmailClick }) => {
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailRecipient, setEmailRecipient] = useState(null);

    useEffect(() => {
        if (isOpen && customerId) {
            fetchCustomerDetails();
            fetchCustomerOrders(1);
        }
    }, [isOpen, customerId]);

    const fetchCustomerDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${API_URL}/customers/${customerId}`,
                { headers: getAuthHeader() }
            );
            setCustomer(response.data.customer);
        } catch (error) {
            toast.error('Failed to fetch customer details');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerOrders = async (page) => {
        try {
            setOrdersLoading(true);
            const response = await axios.get(
                `${API_URL}/customers/${customerId}/orders?page=${page}&limit=10`,
                { headers: getAuthHeader() }
            );
            setOrders(response.data.orders);
            setTotalPages(response.data.totalPages);
            setCurrentPage(page);
        } catch (error) {
            toast.error('Failed to fetch customer orders');
            console.error(error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchCustomerOrders(page);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            refunded: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return `LKR ${amount?.toLocaleString('en-US') || 0}`;
    };

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-[#1a2332] rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-slideUp border border-[#2d3748]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex justify-between items-start">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center text-2xl font-bold">
                                {loading ? '...' : getInitials(`${customer?.firstName} ${customer?.lastName}`)}
                            </div>
                            <div>
                                {loading ? (
                                    <div className="animate-pulse">
                                        <div className="h-6 bg-white bg-opacity-20 rounded w-48 mb-2"></div>
                                        <div className="h-4 bg-white bg-opacity-20 rounded w-32"></div>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-bold">{customer?.firstName} {customer?.lastName}</h2>
                                        <div className="flex items-center gap-4 mt-2 text-sm opacity-90">
                                            <div className="flex items-center gap-1">
                                                <Mail size={14} />
                                                <span>{customer?.email}</span>
                                            </div>
                                            {customer?.mobile && (
                                                <div className="flex items-center gap-1">
                                                    <Phone size={14} />
                                                    <span>{customer?.mobile}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                                            <Calendar size={12} />
                                            <span>Customer since {formatDate(customer?.createdAt)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] bg-[#0f1419]">
                        {loading ? (
                            <div className="animate-pulse space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-24 bg-[#1a2332] rounded-lg"></div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Analytics Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-4 rounded-lg border border-blue-500/20">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-blue-400 font-medium">Total Orders</p>
                                                <p className="text-2xl font-bold text-white">{customer?.orderCount || 0}</p>
                                            </div>
                                            <ShoppingBag className="text-blue-400" size={32} />
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-lime-500/10 to-lime-600/10 p-4 rounded-lg border border-lime-500/20">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-lime-400 font-medium">Total Spent</p>
                                                <p className="text-2xl font-bold text-white">{formatCurrency(customer?.totalSpent)}</p>
                                            </div>
                                            <DollarSign className="text-lime-400" size={32} />
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-4 rounded-lg border border-purple-500/20">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-purple-400 font-medium">Avg Order Value</p>
                                                <p className="text-2xl font-bold text-white">
                                                    {customer?.orderCount > 0
                                                        ? formatCurrency(customer?.totalSpent / customer?.orderCount)
                                                        : formatCurrency(0)
                                                    }
                                                </p>
                                            </div>
                                            <TrendingUp className="text-purple-400" size={32} />
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 p-4 rounded-lg border border-orange-500/20">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-orange-400 font-medium">Last Order</p>
                                                <p className="text-sm font-bold text-white">
                                                    {customer?.lastOrderDate
                                                        ? formatDate(customer?.lastOrderDate)
                                                        : 'No orders yet'
                                                    }
                                                </p>
                                            </div>
                                            <Calendar className="text-orange-400" size={32} />
                                        </div>
                                    </div>
                                </div>

                                {/* Order History */}
                                <div className="bg-[#1a2332] rounded-lg p-6 border border-[#2d3748]">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                                        <ShoppingBag size={20} />
                                        Order History
                                    </h3>

                                    {ordersLoading ? (
                                        <div className="animate-pulse space-y-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-16 bg-[#0f1419] rounded"></div>
                                            ))}
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400">
                                            <ShoppingBag size={48} className="mx-auto mb-3 opacity-30" />
                                            <p>No orders yet</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-[#2d3748]">
                                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Order ID</th>
                                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Date</th>
                                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Status</th>
                                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Payment</th>
                                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orders.map((order) => (
                                                            <tr
                                                                key={order._id}
                                                                onClick={() => setSelectedOrder(order)}
                                                                className="border-b border-[#2d3748] hover:bg-[#0f1419] cursor-pointer transition-colors"
                                                            >
                                                                <td className="py-3 px-4 text-sm font-medium text-purple-400">
                                                                    #{order._id.slice(-8).toUpperCase()}
                                                                </td>
                                                                <td className="py-3 px-4 text-sm text-gray-300">
                                                                    {formatDate(order.createdAt)}
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                                                        {order.orderStatus}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                                        {order.paymentStatus}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4 text-sm font-semibold text-right text-lime-400">
                                                                    {formatCurrency(order.total)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <div className="flex justify-center items-center gap-2 mt-4">
                                                    <button
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                        className="px-3 py-1 rounded bg-[#0f1419] border border-[#2d3748] text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3748]"
                                                    >
                                                        Previous
                                                    </button>
                                                    <span className="text-sm text-gray-400">
                                                        Page {currentPage} of {totalPages}
                                                    </span>
                                                    <button
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                        className="px-3 py-1 rounded bg-[#0f1419] border border-[#2d3748] text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d3748]"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-[#2d3748] p-4 bg-[#1a2332] flex justify-between items-center">
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setEmailRecipient(customer);
                                    setShowEmailModal(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                disabled={loading}
                            >
                                <Send size={18} />
                                Send Email
                            </button>
                            <button
                                onClick={() => {
                                    setEmailRecipient('all');
                                    setShowEmailModal(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <Users size={18} />
                                Broadcast to All
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-[#2d3748] text-gray-300 rounded-lg hover:bg-[#3d4758] transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdate={() => {
                        setSelectedOrder(null);
                        fetchCustomerOrders(currentPage);
                    }}
                />
            )}

            {/* Email Campaign Modal */}
            <EmailCampaignModal
                isOpen={showEmailModal}
                onClose={() => {
                    setShowEmailModal(false);
                    setEmailRecipient(null);
                }}
                recipient={emailRecipient}
            />
        </>
    );
};
