import Product from '../models/Product.js';

// Get all products with filtering, search, and pagination
export const getProducts = async (req, res) => {
    try {
        const {
            category,
            brand,
            minPrice,
            maxPrice,
            search,
            sort = '-createdAt',
            page = 1,
            limit = 20,
            inStock,
            isActive
        } = req.query;

        // Build filter object
        const filter = {};

        // Filter by isActive
        if (isActive === 'true') {
            filter.isActive = true;
        } else if (isActive === 'false') {
            filter.isActive = false;
        } else if (isActive === 'all') {
            // Do not filter by isActive (show all)
        } else {
            // Default to active only (for public API where param is missing)
            filter.isActive = true;
        }

        // Handle category filtering - support both name and ID
        if (category) {
            // Check if it's a valid ObjectId
            if (category.match(/^[0-9a-fA-F]{24}$/)) {
                filter.category = category;
            } else {
                // Look up category by name
                const Category = (await import('../models/Category.js')).default;
                const categoryDoc = await Category.findOne({ name: category });
                if (categoryDoc) {
                    filter.category = categoryDoc._id;
                } else {
                    // If category not found, return empty results
                    return res.json({
                        products: [],
                        pagination: {
                            page: Number(page),
                            limit: Number(limit),
                            total: 0,
                            pages: 0
                        }
                    });
                }
            }
        }

        if (brand) {
            filter.brand = { $regex: brand, $options: 'i' };
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (inStock === 'true') filter.stock = { $gt: 0 };
        if (search) {
            // Use regex for partial matching across multiple fields
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute query
        const products = await Product.find(filter)
            .populate('category', 'name slug')
            .sort(sort)
            .limit(Number(limit))
            .skip(skip)
            .select('-__v');

        // Get total count for pagination
        const total = await Product.countDocuments(filter);

        res.json({
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all unique brands
export const getBrands = async (req, res) => {
    try {
        const brands = await Product.distinct('brand', { isActive: true });
        res.json(brands.sort());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single product by slug
export const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        let product;

        // Check if the slug is a valid ObjectId (24 hex characters)
        if (slug.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(slug)
                .populate('category', 'name slug')
                .populate('bundleItems', 'title slug price images');
        }

        // If not found by ID or not an ID, try finding by slug
        if (!product) {
            product = await Product.findOne({
                slug: slug,
                isActive: true
            })
                .populate('category', 'name slug')
                .populate('bundleItems', 'title slug price images');
        }

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get product by ID (admin)
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new product (admin only)
export const createProduct = async (req, res) => {
    try {
        const {
            title, description, price, category, subcategory, brand, stock,
            images, specifications, shortSpecs, compatibility, variants, bundleItems,
            isActive, isFeatured, isSpecialDeal, dealType, dealValue,
            costPrice, shippingCost, markup, priceValidUntil, salePrice
        } = req.body;

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if slug already exists
        const existingProduct = await Product.findOne({ slug });
        if (existingProduct) {
            return res.status(400).json({
                message: 'Product with similar title already exists'
            });
        }

        // Calculate sale price if special deal
        let finalSalePrice = salePrice;
        if (isSpecialDeal && dealValue > 0) {
            if (dealType === 'percentage') {
                finalSalePrice = price - (price * dealValue / 100);
            } else {
                finalSalePrice = price - dealValue;
            }
        }

        const product = await Product.create({
            title,
            slug,
            category,
            subcategory,
            brand,
            price,
            salePrice: finalSalePrice,
            stock,
            images: images || [],
            shortSpecs: shortSpecs || [],
            specifications: specifications || [],
            description,
            compatibility: compatibility || [],
            variants: variants || [],
            bundleItems: bundleItems || [],
            isActive: isActive !== undefined ? isActive : true,
            isFeatured: isFeatured || false,
            isSpecialDeal: isSpecialDeal || false,
            dealType: dealType || 'percentage',
            dealValue: dealValue || 0,
            costPrice: Number(costPrice) || 0,
            shippingCost: Number(shippingCost) || 0,
            markup: Number(markup) || 0,
            priceValidUntil: priceValidUntil ? new Date(priceValidUntil) : undefined
        });

        res.status(201).json({
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update product (admin only)
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // If title is being updated, regenerate slug
        if (req.body.title && req.body.title !== product.title) {
            const newSlug = req.body.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            const existingProduct = await Product.findOne({
                slug: newSlug,
                _id: { $ne: product._id }
            });

            if (existingProduct) {
                return res.status(400).json({
                    message: 'Product with similar title already exists'
                });
            }

            req.body.slug = newSlug;
        }

        // Handle salePrice removal when deal is removed
        // Check if salePrice is explicitly set to null or undefined
        if ('salePrice' in req.body && (req.body.salePrice === null || req.body.salePrice === undefined)) {
            product.salePrice = undefined;
            delete req.body.salePrice; // Remove from req.body to avoid Object.assign issues
        }

        // Handle priceValidUntil
        if (req.body.priceValidUntil !== undefined) {
            req.body.priceValidUntil = req.body.priceValidUntil ? new Date(req.body.priceValidUntil) : undefined;
        }

        // Update product
        Object.assign(product, req.body);
        await product.save();

        res.json({
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete product (soft delete - admin only)
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.isActive = false;
        await product.save();

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hard delete product (permanent - admin only)
export const hardDeleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product permanently deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get special deals
export const getSpecialDeals = async (req, res) => {
    try {
        const products = await Product.find({
            isSpecialDeal: true,
            isActive: true
        })
            .select('title price salePrice images category brand stock rating dealType dealValue')
            .populate('category', 'name')
            .limit(8);

        res.json(products);
    } catch (error) {
        console.error('Get special deals error:', error);
        res.status(500).json({ message: 'Error fetching special deals' });
    }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({
            isFeatured: true,
            isActive: true,
            stock: { $gt: 0 }
        })
            .limit(10)
            .select('title slug price salePrice images shortSpecs rating stock category brand')
            .populate('category', 'name');

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 20, sort = '-createdAt' } = req.query;

        const skip = (page - 1) * limit;

        const products = await Product.find({
            category,
            isActive: true
        })
            .sort(sort)
            .limit(Number(limit))
            .skip(skip);

        const total = await Product.countDocuments({ category, isActive: true });

        res.json({
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update stock (admin only)
export const updateStock = async (req, res) => {
    try {
        const { stock } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.stock = stock;
        await product.save();

        res.json({
            message: 'Stock updated successfully',
            product: {
                id: product._id,
                title: product.title,
                stock: product.stock,
                stockStatus: product.stockStatus
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create product review
export const createProductReview = async (req, res) => {
    try {
        const { rating, comment, name } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const review = {
            name,
            rating: Number(rating),
            comment,
            createdAt: Date.now()
        };

        product.reviews.push(review);

        // Recalculate average rating
        product.rating.count = product.reviews.length;
        product.rating.average =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();

        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
