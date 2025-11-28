import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getIconComponent } from '../../utils/icons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/categories`);
            setCategories(response.data.categories || response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Fallback to default categories if API fails
            setCategories(getDefaultCategories());
        } finally {
            setLoading(false);
        }
    };

    const getDefaultCategories = () => [
        { _id: '1', name: 'Laptops', slug: 'laptops', productCount: 45, description: 'Portable computing power' },
        { _id: '2', name: 'Desktops', slug: 'desktops', productCount: 32, description: 'High-performance workstations' },
        { _id: '3', name: 'Monitors', slug: 'monitors', productCount: 28, description: 'Crystal clear displays' },
        { _id: '4', name: 'Graphics Cards', slug: 'graphics-cards', productCount: 15, description: 'Gaming & rendering power' },
        { _id: '5', name: 'Processors', slug: 'processors', productCount: 20, description: 'CPU performance' },
        { _id: '6', name: 'Memory (RAM)', slug: 'memory', productCount: 35, description: 'Fast system memory' },
        { _id: '7', name: 'Storage', slug: 'storage', productCount: 40, description: 'SSDs & HDDs' },
        { _id: '8', name: 'Keyboards', slug: 'keyboards', productCount: 25, description: 'Mechanical & membrane' },
        { _id: '9', name: 'Mice', slug: 'mice', productCount: 30, description: 'Gaming & productivity' },
        { _id: '10', name: 'Audio', slug: 'audio', productCount: 22, description: 'Headphones & speakers' },
        { _id: '11', name: 'Networking', slug: 'networking', productCount: 18, description: 'Routers & adapters' },
        { _id: '12', name: 'Peripherals', slug: 'peripherals', productCount: 50, description: 'Accessories & more' },
    ];

    const getIcon = (iconName) => {
        return getIconComponent(iconName);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-navy-950 flex items-center justify-center">
                <div className="text-white">Loading categories...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy-950 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Browse by Category</h1>
                    <p className="text-gray-400 text-lg">Find the perfect tech for your needs</p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map((category) => {
                        const Icon = getIcon(category.icon);

                        return (
                            <Link
                                key={category._id}
                                to={`/products?category=${encodeURIComponent(category.name)}`}
                                className="group"
                            >
                                <div className="card p-6 text-center hover:border-lime-400 transition-all duration-300 h-full">
                                    {/* Icon */}
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lime-400/10 mb-4 group-hover:bg-lime-400/20 transition-colors">
                                        <Icon className="h-8 w-8 text-lime-400" />
                                    </div>

                                    {/* Category Name */}
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-lime-400 transition-colors">
                                        {category.name}
                                    </h3>

                                    {/* Description */}
                                    {category.description && (
                                        <p className="text-sm text-gray-400 mb-3">
                                            {category.description}
                                        </p>
                                    )}

                                    {/* Product Count */}
                                    <p className="text-sm text-gray-500">
                                        {category.productCount || 0} items
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Empty State */}
                {categories.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No categories available</p>
                    </div>
                )}
            </div>
        </div>
    );
};
