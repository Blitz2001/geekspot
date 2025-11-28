import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { CartItem } from '../../components/features/CartItem';
import { useCart } from '../../context/CartContext';

export const Cart = () => {
    const { cartItems, clearCart, getCartTotal, getCartCount } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center py-20">
                    <ShoppingBag className="h-24 w-24 mx-auto text-gray-600 mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
                    <p className="text-gray-400 mb-8">
                        Add some products to get started!
                    </p>
                    <Link to="/products">
                        <Button variant="primary">Browse Products</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">Shopping Cart</h1>
                    <p className="text-gray-400 text-sm lg:text-base">
                        {getCartCount()} {getCartCount() === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>
                <button
                    onClick={clearCart}
                    className="btn-outline flex items-center gap-2 text-sm px-3 py-2"
                >
                    <Trash2 className="h-4 w-4" />
                    Clear
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                        <CartItem key={item._id} item={item} />
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="card p-6 sticky top-24">
                        <h2 className="text-xl lg:text-2xl font-bold mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-400 text-sm lg:text-base">
                                <span>Subtotal ({getCartCount()} items)</span>
                                <span className="text-white">LKR {getCartTotal().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-400 text-sm lg:text-base">
                                <span>Shipping</span>
                                <span className="text-white">Calculated at checkout</span>
                            </div>
                            <div className="border-t border-navy-800 pt-4">
                                <div className="flex justify-between text-lg lg:text-xl font-bold">
                                    <span>Total</span>
                                    <span className="text-lime-400">LKR {getCartTotal().toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <Link to="/checkout">
                            <Button variant="primary" className="w-full mb-4 py-3 lg:py-2 text-lg lg:text-base">
                                Proceed to Checkout
                            </Button>
                        </Link>

                        <Link to="/products">
                            <button className="btn-outline w-full py-3 lg:py-2">
                                Continue Shopping
                            </button>
                        </Link>

                        {/* Additional Info */}
                        <div className="mt-6 pt-6 border-t border-navy-800 space-y-2 text-xs lg:text-sm text-gray-400">
                            <p>✓ Secure checkout</p>
                            <p>✓ Free shipping on orders over LKR 50,000</p>
                            <p>✓ 30-day return policy</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
