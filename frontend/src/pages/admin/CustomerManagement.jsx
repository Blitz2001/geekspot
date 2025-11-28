import { AdminLayout } from '../../components/admin/AdminLayout';
import { useState, useEffect } from 'react';
import { Search, Users, Eye, Mail, Filter, X, ChevronDown, ChevronUp, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { CustomerDetailsModal } from '../../components/admin/CustomerDetailsModal';
import { EmailCampaignModal } from '../../components/admin/EmailCampaignModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Filter Options
const ORDER_COUNT_OPTIONS = [
    { value: 'all', label: 'All Customers', min: null, max: null },
    { value: '0', label: 'No Orders (New)', min: 0, max: 0 },
    { value: '1-5', label: '1-5 Orders', min: 1, max: 5 },
    { value: '6-10', label: '6-10 Orders', min: 6, max: 10 },
    { value: '11-20', label: '11-20 Orders', min: 11, max: 20 },
    { value: '20+', label: '20+ Orders', min: 20, max: 999999 }
];

const SPENDING_OPTIONS = [
    { value: 'all', label: 'All Amounts', min: null, max: null },
    { value: '0-50000', label: 'LKR 0 - 50,000', min: 0, max: 50000 },
    { value: '50000-100000', label: 'LKR 50,000 - 100,000', min: 50000, max: 100000 },
    { value: '100000-250000', label: 'LKR 100,000 - 250,000', min: 100000, max: 250000 },
    { value: '250000+', label: 'LKR 250,000+', min: 250000, max: 999999999 }
];

const DATE_OPTIONS = [
    { value: 'all', label: 'All Time', days: null },
    { value: '7d', label: 'Last 7 Days', days: 7 },
    { value: '30d', label: 'Last 30 Days', days: 30 },
    { value: '90d', label: 'Last 90 Days', days: 90 },
    { value: '6m', label: 'Last 6 Months', days: 180 },
    { value: '1y', label: 'Last Year', days: 365 }
];

const SORT_OPTIONS = [
    { value: 'date-desc', label: 'Newest First', field: 'createdAt', order: 'desc' },
    { value: 'date-asc', label: 'Oldest First', field: 'createdAt', order: 'asc' },
    { value: 'name-asc', label: 'Name (A-Z)', field: 'firstName', order: 'asc' },
    { value: 'name-desc', label: 'Name (Z-A)', field: 'firstName', order: 'desc' }
];

export const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailRecipient, setEmailRecipient] = useState(null);

    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        orderCount: 'all',
        spendingRange: 'all',
        dateRange: 'all',
        sortBy: 'date-desc'
    });
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, [currentPage, searchQuery, filters]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);

            // Build query params
            let queryParams = `page=${currentPage}&limit=20&search=${searchQuery}`;

            // Add sort
            const sortOption = SORT_OPTIONS.find(s => s.value === filters.sortBy);
            if (sortOption) {
                queryParams += `&sort=${sortOption.order === 'desc' ? '-' : ''}${sortOption.field}`;
            }

            // Add date filter
            const dateOption = DATE_OPTIONS.find(d => d.value === filters.dateRange);
            if (dateOption && dateOption.days) {
                const date = new Date();
                date.setDate(date.getDate() - dateOption.days);
                queryParams += `&registeredAfter=${date.toISOString()}`;
            }

            const response = await axios.get(
                `${API_URL}/customers?${queryParams}`,
                { headers: getAuthHeader() }
            );

            let filteredCustomers = response.data.customers;

            // Client-side filtering for order count and spending (since these are calculated fields)
            const orderOption = ORDER_COUNT_OPTIONS.find(o => o.value === filters.orderCount);
            if (orderOption && orderOption.min !== null) {
                filteredCustomers = filteredCustomers.filter(customer => {
                    const count = customer.orderCount || 0;
                    return count >= orderOption.min && count <= orderOption.max;
                });
            }

            const spendingOption = SPENDING_OPTIONS.find(s => s.value === filters.spendingRange);
            if (spendingOption && spendingOption.min !== null) {
                filteredCustomers = filteredCustomers.filter(customer => {
                    const spent = customer.totalSpent || 0;
                    return spent >= spendingOption.min && spent <= spendingOption.max;
                });
            }

            setCustomers(filteredCustomers);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            toast.error('Failed to fetch customers');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setFilters({
            orderCount: 'all',
            spendingRange: 'all',
            dateRange: 'all',
            sortBy: 'date-desc'
        });
        setSearchQuery('');
        setCurrentPage(1);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.orderCount !== 'all') count++;
        if (filters.spendingRange !== 'all') count++;
        if (filters.dateRange !== 'all') count++;
        if (searchQuery) count++;
        return count;
    };

    const handleExport = async () => {
        try {
            setExporting(true);

            const response = await axios.get(
                `${API_URL}/customers/export`,
                {
                    headers: getAuthHeader(),
                    responseType: 'blob' // Important for file download
                }
            );

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const fileName = `customers_${new Date().toISOString().split('T')[0]}.csv`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Customer data exported successfully!');
        } catch (error) {
            toast.error('Failed to export customer data');
            console.error(error);
        } finally {
            setExporting(false);
        }
    };

    const handleEmailClick = (recipient) => {
        setEmailRecipient(recipient);
        setShowEmailModal(true);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return `LKR ${amount?.toLocaleString('en-US') || 0}`;
    };

    const activeFiltersCount = getActiveFiltersCount();

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Customer Management</h2>
                    <p className="text-gray-400">View and manage customer information</p>
                </div>

                {/* Search, Filters, and Actions */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2 bg-navy-900 border border-navy-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleExport}
                                disabled={exporting}
                                className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-gray-300 border border-navy-800 rounded-lg hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {exporting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lime-400"></div>
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} />
                                        Export CSV
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters || activeFiltersCount > 0
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-navy-900 text-gray-300 border border-navy-800'
                                    }`}
                            >
                                <Filter size={18} />
                                Filters
                                {activeFiltersCount > 0 && (
                                    <span className="bg-lime-400 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {activeFiltersCount}
                                    </span>
                                )}
                                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <button
                                onClick={() => handleEmailClick('all')}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <Mail size={18} />
                                Broadcast Email
                            </button>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="bg-navy-900 border border-navy-800 rounded-lg p-6 animate-slideDown">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Order Count Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Order Count
                                    </label>
                                    <select
                                        value={filters.orderCount}
                                        onChange={(e) => handleFilterChange('orderCount', e.target.value)}
                                        className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    >
                                        {ORDER_COUNT_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Spending Range Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Total Spent
                                    </label>
                                    <select
                                        value={filters.spendingRange}
                                        onChange={(e) => handleFilterChange('spendingRange', e.target.value)}
                                        className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    >
                                        {SPENDING_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date Range Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Registration Date
                                    </label>
                                    <select
                                        value={filters.dateRange}
                                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                        className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    >
                                        {DATE_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sort By */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Sort By
                                    </label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                        className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    >
                                        {SORT_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Clear Filters Button */}
                            {activeFiltersCount > 0 && (
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={clearAllFilters}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                    >
                                        <X size={16} />
                                        Clear All Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Active Filters Chips */}
                    {activeFiltersCount > 0 && !showFilters && (
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm text-gray-400">Active filters:</span>
                            {searchQuery && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-full text-sm">
                                    Search: "{searchQuery}"
                                    <button onClick={() => setSearchQuery('')} className="hover:text-white">
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                            {filters.orderCount !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-full text-sm">
                                    {ORDER_COUNT_OPTIONS.find(o => o.value === filters.orderCount)?.label}
                                    <button onClick={() => handleFilterChange('orderCount', 'all')} className="hover:text-white">
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                            {filters.spendingRange !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-lime-600/20 border border-lime-500/30 text-lime-300 rounded-full text-sm">
                                    {SPENDING_OPTIONS.find(s => s.value === filters.spendingRange)?.label}
                                    <button onClick={() => handleFilterChange('spendingRange', 'all')} className="hover:text-white">
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                            {filters.dateRange !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-600/20 border border-orange-500/30 text-orange-300 rounded-full text-sm">
                                    {DATE_OPTIONS.find(d => d.value === filters.dateRange)?.label}
                                    <button onClick={() => handleFilterChange('dateRange', 'all')} className="hover:text-white">
                                        <X size={14} />
                                    </button>
                                </span>
                            )}
                            <button
                                onClick={clearAllFilters}
                                className="text-sm text-red-400 hover:text-red-300 underline"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Customers Table */}
                <div className="bg-navy-900 rounded-lg border border-navy-800 overflow-hidden">
                    {loading ? (
                        <div className="p-8">
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-16 bg-navy-800 rounded"></div>
                                ))}
                            </div>
                        </div>
                    ) : customers.length === 0 ? (
                        <div className="text-center py-16">
                            <Users size={48} className="mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-400 text-lg">No customers found</p>
                            {(searchQuery || activeFiltersCount > 0) && (
                                <p className="text-gray-500 text-sm mt-2">
                                    Try adjusting your search or filters
                                </p>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-navy-800">
                                        <tr>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Customer</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Contact</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Orders</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Total Spent</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-gray-300">Registered</th>
                                            <th className="text-right py-4 px-6 text-sm font-semibold text-gray-300">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-navy-800">
                                        {customers.map((customer) => (
                                            <tr key={customer._id} className="hover:bg-navy-800 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                                                            {customer.firstName?.[0]}{customer.lastName?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium">
                                                                {customer.firstName} {customer.lastName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="text-sm">
                                                        <p className="text-gray-300">{customer.email}</p>
                                                        {customer.mobile && (
                                                            <p className="text-gray-500">{customer.mobile}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-white font-medium">
                                                        {customer.orderCount || 0}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-lime-400 font-semibold">
                                                        {formatCurrency(customer.totalSpent)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-gray-400 text-sm">
                                                        {formatDate(customer.createdAt)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedCustomerId(customer._id)}
                                                            className="p-2 text-purple-400 hover:bg-navy-800 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEmailClick(customer)}
                                                            className="p-2 text-purple-400 hover:bg-navy-800 rounded-lg transition-colors"
                                                            title="Send Email"
                                                        >
                                                            <Mail size={18} />
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
                                <div className="flex justify-center items-center gap-2 p-4 border-t border-navy-800">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-navy-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-navy-700 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-gray-400">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-navy-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-navy-700 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Customer Details Modal */}
            {selectedCustomerId && (
                <CustomerDetailsModal
                    customerId={selectedCustomerId}
                    isOpen={!!selectedCustomerId}
                    onClose={() => setSelectedCustomerId(null)}
                    onEmailClick={handleEmailClick}
                />
            )}

            {/* Email Campaign Modal */}
            <EmailCampaignModal
                isOpen={showEmailModal}
                onClose={() => {
                    setShowEmailModal(false);
                    setEmailRecipient(null);
                }}
                recipient={emailRecipient}
            />
        </AdminLayout>
    );
};
