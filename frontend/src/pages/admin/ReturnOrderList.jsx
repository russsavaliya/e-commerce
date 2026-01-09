import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Loader2, Eye, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Select } from 'antd';
import { getReturnOrdersList } from '../../services/admin/returnOrderService';
import { useDebounce } from '../../hooks/useDebounce';
import { useClickOutside } from '../../hooks/useClickOutside';
import { formatDate } from '../../utils/orderConstants';
import Pagination from '../../components/admin/Pagination';

const getStatusColor = (status) => {
  const colors = {
    'Return Requested': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Pickup Scheduled': 'bg-blue-50 text-blue-700 border-blue-200',
    'Picked': 'bg-purple-50 text-purple-700 border-purple-200',
    'Refunded': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
};

const RETURN_STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'Return Requested', label: 'Return Requested' },
  { value: 'Pickup Scheduled', label: 'Pickup Scheduled' },
  { value: 'Picked', label: 'Picked' },
  { value: 'Refunded', label: 'Refunded' },
];

const ReturnOrderList = () => {
  const navigate = useNavigate();
  const [returnOrders, setReturnOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total_count: 0,
    total_pages: 0,
  });

  // Filter states
  const [statusFilter, setStatusFilter] = useState('');

  // Refs
  const isMounted = useRef(true);

  const fetchReturnOrders = async (page = pagination.page) => {
    if (!isMounted.current) return;

    try {
      setLoading(true);
      const response = await getReturnOrdersList({
        page,
        limit: pagination.limit,
        status: statusFilter,
      });

      if (!isMounted.current) return;

      if (response.status && response.data) {
        setReturnOrders(response.data.returnOrders || []);
        setPagination(prev => ({
          ...prev,
          page: response.data.pagination.page || page,
          limit: response.data.pagination.limit || pagination.limit,
          total_count: response.data.pagination.total_count || 0,
          total_pages: response.data.pagination.total_pages || 0,
        }));
      } else {
        setReturnOrders([]);
        setPagination(prev => ({ ...prev, total_count: 0, total_pages: 0 }));
      }
    } catch (error) {
      console.error('Fetch Return Orders Error:', error);
      if (isMounted.current) {
        setReturnOrders([]);
        setPagination(prev => ({ ...prev, total_count: 0, total_pages: 0 }));
        toast.error(error.message || 'Failed to fetch return orders');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchReturnOrders(1);
  }, [statusFilter]);

  useEffect(() => {
    fetchReturnOrders();
  }, [pagination.page, pagination.limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const clearFilters = () => {
    setStatusFilter('');
  };

  const handleViewClick = (returnOrderId) => {
    navigate(`/admin/return-orders/${returnOrderId}`);
  };

  if (loading && returnOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
        <span className="text-lg font-medium text-gray-700">Loading return orders...</span>
        <span className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</span>
      </div>
    );
  }

  const hasActiveFilters = statusFilter;

  return (
    <div className="space-y-5">
      {/* Top Box - Header & Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
        <div className="p-5 lg:p-6 space-y-5">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Return Orders</h1>
            <button
              type="button"
              onClick={() => fetchReturnOrders(pagination.page)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Status"
              className="min-w-[180px]"
              options={RETURN_STATUS_OPTIONS}
            />
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3.5 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium border border-gray-200 hover:border-gray-300"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Box - Only Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full">
        {returnOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-700 mb-1.5">No return orders found</p>
            <p className="text-sm text-gray-500">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Return orders will appear here once customers submit return requests'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gradient-to-r from-green-50 to-emerald-50/50">
                  <tr>
                    {['#', 'Order ID', 'Customer Email', 'Total Items', 'Status', 'Requested Date', 'Actions'].map((header) => (
                      <th key={header} className={`px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider ${header === 'Actions' ? 'text-right' : ''}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {returnOrders.map((returnOrder) => (
                    <tr key={returnOrder._id} className="hover:bg-green-50/30 transition-all duration-200">
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-600">{returnOrder.number_id || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{returnOrder.order_id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{returnOrder.customer_email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{returnOrder.total_items}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(returnOrder.status)}`}>
                          {returnOrder.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{formatDate(returnOrder.requestedAt)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewClick(returnOrder._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.total_pages}
              totalCount={pagination.total_count}
              limit={pagination.limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ReturnOrderList;
