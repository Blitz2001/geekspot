import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin exists
        const adminExists = await User.findOne({ email: 'admin@geekspot.com' });

        if (adminExists) {
            console.log('Admin user already exists');
        } else {
            // Create admin user
            const admin = await User.create({
                name: 'Admin User',
                email: 'admin@geekspot.com',
                password: 'password123', // Will be hashed by pre-save hook
                role: 'admin'
            });
            console.log('Admin user created successfully');
            console.log('Email: admin@geekspot.com');
            console.log('Password: password123');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdmin();
