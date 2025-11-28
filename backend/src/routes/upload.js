import express from 'express';
import { upload } from '../middleware/upload.js';
import { uploadImages } from '../controllers/uploadController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Upload images (admin only)
router.post('/', protect, adminOnly, upload.array('images', 10), uploadImages);

export default router;
