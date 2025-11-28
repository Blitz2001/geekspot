import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import { ProductCard } from '../../components/features/ProductCard';
import { HeroSlider } from '../../components/features/HeroSlider';
import { QuickViewModal } from '../../components/features/QuickViewModal';
import { productService } from '../../services/productService';
import { getIconComponent } from '../../utils/icons';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Home = () => {
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [specialDeals, setSpecialDeals] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingDeals, setLoadingDeals] = useState(true);

    // Quick View State
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchFeaturedProducts();
        fetchSpecialDeals();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/categories`);
            const allCategories = response.data.categories || response.data;
            setCategories(allCategories.filter(cat => cat.showOnHome !== false));
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchFeaturedProducts = async () => {
        try {
            const data = await productService.getFeaturedProducts();
            setFeaturedProducts(data);
        } catch (error) {
            console.error('Error fetching featured products:', error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const fetchSpecialDeals = async () => {
        try {
            const data = await productService.getSpecialDeals();
            setSpecialDeals(data);
        } catch (error) {
            console.error('Error fetching special deals:', error);
        } finally {
            setLoadingDeals(false);
        }
    };

    const handleQuickView = (product) => {
        setSelectedProduct(product);
        setIsQuickViewOpen(true);
    };

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Hero Slider */}
            <HeroSlider />

            {/* Categories Section */}
            <section className="py-12">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-3 text-glow">Shop by Category</h2>
                    <p className="text-gray-400">Explore our wide range of tech products</p>
                </div>
                {loadingCategories ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="card-glow text-center py-12 animate-pulse">
                                <div className="h-6 bg-navy-800 rounded w-32 mx-auto"></div>
                            </div>
                        ))}
                    </div>
                ) : categories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((category) => {
                            const IconComponent = getIconComponent(category.icon);
                            return (
                                <Link
                                    key={category._id}
                                    to={`/products?category=${encodeURIComponent(category.name)}`}
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="glass-panel neon-glow relative overflow-hidden text-center py-10 px-6 rounded-xl cursor-pointer border border-navy-700/50 hover:border-lime-400/50 group transition-all duration-300"
                                    onMouseMove={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                                        e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                                    }}
                                >
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-lime-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Icon */}
                                    <div className="relative mb-4 flex justify-center">
                                        <div className="p-4 rounded-full bg-lime-400/10 group-hover:bg-lime-400/20 transition-all duration-300 group-hover:scale-110">
                                            <IconComponent
                                                size={48}
                                                className="text-lime-400 group-hover:text-lime-300 transition-colors duration-300"
                                                strokeWidth={1.5}
                                            />
                                        </div>
                                    </div>

                                    {/* Category name */}
                                    <h3 className="relative text-xl font-bold text-white group-hover:text-lime-400 transition-colors duration-300 text-glow mb-2">
                                        {category.name}
                                    </h3>

                                    {/* Description */}
                                    {category.description && (
                                        <p className="relative text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300 line-clamp-2">
                                            {category.description}
                                        </p>
                                    )}

                                    {/* Arrow indicator */}
                                    <div className="relative mt-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="text-lime-400 text-sm font-medium flex items-center gap-1">
                                            Explore
                                            <svg className="w-4 h-4 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <p>No categories available</p>
                    </div>
                )}
            </section>

            {/* Special Deals Section */}
            <section className="py-12 bg-navy-900/50 -mx-4 px-4">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold inline-flex items-center gap-2">
                        <span className="text-orange-500">🔥</span> Special Deals <span className="text-orange-500">🔥</span>
                    </h2>
                    <p className="text-gray-400 mt-2">Limited time offers on top products</p>
                </div>

                {loadingDeals ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="card-glow h-96 animate-pulse"></div>
                        ))}
                    </div>
                ) : specialDeals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {specialDeals.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onQuickView={handleQuickView}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <p>No special deals available at the moment</p>
                    </div>
                )}
            </section>

            {/* Featured Products */}
            <section className="py-12">
                <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
                {loadingProducts ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="card-glow h-96 animate-pulse"></div>
                        ))}
                    </div>
                ) : featuredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onQuickView={handleQuickView}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        <p>No featured products available</p>
                    </div>
                )}
            </section>

            {/* Quick View Modal */}
            {selectedProduct && (
                <QuickViewModal
                    product={selectedProduct}
                    isOpen={isQuickViewOpen}
                    onClose={() => setIsQuickViewOpen(false)}
                />
            )}
        </div>
    );
};
