import express from 'express';
import {
    getAllCustomers,
    getCustomerById,
    getCustomerOrders,
    getCustomerStats,
    searchCustomers
} from '../controllers/customerController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All routes are admin-only
router.use(protect, adminOnly);

router.get('/', getAllCustomers);
router.get('/stats', getCustomerStats);
router.get('/search', searchCustomers);
router.get('/:id', getCustomerById);
router.get('/:id/orders', getCustomerOrders);

export default router;
