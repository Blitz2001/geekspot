import User from '../models/User.js';

// Get user profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('wishlist', 'title slug price salePrice images stock');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            role: user.role,
            addresses: user.addresses,
            wishlist: user.wishlist,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { name, phone, avatar } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (avatar) user.avatar = avatar;

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add address
export const addAddress = async (req, res) => {
    try {
        const { label, street, city, postalCode, country, isDefault } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If this is set as default, unset other defaults
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push({
            label,
            street,
            city,
            postalCode,
            country: country || 'Sri Lanka',
            isDefault: isDefault || false
        });

        await user.save();

        res.status(201).json({
            message: 'Address added successfully',
            addresses: user.addresses
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update address
export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { label, street, city, postalCode, country, isDefault } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        if (label) address.label = label;
        if (street) address.street = street;
        if (city) address.city = city;
        if (postalCode) address.postalCode = postalCode;
        if (country) address.country = country;
        if (isDefault !== undefined) address.isDefault = isDefault;

        await user.save();

        res.json({
            message: 'Address updated successfully',
            addresses: user.addresses
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete address
export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.addresses.pull(addressId);
        await user.save();

        res.json({
            message: 'Address deleted successfully',
            addresses: user.addresses
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get wishlist
export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('wishlist', 'title slug price salePrice images stock stockStatus rating');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            wishlist: user.wishlist,
            count: user.wishlist.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add to wishlist
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already in wishlist
        if (user.wishlist.includes(productId)) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        user.wishlist.push(productId);
        await user.save();

        await user.populate('wishlist', 'title slug price salePrice images');

        res.json({
            message: 'Added to wishlist',
            wishlist: user.wishlist
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.wishlist.pull(productId);
        await user.save();

        res.json({
            message: 'Removed from wishlist',
            wishlist: user.wishlist
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
