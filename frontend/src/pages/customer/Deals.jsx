import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, TrendingDown } from 'lucide-react';
import { ProductCard } from '../../components/features/ProductCard';
import { QuickViewModal } from '../../components/features/QuickViewModal';
import { productService } from '../../services/productService';

export const Deals = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, 10, 20, 30
    const [sort, setSort] = useState('discount'); // discount, price

    // Quick View State
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        try {
            setLoading(true);
            const data = await productService.getSpecialDeals();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching deals:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateDiscount = (price, salePrice) => {
        if (!price || !salePrice || price <= salePrice) return 0;
        return Math.round(((price - salePrice) / price) * 100);
    };

    const getFilteredProducts = () => {
        let filtered = [...products];

        // Apply discount filter
        if (filter !== 'all') {
            const minDiscount = parseInt(filter);
            filtered = filtered.filter(product => {
                const discount = calculateDiscount(product.price, product.salePrice);
                return discount >= minDiscount;
            });
        }

        // Apply sorting
        if (sort === 'discount') {
            filtered.sort((a, b) => {
                const discountA = calculateDiscount(a.price, a.salePrice);
                const discountB = calculateDiscount(b.price, b.salePrice);
                return discountB - discountA;
            });
        } else if (sort === 'price') {
            filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        }

        return filtered;
    };

    const handleQuickView = (product) => {
        setSelectedProduct(product);
        setIsQuickViewOpen(true);
    };

    const filteredProducts = getFilteredProducts();

    if (loading) {
        return (
            <div className="min-h-screen bg-navy-950 flex items-center justify-center">
                <div className="text-white">Loading deals...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy-950 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <Flame className="h-10 w-10 text-orange-500" />
                        <h1 className="text-4xl font-bold text-white">Special Deals</h1>
                        <Flame className="h-10 w-10 text-orange-500" />
                    </div>
                    <p className="text-gray-400 text-lg">Limited time offers on top products</p>
                </div>

                {/* Filters and Sort */}
                <div className="card p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        {/* Discount Filters */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-gray-400 text-sm">Filter by discount:</span>
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                                    ? 'bg-lime-400 text-navy-950 font-semibold'
                                    : 'bg-navy-800 text-gray-300 hover:bg-navy-700'
                                    }`}
                            >
                                All Deals
                            </button>
                            <button
                                onClick={() => setFilter('10')}
                                className={`px-4 py-2 rounded-lg transition-colors ${filter === '10'
                                    ? 'bg-lime-400 text-navy-950 font-semibold'
                                    : 'bg-navy-800 text-gray-300 hover:bg-navy-700'
                                    }`}
                            >
                                10%+
                            </button>
                            <button
                                onClick={() => setFilter('20')}
                                className={`px-4 py-2 rounded-lg transition-colors ${filter === '20'
                                    ? 'bg-lime-400 text-navy-950 font-semibold'
                                    : 'bg-navy-800 text-gray-300 hover:bg-navy-700'
                                    }`}
                            >
                                20%+
                            </button>
                            <button
                                onClick={() => setFilter('30')}
                                className={`px-4 py-2 rounded-lg transition-colors ${filter === '30'
                                    ? 'bg-lime-400 text-navy-950 font-semibold'
                                    : 'bg-navy-800 text-gray-300 hover:bg-navy-700'
                                    }`}
                            >
                                30%+
                            </button>
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">Sort by:</span>
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="bg-navy-800 text-white border border-navy-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400"
                            >
                                <option value="discount">Biggest Discount</option>
                                <option value="price">Lowest Price</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-400">
                        Showing {filteredProducts.length} deal{filteredProducts.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => {
                            const discount = calculateDiscount(product.price, product.salePrice);

                            return (
                                <div key={product._id} className="relative">
                                    {/* Discount Badge */}
                                    {discount > 0 && (
                                        <div className="absolute top-4 right-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1">
                                            <TrendingDown className="h-4 w-4" />
                                            {product.dealType === 'amount'
                                                ? `LKR ${product.dealValue} OFF`
                                                : `-${discount}%`
                                            }
                                        </div>
                                    )}

                                    <ProductCard
                                        product={product}
                                        showDiscount={false}
                                        onQuickView={handleQuickView}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Flame className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No deals found</h3>
                        <p className="text-gray-400 mb-6">
                            {filter !== 'all'
                                ? `No products with ${filter}%+ discount available`
                                : 'Check back soon for amazing deals!'}
                        </p>
                        <Link to="/products" className="btn-primary inline-block">
                            Browse All Products
                        </Link>
                    </div>
                )}

                {/* Quick View Modal */}
                {selectedProduct && (
                    <QuickViewModal
                        product={selectedProduct}
                        isOpen={isQuickViewOpen}
                        onClose={() => setIsQuickViewOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};
