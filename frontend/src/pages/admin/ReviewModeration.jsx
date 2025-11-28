import { useState, useEffect } from 'react';
import { Star, Check, X, Eye, Trash2, Search, Filter } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StarRating } from '../../components/common/StarRating';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const ReviewModeration = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        rating: '',
        search: ''
    });
    const [rejectModal, setRejectModal] = useState({ open: false, reviewId: null, reason: '' });

    useEffect(() => {
        fetchReviews();
        fetchStats();
    }, [activeTab, filters]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const endpoint = activeTab === 'pending'
                ? `${API_URL}/reviews/admin/pending`
                : `${API_URL}/reviews/admin/all?status=${activeTab}`;

            const params = new URLSearchParams();
            if (filters.rating) params.append('rating', filters.rating);
            if (filters.search) params.append('search', filters.search);

            const separator = endpoint.includes('?') ? '&' : '?';
            const { data } = await axios.get(`${endpoint}${separator}${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(data.reviews);
        } catch (error) {
            toast.error('Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const { data } = await axios.get(`${API_URL}/reviews/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const handleApprove = async (reviewId) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`${API_URL}/reviews/admin/${reviewId}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Review approved!');
            fetchReviews();
            fetchStats();
        } catch (error) {
            toast.error('Failed to approve review');
        }
    };

    const handleReject = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`${API_URL}/reviews/admin/${rejectModal.reviewId}/reject`,
                { reason: rejectModal.reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Review rejected');
            setRejectModal({ open: false, reviewId: null, reason: '' });
            fetchReviews();
            fetchStats();
        } catch (error) {
            toast.error('Failed to reject review');
        }
    };

    const handleDelete = async (reviewId) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${API_URL}/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Review deleted');
            fetchReviews();
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete review');
        }
    };

    return (
        <AdminLayout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Review Moderation</h1>
                    <p className="text-gray-400">Manage customer reviews and maintain quality</p>
                </div>

                {/* Statistics */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-navy-900 border border-navy-700 rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1">Total Reviews</div>
                            <div className="text-2xl font-bold text-white">{stats.totalReviews}</div>
                        </div>
                        <div className="bg-navy-900 border border-lime-400/30 rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1">Pending</div>
                            <div className="text-2xl font-bold text-lime-400">{stats.pendingReviews}</div>
                        </div>
                        <div className="bg-navy-900 border border-green-400/30 rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1">Approved</div>
                            <div className="text-2xl font-bold text-green-400">{stats.approvedReviews}</div>
                        </div>
                        <div className="bg-navy-900 border border-red-400/30 rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1">Rejected</div>
                            <div className="text-2xl font-bold text-red-400">{stats.rejectedReviews}</div>
                        </div>
                        <div className="bg-navy-900 border border-navy-700 rounded-lg p-4">
                            <div className="text-gray-400 text-sm mb-1">Approval Rate</div>
                            <div className="text-2xl font-bold text-white">{stats.approvalRate}%</div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-navy-700">
                    {['pending', 'approved', 'rejected'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-medium capitalize transition-colors ${activeTab === tab
                                ? 'text-lime-400 border-b-2 border-lime-400'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search reviews..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full bg-navy-900 border border-navy-700 rounded-lg pl-10 pr-4 py-2 text-white"
                        />
                    </div>
                    <select
                        value={filters.rating}
                        onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                        className="bg-navy-900 border border-navy-700 rounded-lg px-4 py-2 text-white"
                    >
                        <option value="">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>

                {/* Reviews List */}
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        No {activeTab} reviews found
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-navy-900 border border-navy-700 rounded-lg p-6">
                                <div className="flex gap-6">
                                    {/* Product Image */}
                                    <img
                                        src={review.product?.images?.[0]?.url || '/placeholder.png'}
                                        alt={review.product?.title}
                                        className="w-24 h-24 object-cover rounded-lg"
                                    />

                                    {/* Review Content */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-1">
                                                    {review.product?.title}
                                                </h3>
                                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                                    <span>{review.user?.name}</span>
                                                    <span>•</span>
                                                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                                    {review.verified && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-green-400">Verified Purchase</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <StarRating rating={review.rating} size="sm" />
                                        </div>

                                        <h4 className="font-semibold text-white mb-2">{review.title}</h4>
                                        <p className="text-gray-300 mb-4">{review.comment}</p>

                                        {/* Review Images */}
                                        {review.images?.length > 0 && (
                                            <div className="flex gap-2 mb-4">
                                                {review.images.map((img, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={img.url}
                                                        alt={img.alt}
                                                        className="w-16 h-16 object-cover rounded"
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            {activeTab === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(review._id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectModal({ open: true, reviewId: review._id, reason: '' })}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <a
                                                href={`/products/${review.product?.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white rounded-lg transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Product
                                            </a>
                                            <button
                                                onClick={() => handleDelete(review._id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-navy-800 hover:bg-red-600 text-white rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>

                                        {/* Rejection Reason */}
                                        {review.status === 'rejected' && review.rejectionReason && (
                                            <div className="mt-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                                                <div className="text-sm text-red-400">
                                                    <strong>Rejection Reason:</strong> {review.rejectionReason}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reject Modal */}
                {rejectModal.open && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-navy-900 border border-navy-700 rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-xl font-bold text-white mb-4">Reject Review</h3>
                            <p className="text-gray-400 mb-4">Please provide a reason for rejecting this review:</p>
                            <textarea
                                value={rejectModal.reason}
                                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                                placeholder="e.g., Inappropriate language, spam, etc."
                                className="w-full bg-navy-950 border border-navy-700 rounded-lg p-3 text-white mb-4 h-24 resize-none"
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setRejectModal({ open: false, reviewId: null, reason: '' })}
                                    className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={!rejectModal.reason.trim()}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Reject Review
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};
