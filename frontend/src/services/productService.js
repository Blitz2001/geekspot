import api from './api';

const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const productService = {
    // Get all products with filters
    getProducts: async (params = {}) => {
        const response = await api.get('/products', { params });
        return response.data;
    },

    // Get single product by ID
    getProductById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    // Get products by category
    getProductsByCategory: async (category) => {
        const response = await api.get('/products/category', {
            params: { category },
        });
        return response.data;
    },

    // Get featured products
    getFeaturedProducts: async () => {
        const response = await api.get('/products/featured');
        return response.data;
    },

    // Get special deals
    getSpecialDeals: async () => {
        const response = await api.get('/products/special-deals');
        return response.data;
    },

    // Admin: Get all products with pagination
    getAllProductsAdmin: async (params = {}) => {
        const response = await api.get('/products', {
            params,
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Admin: Create product
    createProduct: async (productData) => {
        const response = await api.post('/products', productData, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Admin: Update product
    updateProduct: async (id, productData) => {
        const response = await api.put(`/products/${id}`, productData, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Admin: Delete product (soft delete)
    deleteProduct: async (id) => {
        const response = await api.delete(`/products/${id}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Admin: Hard delete product (permanent)
    hardDeleteProduct: async (id) => {
        const response = await api.delete(`/products/${id}/hard`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Admin: Update stock
    updateStock: async (id, stock) => {
        const response = await api.patch(`/products/${id}/stock`, { stock }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    // Create review
    createReview: async (id, reviewData) => {
        const response = await api.post(`/products/${id}/reviews`, reviewData);
        return response.data;
    }
};
