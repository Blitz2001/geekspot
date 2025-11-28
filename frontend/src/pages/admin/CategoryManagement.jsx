import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Edit, Trash2, FolderOpen, Eye, EyeOff } from 'lucide-react';
import categoryService from '../../services/categoryService';
import toast from 'react-hot-toast';
import { iconList, getIconComponent } from '../../utils/icons';

export const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', showOnHome: true, icon: 'Laptop' });
    const [deleteModal, setDeleteModal] = useState({ show: false, category: null });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryService.getAllCategories();
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        try {
            // Generate slug from name
            const slug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            const categoryData = {
                name: formData.name,
                slug: slug,
                description: formData.description,
                showOnHome: formData.showOnHome,
                icon: formData.icon
            };

            if (editingCategory) {
                await categoryService.updateCategory(editingCategory._id, categoryData);
                toast.success('Category updated successfully');
            } else {
                await categoryService.createCategory(categoryData);
                toast.success('Category created successfully');
            }

            setShowModal(false);
            setFormData({ name: '', description: '', showOnHome: true, icon: 'Laptop' });
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save category');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            showOnHome: category.showOnHome !== undefined ? category.showOnHome : true,
            icon: category.icon || 'Laptop'
        });
        setShowModal(true);
    };

    const handleDelete = async () => {
        if (!deleteModal.category) return;

        try {
            await categoryService.deleteCategory(deleteModal.category._id);
            toast.success('Category deleted successfully');
            setDeleteModal({ show: false, category: null });
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete category');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Category Management</h2>
                        <p className="text-gray-400">Manage product categories</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingCategory(null);
                            setFormData({ name: '', description: '' });
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 bg-lime-400 hover:bg-lime-500 text-navy-950 font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Add Category
                    </button>
                </div>

                {/* Categories List */}
                {loading ? (
                    <div className="bg-navy-900 p-8 rounded-lg border border-navy-800 text-center">
                        <p className="text-gray-400">Loading categories...</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="bg-navy-900 p-8 rounded-lg border border-navy-800 text-center">
                        <FolderOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No categories found</p>
                        <p className="text-sm text-gray-500 mt-2">Create your first category to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((category) => (
                            <div
                                key={category._id}
                                className="bg-navy-900 border border-navy-800 rounded-lg p-6 hover:border-lime-400 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="p-2 rounded bg-navy-800 text-lime-400">
                                                {(() => {
                                                    const Icon = getIconComponent(category.icon || 'Laptop');
                                                    return <Icon className="h-5 w-5" />;
                                                })()}
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                                            {category.showOnHome ? (
                                                <Eye className="h-4 w-4 text-lime-400" title="Visible on Landing Page" />
                                            ) : (
                                                <EyeOff className="h-4 w-4 text-gray-600" title="Hidden on Landing Page" />
                                            )}
                                        </div>
                                        {category.description && (
                                            <p className="text-sm text-gray-400">{category.description}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-navy-800">
                                    <span className="text-sm text-gray-400">
                                        {category.productCount || 0} products
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="p-2 text-blue-400 hover:text-blue-500 hover:bg-blue-600/10 rounded transition-colors"
                                            title="Edit category"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ show: true, category })}
                                            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-600/10 rounded transition-colors"
                                            title="Delete category"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-navy-900 rounded-xl max-w-md w-full p-6 border border-navy-800">
                        <h3 className="text-xl font-bold text-white mb-4">
                            {editingCategory ? 'Edit Category' : 'Add New Category'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                                    placeholder="e.g., Graphics Cards"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                                    placeholder="Brief description of the category"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Icon
                                </label>
                                <div className="grid grid-cols-6 gap-2 p-2 bg-navy-950 border border-navy-700 rounded-lg max-h-48 overflow-y-auto">
                                    {iconList.map((iconName) => {
                                        const Icon = getIconComponent(iconName);
                                        return (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon: iconName })}
                                                className={`p-2 rounded flex items-center justify-center transition-colors ${formData.icon === iconName
                                                    ? 'bg-lime-400 text-navy-950'
                                                    : 'text-gray-400 hover:bg-navy-800 hover:text-white'
                                                    }`}
                                                title={iconName}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="showOnHome"
                                    checked={formData.showOnHome}
                                    onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                                    className="w-4 h-4 rounded border-navy-700 text-lime-400 focus:ring-lime-400 bg-navy-950"
                                />
                                <label htmlFor="showOnHome" className="text-sm font-medium text-gray-400 select-none cursor-pointer">
                                    Show on Landing Page
                                </label>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingCategory(null);
                                        setFormData({ name: '', description: '' });
                                    }}
                                    className="px-4 py-2 bg-navy-800 text-white rounded-lg hover:bg-navy-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-lime-400 hover:bg-lime-500 text-navy-950 font-semibold rounded-lg transition-colors"
                                >
                                    {editingCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.show && deleteModal.category && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-navy-900 rounded-xl max-w-md w-full p-6 border border-navy-800">
                        <h3 className="text-xl font-bold text-white mb-4">Delete Category</h3>
                        <p className="text-gray-400 mb-6">
                            Are you sure you want to delete <span className="text-white font-semibold">{deleteModal.category.name}</span>?
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteModal({ show: false, category: null })}
                                className="px-4 py-2 bg-navy-800 text-white rounded-lg hover:bg-navy-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};
