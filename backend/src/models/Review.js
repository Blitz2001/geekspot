import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    guestName: {
        type: String,
        trim: true
    },
    guestEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    verified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    moderatedAt: {
        type: Date
    },
    rejectionReason: {
        type: String,
        trim: true,
        maxlength: 500
    },
    helpful: {
        type: Number,
        default: 0
    },
    helpfulVotes: [{
        type: String  // Store IP addresses or session IDs for guest users
    }],
    reportCount: {
        type: Number,
        default: 0
    },
    images: [{
        url: String,
        alt: String
    }]
}, {
    timestamps: true
});

// Ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Index for admin queries
reviewSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
