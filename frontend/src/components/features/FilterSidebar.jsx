import { useState, useEffect } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import axios from 'axios';

export const FilterSidebar = ({ filters, onFilterChange, onClose, isOpen }) => {
    const [brands, setBrands] = useState([]);
    const [priceRange, setPriceRange] = useState({
        min: filters.minPrice || '',
        max: filters.maxPrice || ''
    });

    useEffect(() => {
        // Fetch available brands
        const fetchBrands = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/brands`);
                setBrands(response.data);
            } catch (error) {
                console.error('Error fetching brands:', error);
            }
        };
        fetchBrands();
    }, []);

    useEffect(() => {
        setPriceRange({
            min: filters.minPrice || '',
            max: filters.maxPrice || ''
        });
    }, [filters]);

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setPriceRange(prev => ({ ...prev, [name]: value }));
    };

    const applyPriceFilter = () => {
        onFilterChange({
            ...filters,
            minPrice: priceRange.min,
            maxPrice: priceRange.max,
            page: 1 // Reset to first page
        });
    };

    const handleBrandChange = (brand) => {
        onFilterChange({
            ...filters,
            brand: filters.brand === brand ? '' : brand, // Toggle brand
            page: 1
        });
    };

    const clearFilters = () => {
        onFilterChange({
            sort: filters.sort, // Keep sort
            search: filters.search, // Keep search
            page: 1
        });
        setPriceRange({ min: '', max: '' });
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed top-0 left-0 bottom-0 w-64 bg-navy-900 border-r border-navy-800 p-6 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0 md:block md:top-auto md:left-auto md:bottom-auto md:h-auto md:z-0
            `}>
                <div className="flex items-center justify-between mb-6 md:hidden">
                    <h2 className="text-xl font-bold text-white">Filters</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Price Filter */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Price Range</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    type="number"
                                    name="min"
                                    placeholder="Min"
                                    value={priceRange.min}
                                    onChange={handlePriceChange}
                                    className="text-sm"
                                />
                                <Input
                                    type="number"
                                    name="max"
                                    placeholder="Max"
                                    value={priceRange.max}
                                    onChange={handlePriceChange}
                                    className="text-sm"
                                />
                            </div>
                            <Button
                                onClick={applyPriceFilter}
                                variant="outline"
                                className="w-full text-sm py-1"
                            >
                                Apply
                            </Button>
                        </div>
                    </div>

                    {/* Brand Filter */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Brands</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {brands.map((brand) => (
                                <label key={brand} className="flex items-center space-x-3 cursor-pointer group">
                                    <div className={`
                                        w-5 h-5 rounded border flex items-center justify-center transition-colors
                                        ${filters.brand === brand
                                            ? 'bg-lime-400 border-lime-400'
                                            : 'border-navy-600 group-hover:border-lime-400'
                                        }
                                    `}>
                                        {filters.brand === brand && (
                                            <svg className="w-3 h-3 text-navy-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={filters.brand === brand}
                                        onChange={() => handleBrandChange(brand)}
                                    />
                                    <span className={`text-sm ${filters.brand === brand ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                        {brand}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Clear Filters */}
                    <Button
                        onClick={clearFilters}
                        variant="ghost"
                        className="w-full text-gray-400 hover:text-white"
                    >
                        Clear All Filters
                    </Button>
                </div>
            </div>
        </>
    );
};
