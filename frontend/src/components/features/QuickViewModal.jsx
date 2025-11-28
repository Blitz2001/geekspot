import { useEffect, useState } from 'react';
import { X, ShoppingCart, Star, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

export const QuickViewModal = ({ product, isOpen, onClose }) => {
    const { addToCart } = useCart();
    const [isVisible, setIsVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            setIsVisible(false);
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddToCart = () => {
        addToCart(product, quantity);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const discountPercentage = product.salePrice
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative w-full max-w-4xl bg-navy-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ease-out ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
                    }`}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white bg-navy-800/50 hover:bg-navy-800 rounded-full transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Image Gallery */}
                    <div className="bg-navy-950 p-6 flex flex-col items-center justify-center">
                        <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden bg-navy-900">
                            <img
                                src={product.images[selectedImage]?.url || '/placeholder.png'}
                                alt={product.title}
                                className="w-full h-full object-contain"
                            />
                            {discountPercentage > 0 && (
                                <div className="absolute top-4 left-4 bg-lime-400 text-navy-950 font-bold px-3 py-1 rounded-full text-sm">
                                    -{discountPercentage}%
                                </div>
                            )}
                        </div>
                        {product.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 w-full custom-scrollbar">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-lime-400' : 'border-transparent hover:border-navy-700'
                                            }`}
                                    >
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="p-6 md:p-8 flex flex-col h-full">
                        <div className="mb-auto">
                            <div className="flex items-center gap-2 text-sm text-lime-400 font-medium mb-2">
                                <span>{product.brand}</span>
                                <span>•</span>
                                <span className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                                {product.title}
                            </h2>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center text-yellow-400">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span className="ml-1 text-sm font-medium">{product.rating?.average?.toFixed(1) || '0.0'}</span>
                                </div>
                                <span className="text-gray-500 text-sm">({product.reviews?.length || 0} reviews)</span>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                {product.salePrice ? (
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-3xl font-bold text-white">
                                            LKR {product.salePrice.toLocaleString()}
                                        </span>
                                        <span className="text-lg text-gray-500 line-through">
                                            LKR {product.price.toLocaleString()}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-3xl font-bold text-white">
                                        LKR {product.price.toLocaleString()}
                                    </span>
                                )}
                            </div>

                            {/* Short Specs */}
                            {product.shortSpecs && product.shortSpecs.length > 0 && (
                                <div className="mb-6 space-y-2">
                                    {product.shortSpecs.slice(0, 3).map((spec, index) => (
                                        <div key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                                            {spec}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-navy-950 rounded-lg border border-navy-700">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="w-12 text-center text-white font-medium">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold transition-all duration-300 ${isAdded
                                        ? 'bg-green-500 text-white'
                                        : 'bg-lime-400 text-navy-950 hover:bg-lime-500'
                                        } ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isAdded ? (
                                        <>
                                            <Check className="h-5 w-5" />
                                            Added to Cart
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="h-5 w-5" />
                                            Add to Cart
                                        </>
                                    )}
                                </button>
                            </div>

                            <Link
                                to={`/products/${product._id}`}
                                className="block w-full text-center text-gray-400 hover:text-white text-sm font-medium transition-colors"
                            >
                                View Full Details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
