import express from 'express';
import {
    getProducts,
    getProductBySlug,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    hardDeleteProduct,
    getFeaturedProducts,
    getProductsByCategory,
    updateStock,
    getSpecialDeals,
    getBrands,
    createProductReview
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/brands', getBrands);
router.get('/featured', getFeaturedProducts);
router.get('/special-deals', getSpecialDeals);
router.get('/category/:category', getProductsByCategory);
router.get('/:slug', getProductBySlug);
router.get('/:id', getProductById);
router.post('/:id/reviews', createProductReview);

// Admin routes
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.delete('/:id/hard', protect, adminOnly, hardDeleteProduct);
router.patch('/:id/stock', protect, adminOnly, updateStock);

export default router;
