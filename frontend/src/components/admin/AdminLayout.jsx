import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Sidebar } from './Sidebar';
import { Menu, X, LogOut } from 'lucide-react';

export const AdminLayout = ({ children }) => {
    const { admin, logout } = useAdminAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        console.log('Logout clicked');
        logout();
        window.location.replace('/admin/login');
    };

    return (
        <div className="min-h-screen bg-navy-950">
            {/* Header */}
            <header className="bg-navy-900 border-b border-navy-800 sticky top-0 z-30">
                <div className="flex items-center justify-between px-4 h-16">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden text-gray-400 hover:text-white"
                        >
                            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>

                        <h1 className="text-2xl font-bold text-lime-400">GEEKSPOT ADMIN</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">{admin?.name}</p>
                            <p className="text-xs text-gray-400">{admin?.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar - Desktop */}
                <div className="hidden lg:block">
                    <Sidebar />
                </div>

                {/* Sidebar - Mobile */}
                {isSidebarOpen && (
                    <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsSidebarOpen(false)}>
                        <div className="w-64" onClick={(e) => e.stopPropagation()}>
                            <Sidebar />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};
