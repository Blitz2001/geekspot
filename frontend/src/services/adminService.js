import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get admin token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Dashboard Statistics
export const getDashboardStats = async () => {
    const response = await axios.get(`${API_URL}/analytics/dashboard`, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Revenue Data
export const getRevenueData = async (period = 'month') => {
    const response = await axios.get(`${API_URL}/analytics/revenue`, {
        params: { period },
        headers: getAuthHeader()
    });
    return response.data;
};

// Top Products
export const getTopProducts = async (limit = 5) => {
    const response = await axios.get(`${API_URL}/analytics/top-products`, {
        params: { limit },
        headers: getAuthHeader()
    });
    return response.data;
};

// Order Trends
export const getOrderTrends = async (days = 30) => {
    const response = await axios.get(`${API_URL}/analytics/order-trends`, {
        params: { days },
        headers: getAuthHeader()
    });
    return response.data;
};

// Customer Insights
export const getCustomerInsights = async () => {
    const response = await axios.get(`${API_URL}/analytics/customer-insights`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export default {
    getDashboardStats,
    getRevenueData,
    getTopProducts,
    getOrderTrends,
    getCustomerInsights
};
