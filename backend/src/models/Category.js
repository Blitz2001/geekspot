import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    image: String,
    icon: String,
    specFields: [{
        name: String,
        type: String,
        options: [String]
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    showOnHome: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Category', categorySchema);
