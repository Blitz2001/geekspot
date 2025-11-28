import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { ProductCard } from '../../components/features/ProductCard';
import { Skeleton } from '../../components/common/Skeleton';
import { FilterSidebar } from '../../components/features/FilterSidebar';
import { QuickViewModal } from '../../components/features/QuickViewModal';
import { productService } from '../../services/productService';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ProductListing = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Quick View State
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        brand: searchParams.get('brand') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        inStock: searchParams.get('inStock') === 'true',
        search: searchParams.get('search') || '',
        sort: searchParams.get('sort') || '-createdAt'
    });

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Sync filters with URL params whenever they change
    useEffect(() => {
        setFilters({
            category: searchParams.get('category') || '',
            brand: searchParams.get('brand') || '',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            inStock: searchParams.get('inStock') === 'true',
            search: searchParams.get('search') || '',
            sort: searchParams.get('sort') || '-createdAt'
        });
    }, [searchParams]);

    // Fetch products whenever filters change
    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/categories`);
            setCategories(response.data.categories || response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {};

            if (filters.category) params.category = filters.category;
            if (filters.brand) params.brand = filters.brand;
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            if (filters.inStock) params.inStock = true;
            if (filters.search) params.search = filters.search;
            if (filters.sort) params.sort = filters.sort;

            const data = await productService.getProducts(params);
            setProducts(data.products || data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);

        // Update URL params
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v) params.set(k, v);
        });
        setSearchParams(params);
    };

    const handleSortChange = (e) => {
        handleFilterChange({ ...filters, sort: e.target.value });
    };

    const clearFilters = () => {
        const resetFilters = {
            category: '',
            brand: '',
            minPrice: '',
            maxPrice: '',
            inStock: false,
            search: '',
            sort: '-createdAt'
        };
        setFilters(resetFilters);
        setSearchParams({});
    };

    const handleQuickView = (product) => {
        setSelectedProduct(product);
        setIsQuickViewOpen(true);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <FilterSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Main Content */}
                <div className="flex-1">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-4">Products</h1>
                        <p className="text-gray-400">
                            Browse our collection of gaming laptops, PC components, and accessories
                        </p>
                    </div>

                    {/* Search & Sort Bar */}
                    <div className="mb-8 flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                                className="w-full bg-navy-900 border border-navy-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-lime-400 focus:outline-none"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>

                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden btn-secondary flex items-center justify-center gap-2"
                        >
                            <SlidersHorizontal className="h-5 w-5" />
                            Filters
                        </button>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ArrowUpDown className="h-4 w-4 text-gray-400" />
                            </div>
                            <select
                                value={filters.sort}
                                onChange={handleSortChange}
                                className="appearance-none bg-navy-900 border border-navy-700 rounded-lg pl-10 pr-8 py-3 text-white focus:border-lime-400 focus:outline-none cursor-pointer"
                            >
                                <option value="-createdAt">Newest</option>
                                <option value="price">Price: Low to High</option>
                                <option value="-price">Price: High to Low</option>
                                <option value="-rating.average">Best Rating</option>
                            </select>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} variant="product-card" />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="mb-4 text-gray-400">
                                Showing {products.length} product{products.length !== 1 ? 's' : ''}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        onQuickView={handleQuickView}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-xl text-gray-400">No products found</p>
                            <button onClick={clearFilters} className="btn-primary mt-4">
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

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
