import React, { useEffect, useState, useRef } from 'react';
import { Search, Users, Filter, RefreshCw, Phone, Mail, MapPin, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getCustomers } from '../../services/admin/customerService';
import { ROUTES } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasOrder, setHasOrder] = useState('');

  const navigate = useNavigate();

  const searchTimeoutRef = useRef(null);
  const isFetchingRef = useRef(false);
  const lastParamsRef = useRef({ page: null, limit: null, search: null, has_order: null });

  // Single unified effect to handle all data fetching
  useEffect(() => {
    // Clear any existing search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    // Determine fetch parameters
    let fetchPage = currentPage;
    let fetchLimit = itemsPerPage;
    let fetchSearch = searchQuery;
    let fetchHasOrder = hasOrder;

    // If search query exists, debounce and reset to page 1
    if (searchQuery.trim() !== '') {
      searchTimeoutRef.current = setTimeout(() => {
        fetchPage = 1;
        fetchSearch = searchQuery;
        const params = { page: fetchPage, limit: fetchLimit, search: fetchSearch, has_order: fetchHasOrder };

        // Only fetch if parameters changed and not already fetching
        if (!isFetchingRef.current &&
          (lastParamsRef.current.page !== params.page ||
            lastParamsRef.current.limit !== params.limit ||
            lastParamsRef.current.search !== params.search ||
            lastParamsRef.current.has_order !== params.has_order)) {
          fetchCustomers(fetchPage, fetchLimit, fetchSearch, fetchHasOrder);
        }
      }, 500);
    } else {
      // No search query - fetch immediately
      const params = { page: fetchPage, limit: fetchLimit, search: fetchSearch, has_order: fetchHasOrder };

      // Only fetch if parameters changed and not already fetching
      if (!isFetchingRef.current &&
        (lastParamsRef.current.page !== params.page ||
          lastParamsRef.current.limit !== params.limit ||
          lastParamsRef.current.search !== params.search ||
          lastParamsRef.current.has_order !== params.has_order)) {
        fetchCustomers(fetchPage, fetchLimit, fetchSearch, fetchHasOrder);
      }
    }

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [currentPage, itemsPerPage, searchQuery, hasOrder]);

  // Fetch Customers from API with Pagination and Search
  const fetchCustomers = async (page = currentPage, limit = itemsPerPage, search = '', has_order = '') => {
    // Prevent duplicate calls
    if (isFetchingRef.current) {
      return;
    }

    // Check if same parameters
    if (lastParamsRef.current.page === page &&
      lastParamsRef.current.limit === limit &&
      lastParamsRef.current.search === search &&
      lastParamsRef.current.has_order === has_order) {
      return;
    }

    isFetchingRef.current = true;
    lastParamsRef.current = { page, limit, search, has_order };

    try {
      setLoading(true);
      setError('');
      const response = await getCustomers({
        page,
        limit,
        search,
        has_order,
      });

      if (response.status) {
        setCustomers(response.data.customers || []);

        // Update pagination metadata from API response
        if (response.data?.total_count !== undefined) {
          setTotalCustomers(response.data.total_count);
          setTotalPages(response.data.total_pages || 1);
        } else {
          // Fallback: calculate from array length if API doesn't return total
          const customersArray = response.data.customers || [];
          setTotalCustomers(customersArray.length);
          setTotalPages(Math.ceil(customersArray.length / limit));
        }
      } else {
        setError(response.message || 'Failed to fetch customers');
        setCustomers([]);
        setTotalCustomers(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      toast.error(err.message || 'Failed to fetch customers');
      setError(err.message || 'Failed to fetch customers');
      setCustomers([]);
      setTotalCustomers(0);
      setTotalPages(1);
      // Reset last params on error so we can retry
      lastParamsRef.current = { page: null, limit: null, search: null, has_order: null };
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleHasOrderChange = (e) => {
    setHasOrder(e.target.value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    // Reset to page 1 and clear search
    setCurrentPage(1);
    setSearchQuery('');
    setHasOrder('');
    // Force refetch by resetting last params
    lastParamsRef.current = { page: null, limit: null, search: null, has_order: null };
  };

  const renderOrderBadge = (count) => {
    if (count > 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-100">
          {count} {count === 1 ? 'order' : 'orders'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-yellow-50 text-yellow-700 border border-yellow-100">
        No orders yet
      </span>
    );
  };

  const renderPaymentStatus = (status) => {
    if (!status) return '—';
    const colorMap = {
      paid: 'bg-green-50 text-green-700 border-green-100',
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
      failed: 'bg-red-50 text-red-700 border-red-100',
      refunded: 'bg-blue-50 text-blue-700 border-blue-100',
    };
    const classes = colorMap[status] || 'bg-gray-50 text-gray-700 border-gray-100';
    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${classes}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>Customers</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Customer List</h1>
          <p className="text-sm text-gray-600">Track addresses and who has placed orders.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-1/2">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name, email, or phone"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-white"
          />
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <div className="relative">
            <select
              value={hasOrder}
              onChange={handleHasOrderChange}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2.5 pr-8 text-sm text-gray-700 cursor-pointer min-w-[160px]"
            >
              <option value="">All customers</option>
              <option value="true">With orders</option>
              <option value="false">No orders</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Payment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Order Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-2" />
                      <span className="text-sm text-gray-500">Loading customers...</span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && customers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-sm font-medium text-gray-700">No customers found</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {searchQuery || hasOrder ? 'Try adjusting your filters' : 'Customers will appear here once they place orders'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && customers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-900">{customer.name || '—'}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{customer.email || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{customer.phone || customer.shipping_address?.phone || '—'}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{customer.shipping_address?.address || '—'}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {customer.shipping_address?.city || '—'}, {customer.shipping_address?.state || '—'} {customer.shipping_address?.pincode ? `- ${customer.shipping_address.pincode}` : ''}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">{renderOrderBadge(customer.order_count || 0)}</td>

                  <td className="px-6 py-4">{renderPaymentStatus(customer.last_payment_status)}</td>

                  <td className="px-6 py-4 text-sm text-gray-700">{formatDate(customer.last_order_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Items per page selector */}
              <div className="flex items-center gap-2 relative z-10">
                <label className="text-sm text-gray-700">Show:</label>
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-700 cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Page info */}
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalCustomers)}
                </span>{' '}
                of <span className="font-medium">{totalCustomers}</span> customers
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${currentPage === pageNum
                          ? 'bg-green-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default CustomerList;

