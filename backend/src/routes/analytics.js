import express from 'express';
import {
    getDashboardStats,
    getRevenueData,
    getTopProducts,
    getOrderTrends,
    getCustomerInsights
} from '../controllers/analyticsController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All routes are admin-only
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueData);
router.get('/top-products', getTopProducts);
router.get('/order-trends', getOrderTrends);
router.get('/customer-insights', getCustomerInsights);

export default router;
