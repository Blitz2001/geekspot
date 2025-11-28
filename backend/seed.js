import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Product from './src/models/Product.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Make first user an admin
        const user = await User.findOne({ email: 'finaltest@geekspot.com' });
        if (user) {
            user.role = 'admin';
            await user.save();
            console.log('✅ User made admin');
        }

        // Create sample products
        const products = [
            {
                title: 'ASUS ROG Strix G16 Gaming Laptop',
                slug: 'asus-rog-strix-g16-gaming-laptop',
                category: 'laptops',
                brand: 'ASUS',
                price: 185000,
                salePrice: 175000,
                stock: 15,
                description: 'High-performance gaming laptop with Intel i9 and RTX 4070',
                shortSpecs: [
                    'Intel Core i9-13980HX',
                    'NVIDIA RTX 4070 8GB',
                    '16GB DDR5 RAM'
                ],
                fullSpecs: new Map([
                    ['Processor', 'Intel Core i9-13980HX (24 cores, up to 5.6GHz)'],
                    ['Graphics', 'NVIDIA GeForce RTX 4070 8GB GDDR6'],
                    ['RAM', '16GB DDR5-4800MHz (expandable to 32GB)'],
                    ['Storage', '1TB PCIe 4.0 NVMe SSD'],
                    ['Display', '16-inch QHD+ (2560x1600) 240Hz'],
                    ['OS', 'Windows 11 Home']
                ]),
                images: [
                    { url: 'https://example.com/asus-rog-1.jpg', alt: 'ASUS ROG Strix G16' }
                ],
                isFeatured: true
            },
            {
                title: 'MSI GeForce RTX 4090 Gaming X Trio',
                slug: 'msi-geforce-rtx-4090-gaming-x-trio',
                category: 'pc-parts',
                subcategory: 'graphics-cards',
                brand: 'MSI',
                price: 295000,
                stock: 8,
                description: 'Flagship graphics card for ultimate gaming performance',
                shortSpecs: [
                    'NVIDIA RTX 4090 24GB',
                    'Tri Frozr 3 Cooling',
                    'Boost Clock 2640 MHz'
                ],
                fullSpecs: new Map([
                    ['GPU', 'NVIDIA GeForce RTX 4090'],
                    ['Memory', '24GB GDDR6X'],
                    ['Memory Interface', '384-bit'],
                    ['Boost Clock', '2640 MHz'],
                    ['Cooling', 'Tri Frozr 3 with TORX Fan 5.0']
                ]),
                images: [
                    { url: 'https://example.com/msi-rtx-4090.jpg', alt: 'MSI RTX 4090' }
                ],
                isFeatured: true
            },
            {
                title: 'Hikvision 8CH 4K CCTV System',
                slug: 'hikvision-8ch-4k-cctv-system',
                category: 'cctv',
                brand: 'Hikvision',
                price: 85000,
                stock: 12,
                description: 'Complete 8-channel 4K CCTV surveillance system',
                shortSpecs: [
                    '8CH 4K NVR',
                    '4x 8MP IP Cameras',
                    '2TB HDD Included'
                ],
                fullSpecs: new Map([
                    ['NVR', '8-Channel 4K Network Video Recorder'],
                    ['Cameras', '4x 8MP (4K) IP Cameras with Night Vision'],
                    ['Storage', '2TB HDD (expandable to 10TB)'],
                    ['Remote Access', 'Mobile app and web browser'],
                    ['Recording', 'Continuous and motion-triggered']
                ]),
                images: [
                    { url: 'https://example.com/hikvision-cctv.jpg', alt: 'Hikvision CCTV System' }
                ],
                bundleItems: []
            }
        ];

        await Product.deleteMany({}); // Clear existing products
        await Product.insertMany(products);
        console.log(`✅ Created ${products.length} sample products`);

        console.log('\n📦 Sample Products:');
        products.forEach(p => {
            console.log(`  - ${p.title} (${p.category}) - LKR ${p.price.toLocaleString()}`);
        });

        mongoose.connection.close();
        console.log('\n✅ Seed completed successfully!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedData();
