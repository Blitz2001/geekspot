import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import StockUpdateModal from '../../components/admin/StockUpdateModal';
import { Search, Filter, Plus, Edit, Trash2, Package } from 'lucide-react';
import { productService } from '../../services/productService';
import categoryService from '../../services/categoryService';
import toast from 'react-hot-toast';

export const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [currentPage, categoryFilter, statusFilter]);

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getAllCategories();
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10
            };

            if (categoryFilter !== 'all') params.category = categoryFilter;

            if (statusFilter !== 'all') {
                params.isActive = statusFilter === 'active';
            } else {
                params.isActive = 'all';
            }

            if (searchTerm) params.search = searchTerm;

            const data = await productService.getAllProductsAdmin(params);
            setProducts(data.products || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchProducts();
    };

    const handleDelete = async (hardDelete = false) => {
        if (!selectedProduct) return;

        try {
            if (hardDelete) {
                // Hard delete - permanently remove
                await productService.hardDeleteProduct(selectedProduct._id);
                toast.success('Product permanently deleted');
            } else {
                // Soft delete - mark as inactive
                await productService.deleteProduct(selectedProduct._id);
                toast.success('Product marked as inactive');
            }

            setShowDeleteModal(false);
            setSelectedProduct(null);
            await fetchProducts(); // Wait for refresh to complete
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete product');
        }
    };

    const getSpecsPreview = (specs) => {
        if (!specs || specs.length === 0) return 'No specs';
        const preview = specs.slice(0, 2).map(spec => `${spec.key}: ${spec.value}`).join(', ');
        return specs.length > 2 ? `${preview}...` : preview;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Product Management</h2>
                        <p className="text-gray-400">Manage your product catalog</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingProduct(null);
                            setShowFormModal(true);
                        }}
                        className="flex items-center gap-2 bg-lime-400 hover:bg-lime-500 text-navy-950 font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Add Product
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-navy-900 p-4 rounded-lg border border-navy-800">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by product title..."
                                    className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400"
                                />
                            </div>
                        </form>

                        {/* Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-navy-950 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Products Table */}
                {loading ? (
                    <div className="bg-navy-900 p-8 rounded-lg border border-navy-800 text-center">
                        <p className="text-gray-400">Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="bg-navy-900 p-8 rounded-lg border border-navy-800 text-center">
                        <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No products found</p>
                    </div>
                ) : (
                    <div className="bg-navy-900 rounded-lg border border-navy-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-navy-950 border-b border-navy-800">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Specifications
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-navy-800">
                                    {products.map((product) => (
                                        <tr key={product._id} className="hover:bg-navy-950 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {product.images?.[0]?.url && (
                                                        <img
                                                            src={product.images[0].url}
                                                            alt={product.images[0].alt || product.title}
                                                            className="w-12 h-12 object-cover rounded"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="text-white font-medium">{product.title}</p>
                                                        <p className="text-sm text-gray-400 line-clamp-1">{product.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-400 border border-blue-600/30">
                                                    {product.category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-white font-semibold">
                                                    LKR {product.price?.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-medium ${product.stock === 0 ? 'text-red-400' :
                                                        product.stock < 5 ? 'text-orange-400' :
                                                            product.stock < 10 ? 'text-yellow-400' :
                                                                'text-green-400'
                                                        }`}>
                                                        {product.stock} units
                                                    </span>
                                                    {product.stock === 0 && (
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-400 border border-red-600/30">
                                                            Out of Stock
                                                        </span>
                                                    )}
                                                    {product.stock > 0 && product.stock < 5 && (
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-600/20 text-orange-400 border border-orange-600/30">
                                                            Low Stock
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-400 line-clamp-1">
                                                    {getSpecsPreview(product.specifications)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${product.isActive
                                                    ? 'bg-green-600/20 text-green-400 border-green-600/30'
                                                    : 'bg-gray-600/20 text-gray-400 border-gray-600/30'
                                                    }`}>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setShowStockModal(true);
                                                        }}
                                                        className="p-2 text-yellow-400 hover:text-yellow-500 hover:bg-yellow-600/10 rounded transition-colors"
                                                        title="Update stock"
                                                    >
                                                        <Package className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingProduct(product);
                                                            setShowFormModal(true);
                                                        }}
                                                        className="p-2 text-blue-400 hover:text-blue-500 hover:bg-blue-600/10 rounded transition-colors"
                                                        title="Edit product"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-600/10 rounded transition-colors"
                                                        title="Delete product"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-navy-950 px-6 py-4 flex items-center justify-between border-t border-navy-800">
                                <div className="text-sm text-gray-400">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Product Form Modal */}
            <ProductFormModal
                isOpen={showFormModal}
                onClose={() => {
                    setShowFormModal(false);
                    setEditingProduct(null);
                }}
                product={editingProduct}
                onSuccess={() => {
                    fetchProducts();
                }}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-navy-900 rounded-xl max-w-md w-full p-6 border border-navy-800">
                        <h3 className="text-xl font-bold text-white mb-4">Delete Product</h3>
                        <p className="text-gray-400 mb-6">
                            Are you sure you want to delete <span className="text-white font-semibold">{selectedProduct.title}</span>?
                        </p>

                        <div className="bg-navy-950 border border-navy-700 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-400 mb-3">Choose deletion type:</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className="text-yellow-400">•</span>
                                    <div>
                                        <span className="text-white font-medium">Soft Delete:</span>
                                        <span className="text-gray-400"> Mark as inactive (can be restored)</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-red-400">•</span>
                                    <div>
                                        <span className="text-white font-medium">Hard Delete:</span>
                                        <span className="text-gray-400"> Permanently remove (cannot be undone)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedProduct(null);
                                }}
                                className="px-4 py-2 bg-navy-800 text-white rounded-lg hover:bg-navy-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(false)}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                            >
                                Soft Delete
                            </button>
                            <button
                                onClick={() => handleDelete(true)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Hard Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock Update Modal */}
            <StockUpdateModal
                isOpen={showStockModal}
                onClose={() => {
                    setShowStockModal(false);
                    setSelectedProduct(null);
                }}
                product={selectedProduct}
                onSuccess={() => {
                    fetchProducts();
                }}
            />
        </AdminLayout>
    );
};
