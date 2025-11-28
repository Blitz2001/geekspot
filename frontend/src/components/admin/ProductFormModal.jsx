import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import categoryService from '../../services/categoryService';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';

export const ProductFormModal = ({ isOpen, onClose, product, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        brand: '',
        price: '',
        costPrice: '',
        shippingCost: '',
        markup: '',
        stock: '',
        specifications: [],
        shortSpecs: '',
        isActive: true,
        isFeatured: false,
        priceValidUntil: ''
    });
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newSpec, setNewSpec] = useState({ key: '', value: '' });

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (product) {
                // Edit mode - populate form with product data
                setFormData({
                    title: product.title || '',
                    description: product.description || '',
                    category: product.category?._id || '',
                    brand: product.brand || '',
                    price: product.price || '',
                    costPrice: product.costPrice || '',
                    shippingCost: product.shippingCost || '',
                    markup: product.markup || '',
                    stock: product.stock || '',
                    specifications: product.specifications || [],
                    shortSpecs: product.shortSpecs ? product.shortSpecs.join(', ') : '',
                    isActive: product.isActive !== undefined ? product.isActive : true,
                    isFeatured: product.isFeatured || false,
                    priceValidUntil: product.priceValidUntil ? new Date(new Date(product.priceValidUntil).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''
                });

                // Handle images - support both formats: array of objects {url, alt} or array of strings
                const imageUrls = (product.images || []).map(img =>
                    typeof img === 'string' ? img : img.url
                );
                console.log('Product images:', product.images, 'Extracted URLs:', imageUrls);
                setImagePreviews(imageUrls);
            } else {
                // Add mode - reset form
                resetForm();
            }
        }
    }, [isOpen, product]);

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getAllCategories();
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: '',
            brand: '',
            price: '',
            costPrice: '',
            shippingCost: '',
            markup: '',
            stock: '',
            specifications: [],
            shortSpecs: '',
            isActive: true,
            isFeatured: false,
            priceValidUntil: ''
        });
        setImages([]);
        setImagePreviews([]);
        setNewSpec({ key: '', value: '' });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Auto-calculate selling price and profit
    useEffect(() => {
        const cost = parseFloat(formData.costPrice) || 0;
        const shipping = parseFloat(formData.shippingCost) || 0;
        const markupPercent = parseFloat(formData.markup) || 0;

        if (cost > 0) {
            // Formula: (Cost + Shipping) + (Cost * Markup / 100)
            const markupAmount = cost * (markupPercent / 100);
            const calculatedPrice = (cost + shipping + markupAmount).toFixed(2);

            setFormData(prev => ({
                ...prev,
                price: calculatedPrice
            }));
        }
    }, [formData.costPrice, formData.shippingCost, formData.markup]);

    const calculateProfit = () => {
        const price = parseFloat(formData.price) || 0;
        const cost = parseFloat(formData.costPrice) || 0;
        const shipping = parseFloat(formData.shippingCost) || 0;
        return (price - cost - shipping).toFixed(2);
    };

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setImages(files);
        setLoading(true);

        try {
            // Create FormData and append files
            const formData = new FormData();
            files.forEach(file => {
                formData.append('images', file);
            });

            // Upload to backend
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                // Add uploaded URLs to previews
                setImagePreviews([...imagePreviews, ...data.urls]);
                toast.success(`${files.length} image(s) uploaded successfully`);
                // Clear file input
                e.target.value = '';
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload images');
        } finally {
            setLoading(false);
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const addSpecification = () => {
        if (!newSpec.key || !newSpec.value) {
            toast.error('Please enter both key and value for specification');
            return;
        }

        setFormData(prev => ({
            ...prev,
            specifications: [...prev.specifications, { ...newSpec }]
        }));
        setNewSpec({ key: '', value: '' });
    };

    const removeSpecification = (index) => {
        setFormData(prev => ({
            ...prev,
            specifications: prev.specifications.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            toast.error('Product title is required');
            return false;
        }
        if (!formData.category) {
            toast.error('Please select a category');
            return false;
        }
        if (!formData.price || formData.price <= 0) {
            toast.error('Please enter a valid price');
            return false;
        }
        if (formData.stock < 0) {
            toast.error('Stock cannot be negative');
            return false;
        }
        if (!product && images.length === 0) {
            toast.error('Please upload at least one product image');
            return false;
        }
        return true;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            // Generate slug from title
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            const productData = {
                title: formData.title,
                slug: slug,
                description: formData.description,
                category: formData.category,
                brand: formData.brand || 'Generic',
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                specifications: formData.specifications,
                shortSpecs: typeof formData.shortSpecs === 'string'
                    ? formData.shortSpecs.split(',').map(s => s.trim()).filter(s => s)
                    : [],
                isActive: formData.isActive,
                isFeatured: formData.isFeatured,
                costPrice: parseFloat(formData.costPrice) || 0,
                shippingCost: parseFloat(formData.shippingCost) || 0,
                markup: parseFloat(formData.markup) || 0,
                priceValidUntil: formData.priceValidUntil || null,
                images: imagePreviews.length > 0
                    ? imagePreviews.map(url => ({ url, alt: formData.title }))
                    : (product?.images || [])
            };

            if (product) {
                // Update existing product
                await productService.updateProduct(product._id, productData);
                toast.success('Product updated successfully');
            } else {
                // Create new product
                await productService.createProduct(productData);
                toast.success('Product created successfully');
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Product save error:', error);
            toast.error(error.response?.data?.message || `Failed to ${product ? 'update' : 'create'} product`);
        } finally {
            setLoading(false);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className="bg-navy-900 rounded-xl max-w-4xl w-full border border-navy-800"
                style={{ maxHeight: '90vh', overflowY: 'auto', display: 'block' }}
            >
                {/* Header */}
                <div className="bg-navy-900 border-b border-navy-800 p-6 flex items-center justify-between sticky top-0 z-10">
                    <h2 className="text-2xl font-bold text-white">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Basic Information</h3>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Product Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                                placeholder="Enter product title"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                                placeholder="Enter product description"
                            />
                        </div>

                        {/* Short Specs */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Short Specs (comma separated)
                            </label>
                            <input
                                type="text"
                                name="shortSpecs"
                                value={formData.shortSpecs}
                                onChange={handleInputChange}
                                className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                                placeholder="e.g., RTX 4060, 16GB RAM, 1TB SSD"
                            />
                            <p className="text-xs text-gray-500 mt-1">These will appear on the product card</p>
                        </div>

                        {/* Brand */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Brand
                            </label>
                            <input
                                type="text"
                                name="brand"
                                value={formData.brand}
                                onChange={handleInputChange}
                                className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                                placeholder="Enter brand name (e.g., MSI, ASUS, Hikvision)"
                            />
                        </div>

                        {/* Category and Status */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Status
                                </label>
                                <label className="flex items-center gap-3 bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-lime-400 bg-navy-900 border-navy-700 rounded focus:ring-lime-400"
                                    />
                                    <span className="text-white">Active</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Featured
                                </label>
                                <label className="flex items-center gap-3 bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-lime-400 bg-navy-900 border-navy-700 rounded focus:ring-lime-400"
                                    />
                                    <span className="text-white">Featured Deal</span>
                                </label>
                            </div>
                        </div>

                        {/* Costing & Pricing */}
                        <div className="space-y-4 border-t border-navy-800 pt-4">
                            <h3 className="text-lg font-semibold text-white">Costing & Pricing</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Cost Price (LKR)
                                    </label>
                                    <input
                                        type="number"
                                        name="costPrice"
                                        value={formData.costPrice}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Shipping Cost (LKR)
                                    </label>
                                    <input
                                        type="number"
                                        name="shippingCost"
                                        value={formData.shippingCost}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Margin (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="markup"
                                        value={formData.markup}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                                        placeholder="0%"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Price Valid Until
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="priceValidUntil"
                                        value={formData.priceValidUntil}
                                        onChange={handleInputChange}
                                        className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Product will auto-deactivate after this time</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Selling Price (LKR) *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400 font-bold"
                                        placeholder="0.00"
                                        required
                                    />
                                    {formData.costPrice && (
                                        <p className="text-sm mt-1 text-lime-400">
                                            Estimated Profit: LKR {calculateProfit()}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Stock *
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Product Images</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Upload Images {!product && '*'}
                            </label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 cursor-pointer hover:bg-navy-900 transition-colors">
                                    <Upload className="h-5 w-5 text-lime-400" />
                                    <span className="text-white">Choose Files</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        disabled={loading}
                                    />
                                </label>
                                <span className="text-sm text-gray-400">
                                    {loading ? 'Uploading...' : imagePreviews.length > 0 ? `${imagePreviews.length} image(s)` : 'No images'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Images will be uploaded to Cloudinary</p>
                        </div>

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg border border-navy-700"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Specifications */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Specifications</h3>

                        {/* Add Specification */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSpec.key}
                                onChange={(e) => setNewSpec(prev => ({ ...prev, key: e.target.value }))}
                                className="flex-1 bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                                placeholder="Key (e.g., RAM)"
                            />
                            <input
                                type="text"
                                value={newSpec.value}
                                onChange={(e) => setNewSpec(prev => ({ ...prev, value: e.target.value }))}
                                className="flex-1 bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                                placeholder="Value (e.g., 16GB)"
                            />
                            <button
                                type="button"
                                onClick={addSpecification}
                                className="px-4 py-2 bg-lime-400 hover:bg-lime-500 text-navy-950 font-semibold rounded-lg transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Specifications List */}
                        {formData.specifications.length > 0 && (
                            <div className="space-y-2">
                                {formData.specifications.map((spec, index) => (
                                    <div key={index} className="flex items-center justify-between bg-navy-950 border border-navy-700 rounded-lg px-4 py-2">
                                        <span className="text-white">
                                            <span className="font-semibold">{spec.key}:</span> {spec.value}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeSpecification(index)}
                                            className="text-red-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 justify-end pt-4 border-t border-navy-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-navy-800 text-white rounded-lg hover:bg-navy-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-lime-400 hover:bg-lime-500 text-navy-950 font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
