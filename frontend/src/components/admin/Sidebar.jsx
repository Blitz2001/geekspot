import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, FolderOpen, Tag, MessageSquare } from 'lucide-react';

export const Sidebar = () => {
    const navItems = [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
        { to: '/admin/products', icon: Package, label: 'Products' },
        { to: '/admin/customers', icon: Users, label: 'Customers' },
        { to: '/admin/categories', icon: FolderOpen, label: 'Categories' },
        { to: '/admin/deals', icon: Tag, label: 'Deals' },
        { to: '/admin/reviews', icon: MessageSquare, label: 'Reviews' }
    ];

    return (
        <aside className="w-64 bg-navy-900 border-r border-navy-800 min-h-screen">
            <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-lime-400/20 text-lime-400'
                                    : 'text-gray-300 hover:bg-navy-800 hover:text-white'
                                }`
                            }
                        >
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
};
