import Category from '../models/Category.js';
import Product from '../models/Product.js';

// Get all categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });

        // Get product count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const productCount = await Product.countDocuments({
                    category: category._id,
                    isActive: true
                });

                return {
                    ...category.toObject(),
                    productCount
                };
            })
        );

        res.json({
            success: true,
            count: categoriesWithCount.length,
            categories: categoriesWithCount
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories'
        });
    }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Get product count
        const productCount = await Product.countDocuments({
            category: category._id,
            isActive: true
        });

        res.json({
            success: true,
            category: {
                ...category.toObject(),
                productCount
            }
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching category'
        });
    }
};

// Get products in category
export const getCategoryProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 12, sort = '-createdAt' } = req.query;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const products = await Product.find({
            category: id,
            isActive: true
        })
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Product.countDocuments({
            category: id,
            isActive: true
        });

        res.json({
            success: true,
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error('Get category products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
};

// Create category (Admin only)
export const createCategory = async (req, res) => {
    try {
        const { name, slug, description, image, icon, specFields } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ slug });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this slug already exists'
            });
        }

        const category = await Category.create({
            name,
            slug,
            description,
            image,
            icon,
            image,
            icon,
            specFields,
            showOnHome: req.body.showOnHome
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating category'
        });
    }
};

// Update category (Admin only)
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, image, icon, specFields, isActive } = req.body;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if slug is being changed and if it already exists
        if (slug && slug !== category.slug) {
            const existingCategory = await Category.findOne({ slug });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category with this slug already exists'
                });
            }
        }

        // Update fields
        if (name) category.name = name;
        if (slug) category.slug = slug;
        if (description !== undefined) category.description = description;
        if (image !== undefined) category.image = image;
        if (icon !== undefined) category.icon = icon;
        if (specFields) category.specFields = specFields;
        if (isActive !== undefined) category.isActive = isActive;
        if (req.body.showOnHome !== undefined) category.showOnHome = req.body.showOnHome;

        await category.save();

        res.json({
            success: true,
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating category'
        });
    }
};

// Delete category (Admin only)
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if category has products
        const productCount = await Product.countDocuments({ category: id });

        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category with ${productCount} products. Please reassign or delete products first.`
            });
        }

        await Category.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting category'
        });
    }
};
