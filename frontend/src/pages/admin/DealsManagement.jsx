import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Tag, Percent, DollarSign } from 'lucide-react';
import { productService } from '../../services/productService';
import { Button } from '../../components/common/Button';
import { AdminLayout } from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

export const DealsManagement = () => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // Form state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [dealType, setDealType] = useState('percentage');
    const [dealValue, setDealValue] = useState(0);

    useEffect(() => {
        fetchDeals();
    }, []);

    useEffect(() => {
        if (searchTerm.length > 2) {
            searchProducts();
        } else {
            setSearchResults([]);
        }
    }, [searchTerm]);

    const fetchDeals = async () => {
        try {
            setLoading(true);
            const data = await productService.getSpecialDeals();
            setDeals(data);
        } catch (error) {
            console.error('Error fetching deals:', error);
            toast.error('Failed to load special deals');
        } finally {
            setLoading(false);
        }
    };

    const searchProducts = async () => {
        try {
            setSearching(true);
            const response = await productService.getAllProductsAdmin({ search: searchTerm, limit: 5 });
            // Filter out products that are already special deals
            const availableProducts = response.products.filter(
                p => !deals.some(d => d._id === p._id)
            );
            setSearchResults(availableProducts);
        } catch (error) {
            console.error('Error searching products:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleAddDeal = async () => {
        if (!selectedProduct) return;

        const salePrice = calculateSalePrice(selectedProduct.price, dealType, Number(dealValue));

        try {
            await productService.updateProduct(selectedProduct._id, {
                isSpecialDeal: true,
                dealType,
                dealValue: Number(dealValue),
                salePrice: Math.round(salePrice)
            });

            toast.success('Special deal added successfully');
            setShowModal(false);
            resetForm();
            fetchDeals();
        } catch (error) {
            console.error('Error adding deal:', error);
            toast.error('Failed to add special deal');
        }
    };

    const handleRemoveDeal = async (productId) => {
        console.log('handleRemoveDeal called with productId:', productId);

        try {
            console.log('Sending update request to remove deal...');
            const result = await productService.updateProduct(productId, {
                isSpecialDeal: false,
                dealType: 'percentage',
                dealValue: 0,
                salePrice: null
            });
            console.log('Update result:', result);
            toast.success('Special deal removed successfully');
            fetchDeals();
        } catch (error) {
            console.error('Error removing deal:', error);
            toast.error('Failed to remove special deal');
        }
    };

    const resetForm = () => {
        setSelectedProduct(null);
        setSearchTerm('');
        setSearchResults([]);
        setDealType('percentage');
        setDealValue(0);
    };

    const calculateSalePrice = (price, type, value) => {
        if (type === 'percentage') {
            return price - (price * value / 100);
        }
        return price - value;
    };

    return (
        <AdminLayout>
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">Special Deals</h1>
                        <p className="text-gray-400">Manage your special offers and discounts</p>
                    </div>
                    <Button variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add New Deal
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading deals...</div>
                ) : deals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {deals.map((deal) => (
                            <div key={deal._id} className="card p-4 flex gap-4">
                                <img
                                    src={deal.images?.[0]?.url || '/placeholder.png'}
                                    alt={deal.title}
                                    className="w-24 h-24 object-cover rounded-lg bg-navy-900"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white mb-1 line-clamp-1">{deal.title}</h3>
                                    <p className="text-sm text-gray-400 mb-2">{deal.category?.name}</p>

                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-lime-400 font-bold">
                                            LKR {deal.salePrice?.toLocaleString()}
                                        </span>
                                        <span className="text-gray-500 line-through text-sm">
                                            LKR {deal.price?.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-lime-400/10 text-lime-400">
                                            <Tag className="h-3 w-3" />
                                            {deal.dealType === 'percentage' ? `${deal.dealValue}% OFF` : `LKR ${deal.dealValue} OFF`}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveDeal(deal._id)}
                                            className="text-red-400 hover:text-red-300 p-1"
                                            title="Remove Deal"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 card border-dashed border-navy-700">
                        <Tag className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Active Deals</h3>
                        <p className="text-gray-400 mb-6">Create your first special deal to attract customers</p>
                        <Button variant="primary" onClick={() => setShowModal(true)}>
                            Create Deal
                        </Button>
                    </div>
                )}

                {/* Add Deal Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-navy-900 rounded-xl border border-navy-700 w-full max-w-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Add Special Deal</h2>

                            <div className="space-y-6">
                                {/* Product Search */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Select Product
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={selectedProduct ? selectedProduct.title : searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setSelectedProduct(null);
                                            }}
                                            className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-lime-400 focus:outline-none"
                                        />

                                        {/* Search Results Dropdown */}
                                        {searchTerm.length > 2 && !selectedProduct && searchResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-navy-800 border border-navy-700 rounded-lg shadow-xl max-h-60 overflow-y-auto z-10">
                                                {searchResults.map(product => (
                                                    <button
                                                        key={product._id}
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setSearchTerm('');
                                                        }}
                                                        className="w-full text-left p-3 hover:bg-navy-700 flex items-center gap-3 transition-colors"
                                                    >
                                                        <img
                                                            src={product.images?.[0]?.url || '/placeholder.png'}
                                                            alt={product.title}
                                                            className="w-10 h-10 rounded bg-navy-900 object-cover"
                                                        />
                                                        <div>
                                                            <div className="text-white font-medium line-clamp-1">{product.title}</div>
                                                            <div className="text-sm text-gray-400">LKR {product.price.toLocaleString()}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedProduct && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                                    Discount Type
                                                </label>
                                                <div className="flex rounded-lg bg-navy-950 p-1 border border-navy-700">
                                                    <button
                                                        onClick={() => setDealType('percentage')}
                                                        className={`flex-1 py-1.5 text-sm font-medium rounded ${dealType === 'percentage'
                                                            ? 'bg-navy-800 text-white shadow-sm'
                                                            : 'text-gray-400 hover:text-white'
                                                            }`}
                                                    >
                                                        Percentage
                                                    </button>
                                                    <button
                                                        onClick={() => setDealType('amount')}
                                                        className={`flex-1 py-1.5 text-sm font-medium rounded ${dealType === 'amount'
                                                            ? 'bg-navy-800 text-white shadow-sm'
                                                            : 'text-gray-400 hover:text-white'
                                                            }`}
                                                    >
                                                        Fixed Amount
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                                    {dealType === 'percentage' ? 'Percentage Off (%)' : 'Amount Off (LKR)'}
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={dealValue}
                                                        onChange={(e) => setDealValue(e.target.value)}
                                                        className="w-full bg-navy-950 border border-navy-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-lime-400 focus:outline-none"
                                                    />
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                        {dealType === 'percentage' ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Preview Calculation */}
                                        <div className="bg-navy-950 rounded-lg p-4 border border-navy-700">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-400">Original Price:</span>
                                                <span className="text-white line-through">LKR {selectedProduct.price.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-400">Discount:</span>
                                                <span className="text-lime-400">
                                                    - {dealType === 'percentage' ? `${dealValue}%` : `LKR ${Number(dealValue).toLocaleString()}`}
                                                </span>
                                            </div>
                                            <div className="border-t border-navy-800 my-2 pt-2 flex justify-between items-center">
                                                <span className="font-semibold text-white">New Sale Price:</span>
                                                <span className="font-bold text-xl text-lime-400">
                                                    LKR {calculateSalePrice(selectedProduct.price, dealType, Number(dealValue)).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="secondary"
                                        className="flex-1"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="flex-1"
                                        disabled={!selectedProduct || dealValue <= 0}
                                        onClick={handleAddDeal}
                                    >
                                        Save Deal
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};
