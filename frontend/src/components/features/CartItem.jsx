import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartItem = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();

    return (
        <div className="card p-4 flex gap-4">
            {/* Product Image */}
            <Link to={`/products/${item._id}`} className="flex-shrink-0">
                <img
                    src={item.images?.[0]?.url || item.images?.[0] || '/placeholder.png'}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md"
                />
            </Link>

            {/* Product Info */}
            <div className="flex-1">
                <Link to={`/products/${item._id}`}>
                    <h3 className="text-lg font-semibold hover:text-lime-400 transition-colors mb-1">
                        {item.name}
                    </h3>
                </Link>
                <p className="text-sm text-gray-400 mb-2">
                    {item.category?.name || item.category} {item.brand && `• ${item.brand}`}
                </p>
                <p className="text-xl font-bold text-lime-400">
                    LKR {item.price.toLocaleString()}
                </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex flex-col items-end justify-between">
                <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    aria-label="Remove from cart"
                >
                    <Trash2 className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="btn-secondary px-2 py-1"
                        aria-label="Decrease quantity"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-semibold w-12 text-center">{item.quantity}</span>
                    <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="btn-secondary px-2 py-1"
                        disabled={item.quantity >= item.stock}
                        aria-label="Increase quantity"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                <p className="text-sm text-gray-400">
                    Subtotal: <span className="text-white font-semibold">LKR {(item.price * item.quantity).toLocaleString()}</span>
                </p>
            </div>
        </div>
    );
};
