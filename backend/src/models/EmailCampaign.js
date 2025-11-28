import mongoose from 'mongoose';

const emailCampaignSchema = new mongoose.Schema({
    campaignName: {
        type: String,
        required: true,
        trim: true
    },
    campaignType: {
        type: String,
        enum: ['new-deal', 'new-stock', 'promotion', 'announcement'],
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    recipientCount: {
        type: Number,
        required: true
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['sent', 'failed', 'scheduled'],
        default: 'sent'
    },
    sentAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('EmailCampaign', emailCampaignSchema);
