import express from 'express';
import {
    createOrder,
    getOrder,
    getOrderByNumber,
    getAllOrders,
    updateOrderStatus,
    updatePaymentStatus,
    updateTrackingInfo,
    addOrderNote,
    trackOrder
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/', createOrder);
router.post('/track', trackOrder); // Track with order number + email
router.get('/track/:orderNumber', getOrderByNumber);

// Admin routes (must come before /:id to avoid conflicts)
router.get('/', protect, adminOnly, getAllOrders); // Get all orders for admin
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/payment-status', protect, adminOnly, updatePaymentStatus);
router.put('/:id/tracking', protect, adminOnly, updateTrackingInfo);
router.post('/:id/notes', protect, adminOnly, addOrderNote);

// Public route (must come after admin routes)
router.get('/:id', getOrder);

export default router;
