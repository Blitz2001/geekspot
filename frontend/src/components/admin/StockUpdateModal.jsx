import { useState } from 'react';
import { X } from 'lucide-react';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';

export default function StockUpdateModal({ isOpen, onClose, product, onSuccess }) {
    const [stock, setStock] = useState(product?.stock || 0);
    const [loading, setLoading] = useState(false);

    if (!isOpen || !product) return null;

    const getStockStatus = (stockValue) => {
        if (stockValue === 0) return { text: 'Out of Stock', color: 'text-red-400' };
        if (stockValue < 5) return { text: 'Low Stock', color: 'text-orange-400' };
        if (stockValue < 10) return { text: 'Medium Stock', color: 'text-yellow-400' };
        return { text: 'Good Stock', color: 'text-green-400' };
    };

    const currentStatus = getStockStatus(product.stock);
    const newStatus = getStockStatus(stock);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (stock < 0) {
            toast.error('Stock cannot be negative');
            return;
        }

        setLoading(true);
        try {
            await productService.updateStock(product._id, stock);
            toast.success('Stock updated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update stock');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-navy-900 rounded-xl max-w-md w-full p-6 border border-navy-800">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Update Stock</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Product Info */}
                <div className="mb-6">
                    <p className="text-white font-medium mb-2">{product.title}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">Current Stock:</span>
                        <span className={`font-bold ${currentStatus.color}`}>
                            {product.stock} units
                        </span>
                        <span className={`text-xs ${currentStatus.color}`}>
                            ({currentStatus.text})
                        </span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            New Stock
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={stock}
                            onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                            className="w-full bg-navy-950 border border-navy-700 rounded-lg px-4 py-3 text-white text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-lime-400"
                            autoFocus
                        />
                        <div className="mt-2 text-center">
                            <span className={`text-sm ${newStatus.color}`}>
                                {newStatus.text}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-navy-800 text-white rounded-lg hover:bg-navy-700 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-lime-400 hover:bg-lime-500 text-navy-950 font-semibold rounded-lg transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
