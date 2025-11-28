import { X, User, Mail, Phone, MapPin, Package, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const OrderDetailsModal = ({ order, onClose, onUpdate }) => {
    const [orderStatus, setOrderStatus] = useState(order.orderStatus);
    const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
    const [updating, setUpdating] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);

    const handleUpdateOrderStatus = async () => {
        try {
            setUpdating(true);
            await axios.put(
                `${API_URL}/orders/${order._id}/status`,
                { orderStatus },
                { headers: getAuthHeader() }
            );
            toast.success('Order status updated successfully');
            onUpdate();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdatePaymentStatus = async () => {
        try {
            setUpdating(true);
            await axios.put(
                `${API_URL}/orders/${order._id}/payment-status`,
                { paymentStatus },
                { headers: getAuthHeader() }
            );
            toast.success('Payment status updated successfully');
            onUpdate();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update payment status');
        } finally {
            setUpdating(false);
        }
    };

    const orderStatuses = [
        'placed',
        'payment-confirmed',
        'assembling',
        'ready',
        'on-the-way',
        'delivered',
        'cancelled'
    ];

    const paymentStatuses = ['pending', 'confirmed', 'failed'];

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

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className="bg-navy-900 rounded-xl max-w-4xl w-full border border-navy-800"
                style={{ maxHeight: '90vh', overflowY: 'auto', display: 'block' }}
            >
                {/* Header */}
                <div className="bg-navy-900 border-b border-navy-800 p-6 flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Order Details</h2>
                        <p className="text-gray-400 text-sm mt-1">Order #{order.orderNumber}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Customer Information */}
                    <div className="bg-navy-950 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-lime-400" />
                            Customer Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-400">Name</p>
                                    <p className="text-white">
                                        {order.customerDetails?.firstName} {order.customerDetails?.lastName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-400">Email</p>
                                    <p className="text-white">{order.customerDetails?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-400">Mobile</p>
                                    <p className="text-white">{order.customerDetails?.mobile}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-400">Address</p>
                                    <p className="text-white">{order.customerDetails?.address}</p>
                                    <p className="text-gray-400 text-sm">
                                        {order.customerDetails?.city}, {order.customerDetails?.province}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-navy-950 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Package className="h-5 w-5 text-lime-400" />
                            Order Items
                        </h3>
                        <div className="space-y-3">
                            {order.items?.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 bg-navy-900 rounded-lg">
                                    {item.product?.images?.[0] && (
                                        <img
                                            src={item.product.images[0]}
                                            alt={item.product.title}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{item.product?.title || 'Product'}</p>
                                        <p className="text-sm text-gray-400">
                                            Qty: {item.quantity} × LKR {item.price?.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-semibold">
                                            LKR {(item.quantity * item.price)?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-navy-950 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-lime-400" />
                            Payment Information
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Payment Method</span>
                                <span className="text-white">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Payment Status</span>
                                <select
                                    value={paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                    className="bg-navy-900 border border-navy-700 text-white px-3 py-1 rounded"
                                >
                                    {paymentStatuses.map((status) => (
                                        <option key={status} value={status}>{getStatusLabel(status)}</option>
                                    ))}
                                </select>
                            </div>
                            {paymentStatus !== order.paymentStatus && (
                                <button
                                    onClick={handleUpdatePaymentStatus}
                                    disabled={updating}
                                    className="w-full bg-lime-400 hover:bg-lime-500 text-navy-950 font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {updating ? 'Updating...' : 'Update Payment Status'}
                                </button>
                            )}
                            {order.paymentReceipt?.url && (
                                <div>
                                    <p className="text-gray-400 mb-2">Receipt Image</p>
                                    <button
                                        onClick={() => setShowReceipt(true)}
                                        className="text-lime-400 hover:text-lime-500 underline"
                                    >
                                        View Receipt
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Status */}
                    <div className="bg-navy-950 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-4">Order Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Current Status</span>
                                <select
                                    value={orderStatus}
                                    onChange={(e) => setOrderStatus(e.target.value)}
                                    className="bg-navy-900 border border-navy-700 text-white px-3 py-2 rounded"
                                >
                                    {orderStatuses.map((status) => (
                                        <option key={status} value={status}>{getStatusLabel(status)}</option>
                                    ))}
                                </select>
                            </div>
                            {orderStatus !== order.orderStatus && (
                                <button
                                    onClick={handleUpdateOrderStatus}
                                    disabled={updating}
                                    className="w-full bg-lime-400 hover:bg-lime-500 text-navy-950 font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {updating ? 'Updating...' : 'Update Order Status'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tracking Information */}
                    {order.trackingInfo && (order.trackingInfo.trackingNumber || order.trackingInfo.carrier) && (
                        <div className="bg-navy-950 p-4 rounded-lg border border-blue-600/30">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-400" />
                                Tracking Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {order.trackingInfo.trackingNumber && (
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Tracking Number</p>
                                        <p className="text-white font-medium">{order.trackingInfo.trackingNumber}</p>
                                    </div>
                                )}
                                {order.trackingInfo.carrier && (
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Carrier</p>
                                        <p className="text-white font-medium">{order.trackingInfo.carrier}</p>
                                    </div>
                                )}
                                {order.trackingInfo.estimatedDelivery && (
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Estimated Delivery</p>
                                        <p className="text-white font-medium">
                                            {new Date(order.trackingInfo.estimatedDelivery).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Status History */}
                    {order.statusHistory && order.statusHistory.length > 0 && (
                        <div className="bg-navy-950 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-lime-400" />
                                Status History
                            </h3>
                            <div className="space-y-3">
                                {order.statusHistory.slice().reverse().map((history, index) => (
                                    <div key={index} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2 h-2 rounded-full bg-lime-400"></div>
                                            {index < order.statusHistory.length - 1 && (
                                                <div className="w-0.5 h-full bg-navy-700 mt-1"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-white font-medium capitalize">
                                                    {history.status.replace(/-/g, ' ')}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(history.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                            {history.note && (
                                                <p className="text-sm text-gray-400">{history.note}</p>
                                            )}
                                            {history.updatedBy && (
                                                <p className="text-xs text-gray-500 mt-1">by {history.updatedBy}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Order Notes */}
                    {order.orderNotes && order.orderNotes.length > 0 && (
                        <div className="bg-navy-950 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Mail className="h-5 w-5 text-purple-400" />
                                Order Notes
                            </h3>
                            <div className="space-y-3">
                                {order.orderNotes.slice().reverse().map((note, index) => (
                                    <div key={index} className="p-3 bg-navy-900 rounded border border-navy-800">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-white">{note.author}</p>
                                                {note.isInternal && (
                                                    <span className="px-2 py-0.5 rounded text-xs bg-purple-600/20 text-purple-400 border border-purple-600/30">
                                                        Internal
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                {new Date(note.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <p className="text-gray-300 text-sm">{note.note}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Order Totals */}
                    <div className="bg-navy-950 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Subtotal</span>
                                <span className="text-white">LKR {order.subtotal?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Shipping</span>
                                <span className="text-white">LKR {order.shippingCost?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-navy-800">
                                <span className="text-white font-semibold">Total</span>
                                <span className="text-lime-400 font-bold text-xl">
                                    LKR {order.total?.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Receipt Image Modal */}
            {showReceipt && order.paymentReceipt?.url && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
                    onClick={() => setShowReceipt(false)}
                >
                    <div className="max-w-4xl max-h-[90vh] overflow-auto">
                        <img
                            src={order.paymentReceipt.url}
                            alt="Payment Receipt"
                            className="w-full h-auto rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
