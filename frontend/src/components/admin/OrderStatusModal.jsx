import { useState, useEffect } from 'react';
import { X, Package, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const STATUS_OPTIONS = [
    { value: 'placed', label: 'Order Placed', color: 'gray', icon: Package },
    { value: 'payment-confirmed', label: 'Payment Confirmed', color: 'blue', icon: CheckCircle },
    { value: 'assembling', label: 'Assembling', color: 'purple', icon: Package },
    { value: 'ready', label: 'Ready for Pickup', color: 'yellow', icon: Package },
    { value: 'on-the-way', label: 'On the Way', color: 'orange', icon: Truck },
    { value: 'delivered', label: 'Delivered', color: 'green', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: 'red', icon: AlertCircle }
];

export const OrderStatusModal = ({ isOpen, onClose, order, onSuccess }) => {
    const [formData, setFormData] = useState({
        orderStatus: '',
        trackingNumber: '',
        carrier: '',
        estimatedDelivery: '',
        note: ''
    });
    const [loading, setLoading] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);

    useEffect(() => {
        if (order) {
            setFormData({
                orderStatus: order.orderStatus || '',
                trackingNumber: order.trackingInfo?.trackingNumber || '',
                carrier: order.trackingInfo?.carrier || '',
                estimatedDelivery: order.trackingInfo?.estimatedDelivery
                    ? new Date(order.trackingInfo.estimatedDelivery).toISOString().split('T')[0]
                    : '',
                note: ''
            });
        }
    }, [order]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.orderStatus) {
            toast.error('Please select an order status');
            return;
        }

        try {
            setLoading(true);

            const updateData = {
                orderStatus: formData.orderStatus,
                note: formData.note || undefined
            };

            // Add tracking info if provided
            if (formData.trackingNumber || formData.carrier || formData.estimatedDelivery) {
                updateData.trackingInfo = {
                    trackingNumber: formData.trackingNumber || undefined,
                    carrier: formData.carrier || undefined,
                    estimatedDelivery: formData.estimatedDelivery || undefined
                };
            }

            await axios.put(
                `${API_URL}/orders/${order._id}/status`,
                updateData,
                { headers: getAuthHeader() }
            );

            toast.success('Order status updated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error(error.response?.data?.message || 'Failed to update order status');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const currentStatus = STATUS_OPTIONS.find(s => s.value === formData.orderStatus);
    const StatusIcon = currentStatus?.icon || Package;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-navy-900 rounded-lg border border-navy-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-navy-800">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Update Order Status</h2>
                        <p className="text-gray-400 mt-1">Order #{order?.orderNumber}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Current Status Display */}
                    <div className="bg-navy-950 p-4 rounded-lg border border-navy-800">
                        <div className="flex items-center gap-3">
                            <StatusIcon className={`h-6 w-6 text-${currentStatus?.color}-400`} />
                            <div>
                                <p className="text-sm text-gray-400">Current Status</p>
                                <p className="text-white font-medium">{currentStatus?.label || 'Unknown'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Receipt View */}
                    {order?.paymentReceipt?.url && (
                        <div className="bg-navy-950 p-4 rounded-lg border border-navy-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-6 w-6 text-lime-400" />
                                <div>
                                    <p className="text-sm text-gray-400">Payment Receipt</p>
                                    <p className="text-white font-medium">Receipt Available</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowReceipt(true)}
                                className="px-4 py-2 bg-navy-900 text-lime-400 border border-lime-400/30 rounded-lg hover:bg-lime-400/10 transition-colors text-sm font-medium"
                            >
                                View Receipt
                            </button>
                        </div>
                    )}

                    {/* Order Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            New Status *
                        </label>
                        <select
                            value={formData.orderStatus}
                            onChange={(e) => setFormData({ ...formData, orderStatus: e.target.value })}
                            className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                            required
                        >
                            <option value="">Select status...</option>
                            {STATUS_OPTIONS.map(status => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tracking Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Truck className="h-5 w-5 text-lime-400" />
                            Tracking Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Tracking Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.trackingNumber}
                                    onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                                    placeholder="e.g., TRK123456789"
                                    className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Carrier
                                </label>
                                <input
                                    type="text"
                                    value={formData.carrier}
                                    onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                                    placeholder="e.g., DHL, FedEx, UPS"
                                    className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Estimated Delivery Date
                            </label>
                            <input
                                type="date"
                                value={formData.estimatedDelivery}
                                onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                                className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                            />
                        </div>
                    </div>

                    {/* Internal Note */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Internal Note (Optional)
                        </label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            placeholder="Add any notes about this status update..."
                            rows={3}
                            className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400 resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-navy-800 text-white rounded-lg hover:bg-navy-700 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-lime-400 text-navy-950 rounded-lg hover:bg-lime-500 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Status'}
                        </button>
                    </div>
                </form>
            </div>
            {/* Receipt Image Modal */}
            {showReceipt && order?.paymentReceipt?.url && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
                    onClick={() => setShowReceipt(false)}
                >
                    <div className="max-w-4xl max-h-[90vh] overflow-auto relative">
                        <button
                            onClick={() => setShowReceipt(false)}
                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <img
                            src={order.paymentReceipt.url}
                            alt="Payment Receipt"
                            className="w-full h-auto rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
