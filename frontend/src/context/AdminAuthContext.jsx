import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
};

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Check if admin is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('adminToken');

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/auth/admin/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setAdmin(response.data.user);
            } else {
                localStorage.removeItem('adminToken');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('adminToken');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await axios.post(`${API_URL}/auth/admin/login`, {
            email,
            password
        });

        if (response.data.success) {
            localStorage.setItem('adminToken', response.data.token);
            setAdmin(response.data.user);
            return { success: true };
        }

        return { success: false, message: response.data.message };
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setAdmin(null);
    };

    const value = {
        admin,
        loading,
        login,
        logout,
        isAuthenticated: !!admin
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};
