import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Home, Mail, Phone, AlertCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const OrderConfirmation = () => {
    const location = useLocation();
    const order = location.state?.order;

    // Fallback if no order data (shouldn't happen in normal flow)
    const orderNumber = order?.orderNumber || `GS${Date.now().toString().slice(-8)}`;
    const total = order?.total || 0;
    const customerEmail = order?.customerEmail || 'customer@example.com';
    const paymentStatus = order?.paymentStatus || 'pending';
    const orderStatus = order?.orderStatus || 'placed';

    // Order status stages
    const stages = [
        { key: 'placed', label: 'Order Placed' },
        { key: 'payment-confirmed', label: 'Payment Confirmed' },
        { key: 'assembling', label: 'Assembling' },
        { key: 'ready', label: 'Order Ready' },
        { key: 'on-the-way', label: 'On the Way' },
        { key: 'delivered', label: 'Delivered' }
    ];

    // Get current stage index
    const currentStageIndex = stages.findIndex(stage => stage.key === orderStatus);

    return (
        <div className="min-h-screen bg-navy-950 py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lime-400/20 mb-4">
                        <CheckCircle className="h-10 w-10 text-lime-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Order Placed Successfully!</h1>
                    <p className="text-gray-400">Thank you for your purchase</p>
                </div>

                {/* Payment Pending Alert */}
                {paymentStatus === 'pending' && (
                    <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-yellow-500 font-semibold mb-1">Payment Pending</h3>
                                <p className="text-yellow-200 text-sm">
                                    Your order is waiting for payment confirmation. Please contact our sales team at{' '}
                                    <a href="tel:+94766303131" className="underline hover:text-yellow-100">
                                        0766 303 131
                                    </a>{' '}
                                    to complete your purchase.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Progress Tracker */}
                <div className="card p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-6">Order Progress</h2>
                    <p className="text-sm text-gray-400 mb-6">Track your order through each stage</p>

                    {/* Progress Bar */}
                    <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute top-5 left-0 right-0 h-1 bg-navy-800">
                            <div
                                className="h-full bg-lime-400 transition-all duration-500"
                                style={{
                                    width: `${(currentStageIndex / (stages.length - 1)) * 100}%`
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
                </div>

                {/* Order Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Order Summary */}
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-lime-400" />
                            Order Summary
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Order Number</span>
                                <span className="text-white font-semibold">{orderNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Order Date</span>
                                <span className="text-white">{new Date().toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Status</span>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${orderStatus === 'placed' ? 'bg-yellow-500/20 text-yellow-500' :
                                    orderStatus === 'delivered' ? 'bg-green-500/20 text-green-500' :
                                        'bg-blue-500/20 text-blue-500'
                                    }`}>
                                    {orderStatus.replace('-', ' ').toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-navy-800">
                                <span className="text-gray-400">Payment Status</span>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                    paymentStatus === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                                        'bg-red-500/20 text-red-500'
                                    }`}>
                                    {paymentStatus.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-navy-800">
                                <span className="text-gray-400">Payment Required</span>
                                <span className="text-white font-semibold">
                                    {paymentStatus === 'pending' ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="card p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Delivery Information</h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-400 mb-1">Customer Address</p>
                                <p className="text-white">
                                    {order?.customerDetails?.address ? (
                                        <>
                                            {order.customerDetails.address}<br />
                                            {order.customerDetails.city}, {order.customerDetails.province}
                                        </>
                                    ) : (
                                        <span className="text-gray-500 italic">Address not available</span>
                                    )}
                                </p>
                            </div>
                            <div className="pt-3 border-t border-navy-800">
                                <p className="text-gray-400 mb-2">Contact Information</p>
                                <div className="flex items-center gap-2 text-white mb-2">
                                    <Phone className="h-4 w-4 text-lime-400" />
                                    <span>{order?.customerDetails?.mobile || 'Not provided'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-white">
                                    <Mail className="h-4 w-4 text-lime-400" />
                                    <span>{customerEmail}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Details */}
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-bold text-white mb-4">Financial Details</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Total</span>
                            <span className="text-white font-semibold">LKR {total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Payment Method</span>
                            <span className="text-white">Bank Transfer</span>
                        </div>
                    </div>
                </div>

                {/* Bank Transfer Details */}
                <div className="card p-6 mb-6 border border-lime-400/30 bg-navy-900/50">
                    <h2 className="text-lg font-bold text-lime-400 mb-4">Bank Transfer Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-400 mb-1">Bank Name</p>
                                <p className="text-white font-medium">Seylan Bank PLC</p>
                            </div>
                            <div>
                                <p className="text-gray-400 mb-1">Branch Name</p>
                                <p className="text-white font-medium">Eheliyagoda Branch</p>
                            </div>
                            <div>
                                <p className="text-gray-400 mb-1">Account Number</p>
                                <p className="text-white font-mono text-lg tracking-wider">1730 1355 7498 084</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-400 mb-1">Account Holder Name</p>
                                <p className="text-white font-medium">D.M.P.K Thanayamwatta</p>
                            </div>
                            <div>
                                <p className="text-gray-400 mb-1">Country</p>
                                <p className="text-white font-medium">Sri Lanka</p>
                            </div>
                            <div className="pt-2">
                                <p className="text-xs text-gray-500">
                                    * Please mention your Order Number <span className="text-lime-400 font-mono">{orderNumber}</span> as the reference.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-bold text-white mb-4">Actions</h2>
                    <Link to="/">
                        <Button variant="primary" className="w-full flex items-center justify-center gap-2">
                            <Home className="h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>

                {/* Need Help */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 text-center">
                    <h3 className="text-yellow-500 font-semibold mb-2">Need Help?</h3>
                    <p className="text-yellow-200 text-sm mb-4">
                        Contact our sales team for payment assistance
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
            </div>
        </div>
    );
};
