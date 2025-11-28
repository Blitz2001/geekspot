import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subcategory: {
        type: String,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    salePrice: {
        type: Number,
        min: 0
    },
    costPrice: {
        type: Number,
        min: 0,
        default: 0
    },
    shippingCost: {
        type: Number,
        min: 0,
        default: 0
    },
    markup: {
        type: Number,
        min: 0,
        default: 0
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    stockStatus: {
        type: String,
        enum: ['in-stock', 'low-stock', 'out-of-stock'],
        default: function () {
            if (this.stock === 0) return 'out-of-stock';
            if (this.stock <= 5) return 'low-stock';
            return 'in-stock';
        }
    },
    images: [{
        url: String,
        alt: String
    }],
    shortSpecs: [String],
    specifications: [{
        key: { type: String, required: true },
        value: { type: String, required: true }
    }],
    description: {
        type: String,
        required: true
    },
    compatibility: [String],
    variants: [{
        name: String,
        options: [String]
    }],
    bundleItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    reviews: [{
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isSpecialDeal: {
        type: Boolean,
        default: false
    },
    dealType: {
        type: String,
        enum: ['percentage', 'amount'],
        default: 'percentage'
    },
    dealValue: {
        type: Number,
        default: 0
    },
    priceValidUntil: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for search and filtering
productSchema.index({ title: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ slug: 1 });

export default mongoose.model('Product', productSchema);
