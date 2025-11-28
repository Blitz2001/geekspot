import Product from '../models/Product.js';

export const checkProductValidity = async () => {
    try {
        const now = new Date();

        // Find active products where priceValidUntil has passed
        const expiredProducts = await Product.find({
            isActive: true,
            priceValidUntil: { $lt: now }
        });

        if (expiredProducts.length > 0) {
            console.log(`Found ${expiredProducts.length} expired products. Deactivating...`);

            const result = await Product.updateMany(
                {
                    isActive: true,
                    priceValidUntil: { $lt: now }
                },
                {
                    $set: { isActive: false }
                }
            );

            console.log(`Deactivated ${result.modifiedCount} products.`);
        }
    } catch (error) {
        console.error('Error checking product validity:', error);
    }
};

export const startScheduler = () => {
    // Run initially
    checkProductValidity();

    // Run every 2 hours
    setInterval(checkProductValidity, 2 * 60 * 60 * 1000);

    console.log('Product validity scheduler started (running every 2 hours)');
};
