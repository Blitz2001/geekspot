import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, ShoppingCart, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const BottomNav = () => {
    const { getCartCount } = useCart();
    const cartCount = getCartCount();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Grid, label: 'Products', path: '/products' },
        { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: cartCount },
        { icon: Package, label: 'Track', path: '/track-order' }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <div className="bg-navy-950/80 backdrop-blur-md border-t border-navy-800 pb-safe">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive
                                    ? 'text-lime-400'
                                    : 'text-gray-400 hover:text-gray-200'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Active indicator */}
                                    {isActive && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-lime-400 rounded-b-full animate-slideDown" />
                                    )}

                                    {/* Icon with animation */}
                                    <div className={`relative transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100 hover:scale-105'}`}>
                                        <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                        {item.badge > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-lime-500 text-navy-900 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Label */}
                                    <span className={`text-[10px] font-medium transition-all duration-300 ${isActive ? 'font-semibold' : ''}`}>
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BottomNav;
