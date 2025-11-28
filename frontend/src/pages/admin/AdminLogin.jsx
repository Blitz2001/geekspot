import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAdminAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please enter email and password');
            return;
        }

        try {
            setLoading(true);
            const result = await login(email, password);

            if (result.success) {
                toast.success('Login successful!');
                navigate('/admin/dashboard');
            } else {
                toast.error(result.message || 'Login failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 flex items-center justify-center p-4">
            <div className="bg-navy-900 p-8 rounded-xl shadow-2xl w-full max-w-md border border-navy-800">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-400/20 rounded-full mb-4">
                        <Lock className="h-8 w-8 text-lime-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
                    <p className="text-gray-400">Geekspot Admin Panel</p>
                </div>

                {/* Info Alert */}
                <div className="bg-lime-400/10 border border-lime-400/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-lime-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                        <p className="font-semibold mb-1 text-lime-400">Default Credentials:</p>
                        <p>Email: admin@geekspot.lk</p>
                        <p>Password: admin123</p>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                                placeholder="admin@geekspot.lk"
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-lime-400 hover:bg-lime-500 text-navy-950 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin"></div>
                                Logging in...
                            </>
                        ) : (
                            <>
                                <Lock className="h-5 w-5" />
                                Login to Admin Panel
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-400">
                    <p>Authorized personnel only</p>
                </div>
            </div>
        </div>
    );
};
