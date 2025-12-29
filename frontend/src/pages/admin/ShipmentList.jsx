import React, { useState, useEffect, useRef } from 'react';
import { Truck, Loader2, Search, ChevronLeft, ChevronRight, Filter, ChevronDown, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllShipments } from '../../services/admin/shipmentService';

const getShipmentStatusColor = (status) => {
  const colors = {
    created: 'bg-blue-100 text-blue-800',
    pickup_scheduled: 'bg-purple-100 text-purple-800',
    picked_up: 'bg-indigo-100 text-indigo-800',
    in_transit: 'bg-yellow-100 text-yellow-800',
    out_for_delivery: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    rto: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ShipmentList = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total_count: 0,
    total_pages: 0,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState('');

  // Refs
  const searchTimeoutRef = useRef(null);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await getAllShipments(
        pagination.page,
        pagination.limit,
        searchTerm,
        shipmentStatusFilter
      );

      if (response.status && response.data) {
        setShipments(response.data.shipments || []);
        setPagination({
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total_count: response.data.total_count || 0,
          total_pages: response.data.total_pages || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error(error.message || 'Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [pagination.page, shipmentStatusFilter]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (pagination.page === 1) {
        fetchShipments();
      } else {
        setPagination((prev) => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleShipmentStatusFilterChange = (e) => {
    setShipmentStatusFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setShipmentStatusFilter('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleOrderClick = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Truck className="w-7 h-7 text-indigo-600" />
              Shipment Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and track all shipments
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by AWB Code or Shiprocket Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <label className="text-sm text-gray-700 font-semibold">Filters:</label>
            </div>
            <select
              value={shipmentStatusFilter}
              onChange={handleShipmentStatusFilterChange}
              className="px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white hover:border-gray-400"
            >
              <option value="">All Shipment Status</option>
              <option value="created">Created</option>
              <option value="pickup_scheduled">Pickup Scheduled</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="rto">RTO</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {(searchTerm || shipmentStatusFilter) && (
              <button
                onClick={clearFilters}
                className="px-3.5 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
            <span className="text-lg font-medium text-gray-700">Loading shipments...</span>
          </div>
        ) : shipments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Truck className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">No shipments found</p>
            <p className="text-sm text-gray-500">
              {searchTerm || shipmentStatusFilter
                ? 'Try adjusting your filters'
                : 'Shipments will appear here once orders are moved to shipment status'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Shiprocket Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      AWB Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Courier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shipments.map((shipment) => (
                    <tr
                      key={shipment._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => shipment.order_details?.order_id && handleOrderClick(shipment.order_details.order_id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {shipment.shiprocket_order_id || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {shipment.awb_code || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {shipment.courier_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${getShipmentStatusColor(
                            shipment.shipment_status
                          )}`}
                        >
                          {shipment.shipment_status || 'created'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (shipment.order_details?.order_id) {
                              handleOrderClick(shipment.order_details.order_id);
                            }
                          }}
                        >
                          {shipment.order_details?.order_id || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(shipment.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {shipment.tracking_url ? (
                          <a
                            href={shipment.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            Track
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">No tracking</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-semibold">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold">
                    {Math.min(pagination.page * pagination.limit, pagination.total_count)}
                  </span>{' '}
                  of <span className="font-semibold">{pagination.total_count}</span> shipments
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700 px-3">
                    Page {pagination.page} of {pagination.total_pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.total_pages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShipmentList;
