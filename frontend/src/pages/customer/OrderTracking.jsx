import { useState } from 'react';
import { Search, Package, CheckCircle, AlertCircle, Mail, Phone, MapPin, Truck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

export const OrderTracking = () => {
    const [orderNumber, setOrderNumber] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);

    // Order status stages
    const stages = [
        { key: 'placed', label: 'Order Placed' },
        { key: 'payment-confirmed', label: 'Payment Confirmed' },
        { key: 'assembling', label: 'Assembling' },
        { key: 'ready', label: 'Order Ready' },
        { key: 'on-the-way', label: 'On the Way' },
        { key: 'delivered', label: 'Delivered' }
    ];

    const handleTrackOrder = async (e) => {
        e.preventDefault();

        // Validate inputs
        if (!orderNumber.trim()) {
            toast.error('Please enter your order number');
            return;
        }

        if (!email.trim()) {
            toast.error('Please enter your email address');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setOrder(null);

            // Call API to track order
            const response = await orderService.trackOrder(orderNumber, email);

            if (response.success) {
                setOrder(response.order);
                toast.success('Order found!');
            } else {
                setError('Order not found. Please check your order number and email.');
            }
        } catch (err) {
            console.error('Order tracking error:', err);
            setError(err.response?.data?.message || 'Order not found. Please check your details and try again.');
            toast.error('Order not found');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setOrderNumber('');
        setEmail('');
        setOrder(null);
        setError(null);
    };

    // Get current stage index
    const currentStageIndex = order ? stages.findIndex(stage => stage.key === order.orderStatus) : -1;

    return (
        <div className="min-h-screen bg-navy-950 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lime-400/20 mb-4">
                        <Package className="h-8 w-8 text-lime-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Track Your Order</h1>
                    <p className="text-gray-400">Enter your order details to check the status</p>
                </div>

                {/* Tracking Form */}
                {!order && (
                    <div className="card p-6 mb-6">
                        <form onSubmit={handleTrackOrder} className="space-y-4">
                            <Input
                                label="Order Number"
                                name="orderNumber"
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                placeholder="e.g., GS17640567891234"
                                required
                            />

                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="john@example.com"
                                required
                            />

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    'Searching...'
                                ) : (
                                    <>
                                        <Search className="h-5 w-5" />
                                        Track Order
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-navy-800">
                            <p className="text-sm text-gray-400 text-center">
                                💡 Your order number was sent to your email after placing the order
                            </p>
                        </div>
                    </div>
                )}

                {/* Order Details */}
                {order && (
                    <>
                        {/* Payment Pending Alert */}
                        {order.paymentStatus === 'pending' && (
                            <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-yellow-500 font-semibold mb-1">Payment Pending</h3>
                                        <p className="text-yellow-200 text-sm">
                                            Your order is waiting for payment confirmation. Please contact our sales team at{' '}
                                            <a href="tel:+94766303131" className="underline hover:text-yellow-100">
                                                0766 303 131
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Order Progress Tracker */}
                        <div className="card p-6 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Order Status</h2>
                                <button
                                    onClick={handleReset}
                                    className="text-sm text-lime-400 hover:text-lime-300 transition-colors"
                                >
                                    Track Another Order
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative mb-8">
                                {/* Progress Line */}
                                <div className="absolute top-5 left-0 right-0 h-1 bg-navy-800">
                                    <div
                                        className="h-full bg-lime-400 transition-all duration-500"
                                        style={{
                                            width: `${currentStageIndex >= 0 ? (currentStageIndex / (stages.length - 1)) * 100 : 0}%`
                                        }}
                                    />
                                </div>

                                {/* Stages */}
                                <div className="relative flex justify-between">
                                    {stages.map((stage, index) => {
                                        const isCompleted = index <= currentStageIndex;
                                        const isCurrent = index === currentStageIndex;

                                        return (
                                            <div key={stage.key} className="flex flex-col items-center" style={{ width: '16.66%' }}>
                                                {/* Circle */}
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${isCompleted
                                                        ? 'bg-lime-400 text-navy-950'
                                                        : 'bg-navy-800 text-gray-500'
                                                        } ${isCurrent ? 'ring-4 ring-lime-400/30' : ''}`}
                                                >
                                                    {isCompleted ? (
                                                        <CheckCircle className="h-5 w-5" />
                                                    ) : (
                                                        <span className="text-sm font-semibold">{index + 1}</span>
                                                    )}
                                                </div>

                                                {/* Label */}
                                                <p
                                                    className={`text-xs text-center ${isCompleted ? 'text-white font-medium' : 'text-gray-500'
                                                        }`}
                                                >
                                                    {stage.label}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Current Status Message */}
                            <div className="bg-navy-900 rounded-lg p-4">
                                <p className="text-sm text-gray-400 mb-1">Current Status</p>
                                <p className="text-white font-semibold">
                                    {stages[currentStageIndex]?.label || 'Processing'}
                                </p>
                            </div>
                        </div>

                        {/* Tracking Information */}
                        {order.trackingInfo && (order.trackingInfo.trackingNumber || order.trackingInfo.carrier || order.trackingInfo.estimatedDelivery) && (
                            <div className="card p-6 mb-6 border border-blue-500/30">
                                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-blue-400" />
                                    Tracking Details
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {order.trackingInfo.trackingNumber && (
                                        <div>
                                            <p className="text-sm text-gray-400 mb-1">Tracking Number</p>
                                            <p className="text-white font-mono font-medium bg-navy-900 px-3 py-1 rounded inline-block">
                                                {order.trackingInfo.trackingNumber}
                                            </p>
                                        </div>
                                    )}
                                    {order.trackingInfo.carrier && (
                                        <div>
                                            <p className="text-sm text-gray-400 mb-1">Carrier</p>
                                            <p className="text-white font-medium">{order.trackingInfo.carrier}</p>
                                        </div>
                                    )}
                                    {order.trackingInfo.estimatedDelivery && (
                                        <div>
                                            <p className="text-sm text-gray-400 mb-1">Estimated Delivery</p>
                                            <p className="text-white font-medium">
                                                {new Date(order.trackingInfo.estimatedDelivery).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Order Information */}
                            <div className="card p-6">
                                <h2 className="text-lg font-bold text-white mb-4">Order Information</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Order Number</span>
                                        <span className="text-white font-semibold">{order.orderNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Order Date</span>
                                        <span className="text-white">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Total Amount</span>
                                        <span className="text-lime-400 font-semibold">
                                            LKR {order.total?.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-navy-800">
                                        <span className="text-gray-400">Payment Status</span>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${order.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                            order.paymentStatus === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                                                'bg-red-500/20 text-red-500'
                                            }`}>
                                            {order.paymentStatus?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Information */}
                            <div className="card p-6">
                                <h2 className="text-lg font-bold text-white mb-4">Delivery Information</h2>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-gray-400 mb-2 flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-lime-400" />
                                            Delivery Address
                                        </p>
                                        <p className="text-white">
                                            {order.customerDetails?.address}<br />
                                            {order.customerDetails?.city}, {order.customerDetails?.province}
                                        </p>
                                    </div>
                                    <div className="pt-3 border-t border-navy-800">
                                        <p className="text-gray-400 mb-2">Contact Information</p>
                                        <div className="flex items-center gap-2 text-white mb-2">
                                            <Phone className="h-4 w-4 text-lime-400" />
                                            <span>{order.customerDetails?.mobile}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white">
                                            <Mail className="h-4 w-4 text-lime-400" />
                                            <span>{order.customerDetails?.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        {order.items && order.items.length > 0 && (
                            <div className="card p-6 mb-6">
                                <h2 className="text-lg font-bold text-white mb-4">Order Items</h2>
                                <div className="space-y-3">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4 bg-navy-900 p-3 rounded-lg">
                                            <img
                                                src={item.image || '/placeholder.png'}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/600x400?text=No+Image';
                                                }}
                                            />
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="text-white font-semibold">
                                                LKR {(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Need Help */}
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 text-center">
                            <h3 className="text-yellow-500 font-semibold mb-2">Need Help?</h3>
                            <p className="text-yellow-200 text-sm mb-4">
                                Contact our sales team for assistance with your order
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <a
                                    href="tel:+94772233633"
                                    className="text-lime-400 hover:text-lime-300 font-semibold flex items-center gap-2"
                                >
                                    <Phone className="h-4 w-4" />
                                    0766 303 131
                                </a>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
