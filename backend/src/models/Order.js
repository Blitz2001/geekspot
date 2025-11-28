import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    customerDetails: {
        firstName: String,
        lastName: String,
        email: String,
        mobile: String,
        address: String,
        city: String,
        province: String
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        price: Number,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        image: String
    }],
    subtotal: {
        type: Number,
        required: true
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['bank-transfer', 'cash-on-delivery'],
        required: true
    },
    paymentReceipt: {
        url: String,
        uploadedAt: Date
    },
    transactionId: String,
    paymentStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'failed'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: ['placed', 'payment-confirmed', 'assembling', 'ready', 'on-the-way', 'delivered', 'cancelled'],
        default: 'placed'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verificationNotes: String,
    verifiedAt: Date,
    notes: String,
    trackingInfo: {
        trackingNumber: String,
        carrier: String,
        estimatedDelivery: Date,
        actualDelivery: Date
    },
    orderNotes: [{
        note: {
            type: String,
            required: true
        },
        author: {
            type: String,
            required: true
        },
        isInternal: {
            type: Boolean,
            default: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    statusHistory: [{
        status: {
            type: String,
            required: true
        },
        updatedBy: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String
    }]
}, {
    timestamps: true
});

// Generate order number
orderSchema.pre('save', async function () {
    if (!this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `GS${Date.now().toString().slice(-8)}${(count + 1).toString().padStart(4, '0')}`;
    }
});

export default mongoose.model('Order', orderSchema);
