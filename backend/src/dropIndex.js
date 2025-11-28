import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from './models/Review.js';

dotenv.config();

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Drop the unique index on product + user
        // The index name is usually product_1_user_1 but we should check or just try to drop it
        try {
            await Review.collection.dropIndex('product_1_user_1');
            console.log('Successfully dropped unique index: product_1_user_1');
        } catch (error) {
            console.log('Index might not exist or name is different:', error.message);

            // List indexes to see what's there
            const indexes = await Review.collection.indexes();
            console.log('Current indexes:', indexes);
        }

        console.log('Done');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

dropIndex();
