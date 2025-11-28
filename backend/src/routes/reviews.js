import express from 'express';
import {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    getUserReviews,
    getPendingReviews,
    getAllReviews,
    approveReview,
    rejectReview,
    getReviewStats,
    toggleHelpful,
    reportReview
} from '../controllers/reviewController.js';
import { protect, adminOnly, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Customer routes (some require auth, some don't)
router.post('/product/:productId', optionalProtect, createReview);
router.get('/my-reviews', protect, getUserReviews);
router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);
router.post('/:reviewId/helpful', toggleHelpful);  // Works for guests too
router.post('/:reviewId/report', reportReview);    // Works for guests too

// Admin routes
router.get('/admin/pending', protect, adminOnly, getPendingReviews);
router.get('/admin/all', protect, adminOnly, getAllReviews);
router.get('/admin/stats', protect, adminOnly, getReviewStats);
router.put('/admin/:reviewId/approve', protect, adminOnly, approveReview);
router.put('/admin/:reviewId/reject', protect, adminOnly, rejectReview);

export default router;
