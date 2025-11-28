
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from './src/models/Review.js';
import Product from './src/models/Product.js';

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const products = await Product.find({}, 'title _id rating numReviews');
        console.log('--- PRODUCTS ---');
        console.log(JSON.stringify(products, null, 2));

        const reviews = await Review.find({}, 'product status rating title user guestName');
        console.log('--- REVIEWS ---');
        console.log(JSON.stringify(reviews, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkData();
