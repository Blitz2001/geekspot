import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const resetAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@geekspot.com';

        // Delete existing admin
        const deleted = await User.deleteOne({ email });
        if (deleted.deletedCount > 0) {
            console.log(`Deleted existing admin user: ${email}`);
        } else {
            console.log('No existing admin user found to delete.');
        }

        // Create new admin user
        const admin = await User.create({
            name: 'Admin User',
            email: email,
            password: 'password123',
            role: 'admin',
            isActive: true
        });

        console.log('----------------------------------------');
        console.log('✅ Admin user recreated successfully');
        console.log(`📧 Email:    ${email}`);
        console.log(`🔑 Password: password123`);
        console.log('----------------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error resetting admin user:', error);
        process.exit(1);
    }
};

resetAdmin();
