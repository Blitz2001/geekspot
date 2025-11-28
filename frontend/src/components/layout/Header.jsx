import { NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { getCartCount } = useCart();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsMenuOpen(false);
            setSearchQuery('');
        }
    };

    const navLinkClass = ({ isActive }) =>
        `relative text-gray-300 hover:text-lime-400 transition-all duration-300 font-medium ${isActive ? 'text-lime-400' : ''
        }`;

    const activeIndicator = (isActive) =>
        isActive ? (
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-lime-400 rounded-full" />
        ) : null;

    return (
        <header className="sticky top-0 z-50 bg-navy-950/80 backdrop-blur-md border-b border-navy-800 transition-all duration-300">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <NavLink
                        to="/"
                        className="text-2xl font-bold text-lime-400 hover:text-lime-500 transition-all duration-300 hover:scale-105"
                    >
                        GEEKSPOT
                    </NavLink>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <NavLink to="/products" className={navLinkClass}>
                            {({ isActive }) => (
                                <>
                                    Products
                                    {activeIndicator(isActive)}
                                </>
                            )}
                        </NavLink>
                        <NavLink to="/categories" className={navLinkClass}>
                            {({ isActive }) => (
                                <>
                                    Categories
                                    {activeIndicator(isActive)}
                                </>
                            )}
                        </NavLink>
                        <NavLink to="/deals" className={navLinkClass}>
                            {({ isActive }) => (
                                <>
                                    Deals
                                    {activeIndicator(isActive)}
                                </>
                            )}
                        </NavLink>
                        <NavLink to="/track-order" className={navLinkClass}>
                            {({ isActive }) => (
                                <>
                                    Track Order
                                    {activeIndicator(isActive)}
                                </>
                            )}
                        </NavLink>
                        <NavLink to="/support" className={navLinkClass}>
                            {({ isActive }) => (
                                <>
                                    Support
                                    {activeIndicator(isActive)}
                                </>
                            )}
                        </NavLink>
                    </nav>

                    {/* Search Bar */}
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                className="w-full bg-navy-900/50 border border-navy-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all duration-300"
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    {/* Icons */}
                    <div className="flex items-center space-x-4">
                        <NavLink
                            to="/cart"
                            className="relative text-gray-300 hover:text-lime-400 transition-all duration-300 hover:scale-110"
                        >
                            <ShoppingCart className="h-6 w-6" />
                            {getCartCount() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-lime-500 text-navy-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                                    {getCartCount()}
                                </span>
                            )}
                        </NavLink>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-gray-300 hover:text-lime-400 transition-all duration-300 hover:scale-110"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-navy-800 animate-slideDown">
                        <nav className="flex flex-col space-y-4">
                            <NavLink
                                to="/products"
                                className={({ isActive }) =>
                                    `text-gray-300 hover:text-lime-400 transition-colors py-2 px-4 rounded-lg ${isActive ? 'bg-lime-400/10 text-lime-400' : ''
                                    }`
                                }
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Products
                            </NavLink>
                            <NavLink
                                to="/categories"
                                className={({ isActive }) =>
                                    `text-gray-300 hover:text-lime-400 transition-colors py-2 px-4 rounded-lg ${isActive ? 'bg-lime-400/10 text-lime-400' : ''
                                    }`
                                }
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Categories
                            </NavLink>
                            <NavLink
                                to="/deals"
                                className={({ isActive }) =>
                                    `text-gray-300 hover:text-lime-400 transition-colors py-2 px-4 rounded-lg ${isActive ? 'bg-lime-400/10 text-lime-400' : ''
                                    }`
                                }
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Deals
                            </NavLink>
                            <NavLink
                                to="/track-order"
                                className={({ isActive }) =>
                                    `text-gray-300 hover:text-lime-400 transition-colors py-2 px-4 rounded-lg ${isActive ? 'bg-lime-400/10 text-lime-400' : ''
                                    }`
                                }
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Track Order
                            </NavLink>
                            <NavLink
                                to="/support"
                                className={({ isActive }) =>
                                    `text-gray-300 hover:text-lime-400 transition-colors py-2 px-4 rounded-lg ${isActive ? 'bg-lime-400/10 text-lime-400' : ''
                                    }`
                                }
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Support
                            </NavLink>
                            {/* Mobile Search */}
                            <div className="relative pt-2">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                    className="w-full bg-navy-900/50 border border-navy-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                                />
                                <Search className="absolute left-3 top-4.5 h-5 w-5 text-gray-400" />
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};
