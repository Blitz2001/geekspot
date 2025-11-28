import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get admin token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all categories
export const getAllCategories = async () => {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
};

// Get category by ID
export const getCategoryById = async (id) => {
    const response = await axios.get(`${API_URL}/categories/${id}`);
    return response.data;
};

// Create category (Admin)
export const createCategory = async (data) => {
    const response = await axios.post(`${API_URL}/categories`, data, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Update category (Admin)
export const updateCategory = async (id, data) => {
    const response = await axios.put(`${API_URL}/categories/${id}`, data, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Delete category (Admin)
export const deleteCategory = async (id) => {
    const response = await axios.delete(`${API_URL}/categories/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export default {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
