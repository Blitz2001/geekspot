
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from './src/models/Review.js';
import Product from './src/models/Product.js';

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const reviews = await Review.find({});
        console.log(`Total Reviews: ${reviews.length}`);

        for (const review of reviews) {
            console.log(`Review ID: ${review._id}`);
            console.log(`  Status: ${review.status}`);
            console.log(`  Product ID: ${review.product}`);
            console.log(`  Rating: ${review.rating}`);

            const product = await Product.findById(review.product);
            if (product) {
                console.log(`  Product Name: ${product.title}`);
            } else {
                console.log(`  Product NOT FOUND`);
            }
        }

        const products = await Product.find({});
        console.log(`\nTotal Products: ${products.length}`);
        products.forEach(p => {
            console.log(`Product: ${p.title} (${p._id}) - Rating: ${p.rating}, NumReviews: ${p.numReviews}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkData();
