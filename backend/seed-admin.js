import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@geekspot.lk' });

        if (existingAdmin) {
            console.log('\n⚠️  Admin already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('\nIf you forgot your password, you can delete this admin and run the script again.');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@geekspot.lk',
            password: 'admin123',  // Will be hashed automatically by the pre-save hook
            role: 'admin'
        });

        console.log('\n🎉 Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:    admin@geekspot.lk');
        console.log('🔑 Password: admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n⚠️  IMPORTANT: Please change the password after first login!');
        console.log('\n📍 Login at: http://localhost:5174/admin/login\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
