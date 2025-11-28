import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ChevronLeft, TrendingDown, ThumbsUp, Flag, Filter, MoreVertical } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { StarRating } from '../../components/common/StarRating';
import { ReviewPhotoUpload } from '../../components/features/ReviewPhotoUpload';
import { productService } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ProductDetail = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('specifications');

    // Review System State
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState(null);
    const [reviewFilter, setReviewFilter] = useState('all');
    const [reviewSort, setReviewSort] = useState('newest');
    const [reviewForm, setReviewForm] = useState({
        rating: 0,
        title: '',
        comment: '',
        images: [],
        guestName: '',
        guestEmail: ''
    });
    const [submittingReview, setSubmittingReview] = useState(false);

    // Extract image URLs from product images (handle both string and object formats)
    const getImageUrl = (img) => typeof img === 'string' ? img : img?.url;
    const imageUrls = product?.images?.map(getImageUrl) || [];

    useEffect(() => {
        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (product?._id) {
            fetchReviews();
        }
    }, [product?._id, reviewFilter, reviewSort]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const data = await productService.getProductById(id);
            setProduct(data.product || data);
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        if (!product?._id) return;

        try {
            const params = new URLSearchParams();
            if (reviewFilter !== 'all') params.append('rating', reviewFilter);
            params.append('sort', reviewSort);

            const { data } = await axios.get(`${API_URL}/reviews/product/${product._id}?${params}`);
            setReviews(data.reviews);

            // Transform array to object for easier lookup
            // Backend returns: [{ _id: 5, count: 1 }]
            // We want: { 5: 1 }
            const distribution = {};
            if (data.ratingDistribution) {
                data.ratingDistribution.forEach(item => {
                    distribution[item._id] = item.count;
                });
            }

            setReviewStats({
                ...data,
                distribution
            });
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleAddToCart = () => {
        addToCart(product, quantity);
        toast.success('Added to cart');
        setQuantity(1); // Reset quantity after adding
    };

    const handleAddToWishlist = () => {
        toast.success('Added to wishlist!');
        // TODO: Implement wishlist functionality
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (reviewForm.rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setSubmittingReview(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // For guests, validate name
            if (!token && !reviewForm.guestName) {
                toast.error('Please enter your name');
                setSubmittingReview(false);
                return;
            }

            await axios.post(`${API_URL}/reviews/product/${product._id}`, reviewForm, {
                headers
            });

            toast.success('Review submitted! It will appear after approval.');
            setReviewForm({
                rating: 0,
                title: '',
                comment: '',
                images: [],
                guestName: '',
                guestEmail: ''
            });
            fetchReviews();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleHelpful = async (reviewId) => {
        try {
            const token = localStorage.getItem('token');
            // Allow guests to vote (backend handles IP tracking)
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            await axios.post(`${API_URL}/reviews/${reviewId}/helpful`, {}, config);
            fetchReviews(); // Refresh to show new count
            toast.success('Thanks for your feedback!');
        } catch (error) {
            toast.error('Failed to vote');
        }
    };

    const handleReport = async (reviewId) => {
        if (!confirm('Report this review as inappropriate?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to report reviews');
                return;
            }

            await axios.post(`${API_URL}/reviews/${reviewId}/report`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Review reported');
        } catch (error) {
            toast.error('Failed to report review');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-lime-400 border-t-transparent"></div>
                <p className="mt-4 text-gray-400">Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Product not found</h2>
                <Link to="/products">
                    <Button variant="primary">Back to Products</Button>
                </Link>
            </div>
        );
    }

    const isLoggedIn = !!localStorage.getItem('token');

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <Link to="/" className="hover:text-lime-400">Home</Link>
                <span>/</span>
                <Link to="/products" className="hover:text-lime-400">Products</Link>
                <span>/</span>
                <span className="text-white">{product.title}</span>
            </div>

            {/* Back Button */}
            <Link to="/products" className="inline-flex items-center gap-2 text-lime-400 hover:text-lime-500 mb-6">
                <ChevronLeft className="h-4 w-4" />
                Back to Products
            </Link>

            {/* Product Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                {/* Image Gallery */}
                <div>
                    {/* Main Image */}
                    <div
                        className="bg-navy-900 rounded-lg p-4 mb-4 relative touch-pan-y"
                        onTouchStart={(e) => {
                            const touch = e.touches[0];
                            e.currentTarget.dataset.touchStartX = touch.clientX;
                        }}
                        onTouchEnd={(e) => {
                            const touchStartX = parseFloat(e.currentTarget.dataset.touchStartX || '0');
                            const touchEndX = e.changedTouches[0].clientX;
                            const diff = touchStartX - touchEndX;

                            // Swipe threshold: 50px
                            if (Math.abs(diff) > 50) {
                                if (diff > 0 && selectedImage < imageUrls.length - 1) {
                                    // Swipe left - next image
                                    setSelectedImage(selectedImage + 1);
                                } else if (diff < 0 && selectedImage > 0) {
                                    // Swipe right - previous image
                                    setSelectedImage(selectedImage - 1);
                                }
                            }
                        }}
                    >
                        {/* Discount Badge */}
                        {product.salePrice && product.price > product.salePrice && (
                            <div className="absolute top-8 right-8 z-10 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-base flex items-center gap-2">
                                <TrendingDown className="h-5 w-5" />
                                {product.dealType === 'amount'
                                    ? `LKR ${product.dealValue} OFF`
                                    : `-${Math.round(((product.price - product.salePrice) / product.price) * 100)}%`
                                }
                            </div>
                        )}
                        <img
                            src={imageUrls[selectedImage] || '/placeholder.png'}
                            alt={product.title}
                            className="w-full h-96 object-contain"
                        />
                    </div>

                    {/* Thumbnail Images */}
                    {imageUrls.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {imageUrls.map((imageUrl, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`bg-navy-900 rounded-lg p-2 hover:border-lime-400 transition-all ${selectedImage === index ? 'border-2 border-lime-400' : 'border border-navy-800'
                                        }`}
                                >
                                    <img src={imageUrl} alt={`${product.title} ${index + 1}`} className="w-full h-20 object-contain" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div>
                    {/* Category & Brand */}
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <span>{product.category?.name || product.category}</span>
                        {product.brand && (
                            <>
                                <span>•</span>
                                <span>{product.brand}</span>
                            </>
                        )}
                    </div>

                    {/* Product Name */}
                    <h1 className="text-4xl font-bold mb-4">{product.title}</h1>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => setActiveTab('reviews')}>
                        <StarRating rating={product.rating?.average || 0} size="md" />
                        <span className="text-lime-400 hover:underline">
                            ({product.reviews?.length || 0} reviews)
                        </span>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                        {product.salePrice && product.price > product.salePrice ? (
                            <div className="flex items-center gap-4">
                                <span className="text-4xl font-bold text-lime-400">LKR {product.salePrice.toLocaleString()}</span>
                                <span className="text-2xl text-gray-500 line-through">LKR {product.price.toLocaleString()}</span>
                            </div>
                        ) : (
                            <span className="text-4xl font-bold text-lime-400">LKR {product.price.toLocaleString()}</span>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div className="mb-6">
                        {product.stock > 0 ? (
                            <span className="badge-success">In Stock ({product.stock} available)</span>
                        ) : (
                            <span className="badge-error">Out of Stock</span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 mb-6">{product.description}</p>

                    {/* Quantity Selector */}
                    {product.stock > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Quantity</label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="btn-secondary px-4 py-2"
                                >
                                    -
                                </button>
                                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="btn-secondary px-4 py-2"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 mb-6">
                        <Button
                            variant="primary"
                            className="flex-1 flex items-center justify-center gap-2"
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            Add to Cart
                        </Button>
                        <button
                            onClick={handleAddToWishlist}
                            className="btn-outline px-6 flex items-center gap-2"
                        >
                            <Heart className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Additional Info */}
                    <div className="card p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">SKU:</span>
                            <span>{product._id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Category:</span>
                            <span>{product.category?.name || product.category}</span>
                        </div>
                        {product.brand && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Brand:</span>
                                <span>{product.brand}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="mb-12">
                {/* Tab Headers */}
                <div className="flex gap-4 border-b border-navy-800 mb-6">
                    <button
                        onClick={() => setActiveTab('specifications')}
                        className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'specifications'
                            ? 'text-lime-400 border-b-2 border-lime-400'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Specifications
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'reviews'
                            ? 'text-lime-400 border-b-2 border-lime-400'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Reviews ({product.reviews?.length || 0})
                    </button>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'specifications' && (
                        <div className="card p-6">
                            <h3 className="text-2xl font-bold mb-4">Product Specifications</h3>
                            {product.specifications && product.specifications.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {product.specifications.map((spec, index) => (
                                        <div key={index} className="flex justify-between py-2 border-b border-navy-800">
                                            <span className="text-gray-400 capitalize">{spec.key}:</span>
                                            <span className="font-medium">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400">No specifications available</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="space-y-8">
                            {/* Rating Summary & Distribution */}
                            <div className="card p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                                    {/* Overall Rating */}
                                    <div className="text-center md:text-left">
                                        <div className="text-5xl font-bold text-white mb-2">
                                            {product.rating?.average?.toFixed(1) || '0.0'}
                                        </div>
                                        <div className="flex justify-center md:justify-start mb-2">
                                            <StarRating rating={product.rating?.average || 0} size="lg" />
                                        </div>
                                        <p className="text-gray-400">Based on {product.reviews?.length || 0} reviews</p>
                                    </div>

                                    {/* Rating Distribution */}
                                    <div className="col-span-2">
                                        {[5, 4, 3, 2, 1].map((star) => {
                                            const count = reviewStats?.distribution?.[star] || 0;
                                            const percentage = reviewStats?.totalReviews
                                                ? (count / reviewStats.totalReviews) * 100
                                                : 0;

                                            return (
                                                <div key={star} className="flex items-center gap-4 mb-2">
                                                    <div className="w-12 text-sm text-gray-400 flex items-center gap-1">
                                                        {star} <Star className="w-3 h-3" />
                                                    </div>
                                                    <div className="flex-1 h-2 bg-navy-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-lime-400 rounded-full transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="w-12 text-sm text-gray-400 text-right">
                                                        {percentage.toFixed(0)}%
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Filters & Sort */}
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-gray-400" />
                                    <select
                                        value={reviewFilter}
                                        onChange={(e) => setReviewFilter(e.target.value)}
                                        className="bg-navy-900 border border-navy-700 rounded-lg px-4 py-2 text-white focus:border-lime-400 focus:outline-none"
                                    >
                                        <option value="all">All Ratings</option>
                                        <option value="5">5 Stars</option>
                                        <option value="4">4 Stars</option>
                                        <option value="3">3 Stars</option>
                                        <option value="2">2 Stars</option>
                                        <option value="1">1 Star</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">Sort by:</span>
                                    <select
                                        value={reviewSort}
                                        onChange={(e) => setReviewSort(e.target.value)}
                                        className="bg-navy-900 border border-navy-700 rounded-lg px-4 py-2 text-white focus:border-lime-400 focus:outline-none"
                                    >
                                        <option value="newest">Most Recent</option>
                                        <option value="highest">Highest Rating</option>
                                        <option value="lowest">Lowest Rating</option>
                                        <option value="helpful">Most Helpful</option>
                                    </select>
                                </div>
                            </div>

                            {/* Reviews List */}
                            <div className="space-y-4">
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <div key={review._id} className="card p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-lime-400 font-bold text-lg">
                                                        {review.user?.name?.charAt(0) || review.guestName?.charAt(0) || 'G'}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-white">
                                                            {review.user?.name || review.guestName || 'Guest User'}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                                            {review.verified && (
                                                                <span className="text-green-400 flex items-center gap-1">
                                                                    • Verified Purchase
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="relative group">
                                                    <button className="text-gray-400 hover:text-white">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                    <div className="absolute right-0 mt-2 w-32 bg-navy-900 border border-navy-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                                        <button
                                                            onClick={() => handleReport(review._id)}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-navy-800 hover:text-white flex items-center gap-2"
                                                        >
                                                            <Flag className="w-4 h-4" /> Report
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <StarRating rating={review.rating} size="sm" />
                                            </div>

                                            {review.title && (
                                                <h4 className="font-bold text-lg text-white mb-2">{review.title}</h4>
                                            )}

                                            <p className="text-gray-300 mb-4 leading-relaxed">{review.comment}</p>

                                            {review.images && review.images.length > 0 && (
                                                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                                    {review.images.map((img, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={img.url}
                                                            alt={`Review image ${idx + 1}`}
                                                            className="w-20 h-20 object-cover rounded-lg border border-navy-700 cursor-pointer hover:border-lime-400 transition-colors"
                                                            onClick={() => window.open(img.url, '_blank')}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 pt-4 border-t border-navy-800">
                                                <button
                                                    onClick={() => handleHelpful(review._id)}
                                                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-lime-400 transition-colors"
                                                >
                                                    <ThumbsUp className="w-4 h-4" />
                                                    Helpful ({review.helpfulVotes?.length || 0})
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-navy-900 rounded-xl border border-navy-800">
                                        <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-white mb-2">No reviews yet</h3>
                                        <p className="text-gray-400">Be the first to share your thoughts about this product!</p>
                                    </div>
                                )}
                            </div>

                            {/* Write a Review Form */}
                            <div className="card p-6 border-lime-400/20">
                                <h3 className="text-xl font-bold mb-6">Write a Review</h3>
                                <form onSubmit={handleReviewSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">Rating</label>
                                        <div className="flex items-center gap-4">
                                            <StarRating
                                                rating={reviewForm.rating}
                                                size="lg"
                                                interactive={true}
                                                onChange={(rating) => setReviewForm({ ...reviewForm, rating })}
                                            />
                                            <span className="text-lime-400 font-medium">
                                                {reviewForm.rating > 0 ? ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewForm.rating - 1] : 'Select a rating'}
                                            </span>
                                        </div>
                                    </div>

                                    {!isLoggedIn && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-gray-300">Name (Required)</label>
                                                <input
                                                    type="text"
                                                    value={reviewForm.guestName || ''}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, guestName: e.target.value })}
                                                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 text-white focus:border-lime-400 focus:outline-none transition-colors"
                                                    placeholder="Your Name"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-gray-300">Email (Optional)</label>
                                                <input
                                                    type="email"
                                                    value={reviewForm.guestEmail || ''}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, guestEmail: e.target.value })}
                                                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 text-white focus:border-lime-400 focus:outline-none transition-colors"
                                                    placeholder="For verification purposes"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">Review Title</label>
                                        <input
                                            type="text"
                                            value={reviewForm.title}
                                            onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                                            className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 text-white focus:border-lime-400 focus:outline-none transition-colors"
                                            placeholder="Summarize your experience"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">Review Details</label>
                                        <textarea
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            rows="4"
                                            className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 text-white focus:border-lime-400 focus:outline-none transition-colors"
                                            placeholder="What did you like or dislike? How was the quality?"
                                            required
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">Add Photos</label>
                                        <ReviewPhotoUpload
                                            images={reviewForm.images}
                                            setImages={(images) => setReviewForm({ ...reviewForm, images })}
                                            maxImages={5}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full md:w-auto"
                                        disabled={submittingReview}
                                    >
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
