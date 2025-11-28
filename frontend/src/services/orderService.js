import api from './api';

export const orderService = {
    // Create a new order
    createOrder: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    // Get all orders for current user
    getUserOrders: async () => {
        const response = await api.get('/orders/my-orders');
        return response.data;
    },

    // Get single order by ID
    getOrderById: async (orderId) => {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    },

    // Update order status (admin)
    updateOrderStatus: async (orderId, status) => {
        const response = await api.put(`/orders/${orderId}/status`, { status });
        return response.data;
    },

    // Cancel order
    cancelOrder: async (orderId) => {
        const response = await api.put(`/orders/${orderId}/cancel`);
        return response.data;
    },

    // Track order by order number and email
    trackOrder: async (orderNumber, email) => {
        const response = await api.post('/orders/track', { orderNumber, email });
        return response.data;
    }
};
