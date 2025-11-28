import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Minus, Plus, Upload, X } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/orderService';
import { uploadImage } from '../../services/uploadService';
import toast from 'react-hot-toast';

export const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, updateQuantity, clearCart } = useCart();
    const [currentStep, setCurrentStep] = useState(1); // 1: Customer Details, 2: Payment & Receipt
    const [loading, setLoading] = useState(false);

    // Customer Details
    const [customerDetails, setCustomerDetails] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        address: '',
        city: '',
        province: 'Western' // Default province
    });

    // Receipt Upload
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);

    const provinces = [
        'Western', 'Central', 'Southern', 'Northern', 'Eastern',
        'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
    ];

    const handleInputChange = (e) => {
        setCustomerDetails({
            ...customerDetails,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setReceiptFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeReceipt = () => {
        setReceiptFile(null);
        setReceiptPreview(null);
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateCustomerDetails = () => {
        const { firstName, lastName, email, mobile, address, city, province } = customerDetails;

        if (!firstName || !lastName || !email || !mobile || !address || !city || !province) {
            toast.error('Please fill in all required fields');
            return false;
        }

        if (!validateEmail(email)) {
            toast.error('Please enter a valid email address');
            return false;
        }

        if (mobile.length < 10) {
            toast.error('Please enter a valid mobile number');
            return false;
        }

        return true;
    };

    const handleProceedToPayment = () => {
        if (validateCustomerDetails()) {
            setCurrentStep(2);
        }
    };

    const handlePlaceOrder = async () => {
        // Validate receipt upload
        if (!receiptFile) {
            toast.error('Please upload payment receipt');
            return;
        }

        try {
            setLoading(true);

            // Upload receipt to Cloudinary
            let receiptUrl;
            try {
                receiptUrl = await uploadImage(receiptFile);
            } catch (uploadError) {
                console.error('Upload error:', uploadError);
                toast.error('Failed to upload receipt image. Please try again.');
                setLoading(false);
                return;
            }

            // Prepare order data
            const orderData = {
                customerDetails,
                items: cartItems.map(item => ({
                    productId: item._id,
                    quantity: item.quantity
                })),
                paymentMethod: 'bank-transfer',
                paymentReceipt: {
                    url: receiptUrl,
                    uploadedAt: new Date()
                },
                notes: ''
            };

            // Create order
            const response = await orderService.createOrder(orderData);

            if (response.success) {
                toast.success('Order placed successfully!');
                clearCart();
                // Navigate to order confirmation with order details
                navigate('/order-confirmation', {
                    state: { order: response.order }
                });
            } else {
                toast.error(response.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Order placement error:', error);
            toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
                    <p className="text-gray-400 mb-8">Add some products before checking out</p>
                    <Button variant="primary" onClick={() => navigate('/products')}>
                        Browse Products
                    </Button>
                </div>
            </div>
        );
    }

    const subtotal = getCartTotal();
    const shipping = 500; // Fixed shipping cost
    const total = subtotal + shipping;

    return (
        <div className="min-h-screen bg-navy-950 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

                {/* Product Summary (Collapsible) */}
                <div className="card p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {cartItems.map((item, index) => (
                                <img
                                    key={index}
                                    src={item.images?.[0]?.url || item.images?.[0] || '/placeholder.png'}
                                    alt={item.name}
                                    className="w-12 h-12 object-cover rounded"
                                />
                            ))}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-400">{cartItems.length} item(s)</p>
                            <p className="text-lg font-bold text-lime-400">LKR {total.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Cart Items */}
                    <div className="space-y-3">
                        {cartItems.map((item) => (
                            <div key={item._id} className="flex items-center justify-between bg-navy-900 p-3 rounded-lg">
                                <div className="flex items-center gap-3 flex-1">
                                    <img
                                        src={item.images?.[0]?.url || item.images?.[0] || '/placeholder.png'}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <div>
                                        <p className="text-white font-medium">{item.name}</p>
                                        <p className="text-sm text-gray-400">LKR {item.price.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-navy-800 hover:bg-navy-700 rounded transition-colors"
                                        >
                                            <Minus className="h-4 w-4 text-gray-400" />
                                        </button>
                                        <span className="w-8 text-center text-white">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-navy-800 hover:bg-navy-700 rounded transition-colors"
                                        >
                                            <Plus className="h-4 w-4 text-gray-400" />
                                        </button>
                                    </div>
                                    <p className="text-white font-semibold w-24 text-right">
                                        LKR {(item.price * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 1: Customer Details */}
                {currentStep === 1 && (
                    <div className="card p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Customer Details</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    name="firstName"
                                    value={customerDetails.firstName}
                                    onChange={handleInputChange}
                                    placeholder="John"
                                    required
                                />
                                <Input
                                    label="Last Name"
                                    name="lastName"
                                    value={customerDetails.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Doe"
                                    required
                                />
                            </div>

                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={customerDetails.email}
                                onChange={handleInputChange}
                                placeholder="john@example.com"
                                required
                            />

                            <Input
                                label="Mobile"
                                name="mobile"
                                type="tel"
                                value={customerDetails.mobile}
                                onChange={handleInputChange}
                                placeholder="+94 77 123 4567"
                                required
                            />

                            <Input
                                label="Home No, Street"
                                name="address"
                                value={customerDetails.address}
                                onChange={handleInputChange}
                                placeholder="123 Main Street"
                                required
                            />

                            <Input
                                label="City"
                                name="city"
                                value={customerDetails.city}
                                onChange={handleInputChange}
                                placeholder="Colombo"
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Province *
                                </label>
                                <select
                                    name="province"
                                    value={customerDetails.province}
                                    onChange={handleInputChange}
                                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                                    required
                                >
                                    {provinces.map((province) => (
                                        <option key={province} value={province}>
                                            {province}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                variant="primary"
                                onClick={handleProceedToPayment}
                                className="w-full mt-6 flex items-center justify-center gap-2"
                            >
                                Proceed to Pay
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Payment & Receipt Upload */}
                {currentStep === 2 && (
                    <div className="card p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>

                        {/* Bank Transfer Details */}
                        <div className="border-2 border-lime-400 bg-lime-400/10 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-white font-medium">Bank Transfer</span>
                                <span className="text-lime-400 font-semibold">LKR {total.toLocaleString()}</span>
                            </div>
                            <div className="pt-3 border-t border-lime-400/30 text-sm text-gray-300 space-y-1">
                                <p><strong className="text-white">Bank:</strong> Seylan Bank PLC</p>
                                <p><strong className="text-white">Account Name:</strong> D.M.P.K Thanayamwatta</p>
                                <p><strong className="text-white">Account Number:</strong> 1730 1355 7498 084</p>
                                <p><strong className="text-white">Branch:</strong> Eheliyagoda Branch</p>
                            </div>
                        </div>

                        {/* Receipt Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Upload Payment Receipt *
                            </label>
                            <p className="text-xs text-yellow-400 mb-3">
                                ⚠️ Please transfer the amount and upload receipt before placing order
                            </p>

                            {receiptPreview ? (
                                <div className="border-2 border-lime-400 rounded-lg p-4 bg-navy-900">
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={receiptPreview}
                                            alt="Receipt preview"
                                            className="w-32 h-32 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <p className="text-white font-medium mb-1">Receipt uploaded</p>
                                            <p className="text-sm text-gray-400 mb-3">{receiptFile.name}</p>
                                            <button
                                                onClick={removeReceipt}
                                                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-navy-700 hover:border-lime-400 rounded-lg p-8 text-center transition-colors cursor-pointer">
                                    <Upload className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                                    <p className="text-gray-400 mb-2">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        PNG, JPG or PDF (max. 5MB)
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="receipt-upload"
                                    />
                                    <label
                                        htmlFor="receipt-upload"
                                        className="inline-block bg-lime-400 hover:bg-lime-500 text-navy-950 font-medium px-6 py-2 rounded-lg cursor-pointer transition-colors"
                                    >
                                        Choose File
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className="bg-navy-900 rounded-lg p-4 mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Subtotal</span>
                                <span className="text-white">LKR {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Shipping</span>
                                <span className="text-white">LKR {shipping.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-navy-800">
                                <span className="text-white">Total</span>
                                <span className="text-lime-400">LKR {total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="flex-1 bg-navy-800 hover:bg-navy-700 text-white font-medium py-3 rounded-lg transition-colors"
                            >
                                Back
                            </button>
                            <Button
                                variant="primary"
                                onClick={handlePlaceOrder}
                                disabled={loading || !receiptFile}
                                className="flex-1"
                            >
                                {loading ? 'Placing Order...' : 'Place Order'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
