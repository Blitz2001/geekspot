import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Get reviews for a product
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10, sort = '-createdAt', rating } = req.query;

        const skip = (page - 1) * limit;

        // Build query - only show approved reviews to customers
        const query = {
            product: productId,
            status: 'approved'
        };

        // Filter by rating if specified
        if (rating) {
            query.rating = Number(rating);
        }

        const reviews = await Review.find(query)
            .populate('user', 'name avatar')
            .sort(sort)
            .limit(Number(limit))
            .skip(skip);

        const total = await Review.countDocuments(query);

        // Calculate rating distribution (only approved reviews)
        const ratingDistribution = await Review.aggregate([
            { $match: { product: productId, status: 'approved' } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);

        res.json({
            reviews,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            ratingDistribution
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a review
export const createReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, title, comment, images, guestName, guestEmail } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Determine if user is logged in
        const userId = req.user ? req.user._id : null;

        // Validation for guest
        if (!userId && !guestName) {
            return res.status(400).json({ message: 'Name is required for guest reviews' });
        }

        // Check if user already reviewed this product (only for logged in users)
        if (userId) {
            const existingReview = await Review.findOne({
                product: productId,
                user: userId
            });

            if (existingReview) {
                return res.status(400).json({
                    message: 'You have already reviewed this product'
                });
            }
        }

        // Check if user purchased this product (optional verification)
        let hasPurchased = false;
        if (userId) {
            const order = await Order.findOne({
                user: userId,
                'items.product': productId,
                paymentStatus: 'confirmed'
            });
            hasPurchased = !!order;
        }

        const review = await Review.create({
            product: productId,
            user: userId,
            guestName: userId ? undefined : guestName,
            guestEmail: userId ? undefined : guestEmail,
            rating,
            title,
            comment,
            images: images || [],
            verified: hasPurchased,
            status: 'pending' // Always pending for guests and users for now
        });

        // Update product rating
        await updateProductRating(productId);

        if (userId) {
            await review.populate('user', 'name avatar');
        }

        res.status(201).json({
            message: 'Review submitted successfully',
            review
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a review
export const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, title, comment, images } = req.body;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns this review
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (rating) review.rating = rating;
        if (title) review.title = title;
        if (comment) review.comment = comment;
        if (images) review.images = images;

        await review.save();

        // Update product rating
        await updateProductRating(review.product);

        res.json({
            message: 'Review updated successfully',
            review
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a review
export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns this review or is admin
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const productId = review.product;
        await Review.findByIdAndDelete(reviewId);

        // Update product rating
        await updateProductRating(productId);

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark review as helpful
export const markHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.helpful += 1;
        await review.save();

        res.json({
            message: 'Marked as helpful',
            helpful: review.helpful
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id })
            .populate('product', 'title slug images')
            .sort('-createdAt');

        res.json({
            reviews,
            count: reviews.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get all pending reviews
export const getPendingReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ status: 'pending' })
            .populate('user', 'name email avatar')
            .populate('product', 'title slug images')
            .sort('-createdAt')
            .limit(Number(limit))
            .skip(skip);

        const total = await Review.countDocuments({ status: 'pending' });

        res.json({
            reviews,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get all reviews (any status)
export const getAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, rating, search } = req.query;
        const skip = (page - 1) * limit;

        const query = {};

        if (status) query.status = status;
        if (rating) query.rating = Number(rating);

        // Search in title or comment
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { comment: { $regex: search, $options: 'i' } }
            ];
        }

        const reviews = await Review.find(query)
            .populate('user', 'name email avatar')
            .populate('product', 'title slug images')
            .populate('moderatedBy', 'name')
            .sort('-createdAt')
            .limit(Number(limit))
            .skip(skip);

        const total = await Review.countDocuments(query);

        res.json({
            reviews,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Approve review
export const approveReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.status = 'approved';
        review.moderatedBy = req.user._id;
        review.moderatedAt = new Date();
        await review.save();

        // Update product rating
        await updateProductRating(review.product);

        res.json({
            message: 'Review approved successfully',
            review
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Reject review
export const rejectReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reason } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.status = 'rejected';
        review.moderatedBy = req.user._id;
        review.moderatedAt = new Date();
        review.rejectionReason = reason || 'No reason provided';
        await review.save();

        res.json({
            message: 'Review rejected successfully',
            review
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get review statistics
export const getReviewStats = async (req, res) => {
    try {
        const totalReviews = await Review.countDocuments();
        const pendingReviews = await Review.countDocuments({ status: 'pending' });
        const approvedReviews = await Review.countDocuments({ status: 'approved' });
        const rejectedReviews = await Review.countDocuments({ status: 'rejected' });

        // Calculate average rating across all approved reviews
        const avgRatingResult = await Review.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);

        const avgRating = avgRatingResult.length > 0
            ? Math.round(avgRatingResult[0].avgRating * 10) / 10
            : 0;

        // Get rating distribution
        const ratingDistribution = await Review.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);

        res.json({
            totalReviews,
            pendingReviews,
            approvedReviews,
            rejectedReviews,
            avgRating,
            approvalRate: totalReviews > 0
                ? Math.round((approvedReviews / totalReviews) * 100)
                : 0,
            ratingDistribution
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle helpful vote
export const toggleHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;

        // Get user identifier (IP or session ID for guests)
        const userIdentifier = req.user?._id?.toString() || req.ip;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user already voted
        const hasVoted = review.helpfulVotes.includes(userIdentifier);

        if (hasVoted) {
            // Remove vote
            review.helpfulVotes = review.helpfulVotes.filter(id => id !== userIdentifier);
            review.helpful = Math.max(0, review.helpful - 1);
        } else {
            // Add vote
            review.helpfulVotes.push(userIdentifier);
            review.helpful += 1;
        }

        await review.save();

        res.json({
            message: hasVoted ? 'Vote removed' : 'Marked as helpful',
            helpful: review.helpful,
            hasVoted: !hasVoted
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Report review
export const reportReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reason } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.reportCount += 1;
        await review.save();

        // TODO: Notify admins if report count exceeds threshold
        // You could send an email or create a notification

        res.json({
            message: 'Review reported successfully. Our team will review it.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to update product rating (only approved reviews)
async function updateProductRating(productId) {
    const stats = await Review.aggregate([
        { $match: { product: productId, status: 'approved' } },
        {
            $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                numReviews: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            numReviews: stats[0].numReviews
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            rating: 0,
            numReviews: 0
        });
    }
}
