import React, { useEffect, useMemo, useState } from 'react';
import { Search, Star, Filter, RefreshCw, ChevronLeft, ChevronRight, Trash2, Edit2, Loader2 } from 'lucide-react';
import { getReviewList, deleteReview } from '../../services/admin/reviewService';
import { getAllProducts } from '../../services/admin/productService';
import { ROUTES } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    );
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [productId, setProductId] = useState('');
  const [rating, setRating] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  const debouncedSearch = useMemo(() => search, [search]);

  // Fetch products for filter dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts(1, 1000, '');
        if (response.status && response.data) {
          // Backend returns productData, not products
          setProducts(response.data.productData || response.data.products || []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getReviewList(page, limit, debouncedSearch, productId, rating);
        if (response.status) {
          setReviews(response.data.reviews || []);
          setTotalPages(response.data.total_pages || 1);
        } else {
          setError(response.message || 'Failed to fetch reviews');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch reviews');
        toast.error(err.message || 'Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, limit, debouncedSearch, productId, rating, refreshKey]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleProductChange = (e) => {
    setProductId(e.target.value);
    setPage(1);
  };

  const handleRatingChange = (e) => {
    setRating(e.target.value);
    setPage(1);
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setDeletingId(reviewId);
      const response = await deleteReview(reviewId);
      if (response.status) {
        toast.success('Review deleted successfully');
        setRefreshKey((k) => k + 1);
      } else {
        toast.error(response.message || 'Failed to delete review');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-green-50">
                  <Star className="w-5 h-5 text-green-600" />
                </div>
                Review List
              </h1>
              <p className="text-sm text-gray-500 mt-1.5 ml-11">
                Manage customer reviews and ratings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(ROUTES.ADMIN_REVIEWS_ADD)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 active:bg-green-800 transition-all duration-200"
              >
                Add Review
              </button>
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name, email, or comment"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white hover:border-gray-400"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <label className="text-sm text-gray-700 font-semibold">Filters:</label>
            </div>
            <select
              value={productId}
              onChange={handleProductChange}
              className="px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white hover:border-gray-400"
            >
              <option value="">All Products</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
            <select
              value={rating}
              onChange={handleRatingChange}
              className="px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white hover:border-gray-400"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
            <span className="text-lg font-medium text-gray-700">Loading reviews...</span>
            <span className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-600 font-medium">{error}</div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-700 mb-1.5">No reviews found</p>
            <p className="text-sm text-gray-500">
              {search || productId || rating ? 'Try adjusting your filters' : 'No reviews have been submitted yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-green-50 to-emerald-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-green-50/30 transition-all duration-200 group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{review.name}</div>
                      {review.email && (
                        <div className="text-sm text-gray-500 mt-0.5">{review.email}</div>
                      )}
                      {review.comment && (
                        <div className="text-sm text-gray-600 mt-2 max-w-md line-clamp-2">
                          {review.comment}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{review.product_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(review.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(review._id)}
                          disabled={deletingId === review._id}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete review"
                        >
                          {deletingId === review._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && reviews.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-4">
          <div className="text-sm text-gray-600">
            Page <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-white hover:border-gray-400 active:bg-gray-50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-white hover:border-gray-400 active:bg-gray-50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;

