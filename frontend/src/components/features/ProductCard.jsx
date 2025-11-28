import { Link } from 'react-router-dom';
import { ShoppingCart, TrendingDown, Eye } from 'lucide-react';
import { Button } from '../common/Button';
import { StarRating } from '../common/StarRating';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export const ProductCard = ({ product, showDiscount = true, onQuickView }) => {
    const { _id, title, price, salePrice, images, stock, category, brand, rating, shortSpecs, dealType, dealValue } = product;
    const { addToCart } = useCart();

    // Extract image URL - handle both string and object formats
    const imageUrl = images && images.length > 0
        ? (typeof images[0] === 'string' ? images[0] : images[0]?.url)
        : null;

    // Calculate discount percentage
    const discount = salePrice && price > salePrice
        ? Math.round(((price - salePrice) / price) * 100)
        : 0;

    const handleAddToCart = (e) => {
        e.stopPropagation();
        e.preventDefault();

        // Success Animation State
        const btn = e.currentTarget;
        const originalContent = btn.innerHTML;

        // Change button state
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        btn.classList.add('bg-green-500', 'border-green-500', 'text-white');
        btn.classList.remove('bg-lime-400', 'text-navy-950', 'hover:bg-lime-500');

        addToCart(product);
        toast.success('Added to cart');

        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.classList.remove('bg-green-500', 'border-green-500', 'text-white');
            btn.classList.add('bg-lime-400', 'text-navy-950', 'hover:bg-lime-500');
        }, 1500);
    };

    return (
        <div className="card-glow flex flex-col h-full relative group bg-navy-900 rounded-xl border border-navy-800 hover:border-lime-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(132,204,22,0.15)] hover:-translate-y-1">
            {/* Discount Badge */}
            {showDiscount && discount > 0 && (
                <div className="absolute top-4 right-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1">
                    <TrendingDown className="h-4 w-4" />
                    {dealType === 'amount'
                        ? `LKR ${dealValue} OFF`
                        : `-${discount}%`
                    }
                </div>
            )}

            {/* Product Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl">
                <Link to={`/products/${_id}`} className="block h-full">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-navy-800 flex items-center justify-center text-gray-500">
                            No Image
                        </div>
                    )}
                </Link>

                {/* Quick View Button */}
                {onQuickView && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onQuickView(product);
                        }}
                        className="absolute bottom-3 right-3 p-2 bg-white/10 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-lime-400 hover:text-navy-950 transform translate-y-4 group-hover:translate-y-0"
                        title="Quick View"
                    >
                        <Eye className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Product Info */}
            <div className="p-5 flex-1 flex flex-col">
                {/* Category & Brand */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-lime-400 uppercase tracking-wider font-medium">
                            {category?.name || category}
                        </span>
                        {brand && (
                            <>
                                <span>•</span>
                                <span>{brand}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Product Name */}
                <Link to={`/products/${_id}`}>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 hover:text-lime-400 transition-colors">
                        {title}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="mb-3">
                    <StarRating
                        rating={rating?.average || 0}
                        size="sm"
                        showCount={true}
                        count={rating?.count || 0}
                    />
                </div>

                {/* Short Specs */}
                {((shortSpecs && shortSpecs.length > 0) || (product.specifications && product.specifications.length > 0)) && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {(shortSpecs && shortSpecs.length > 0 ? shortSpecs : product.specifications.map(s => `${s.key}: ${s.value}`))
                            .slice(0, 3)
                            .map((spec, index) => (
                                <span key={index} className="text-[10px] font-medium px-2 py-1 rounded bg-navy-800 text-gray-300 border border-navy-700">
                                    {spec}
                                </span>
                            ))}
                    </div>
                )}

                <div className="mt-auto pt-4 border-t border-navy-800 flex items-center justify-between">
                    {/* Price Section */}
                    <div className="flex flex-col">
                        {salePrice && salePrice < price ? (
                            <>
                                <span className="text-xl font-bold text-white">
                                    LKR {salePrice.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-500 line-through">
                                    LKR {price.toLocaleString()}
                                </span>
                            </>
                        ) : (
                            <span className="text-xl font-bold text-white">
                                LKR {price.toLocaleString()}
                            </span>
                        )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={stock === 0}
                        className={`p-2 rounded-lg border transition-all duration-300 ${stock === 0
                            ? 'border-navy-700 text-gray-500 cursor-not-allowed'
                            : 'border-navy-700 text-gray-300 hover:border-lime-400 hover:bg-lime-400 hover:text-navy-950'
                            }`}
                        title={stock === 0 ? "Out of Stock" : "Add to Cart"}
                    >
                        <ShoppingCart className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
