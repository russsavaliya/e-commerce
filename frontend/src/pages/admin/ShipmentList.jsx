import React, { useState, useEffect, useRef } from 'react';
import { Truck, Loader2, Search, Plus, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Select } from 'antd';
import { getAllShipments, createShipment } from '../../services/admin/shipmentService';
import { getAcceptedOrders } from '../../services/admin/orderService';
import { useDebounce } from '../../hooks/useDebounce';
import { useClickOutside } from '../../hooks/useClickOutside';
import Pagination from '../../components/admin/Pagination';

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

const SHIPMENT_STATUS_OPTIONS = [
  { value: '', label: 'All Shipment Status' },
  { value: 'created', label: 'Created' },
  { value: 'pickup_scheduled', label: 'Pickup Scheduled' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'rto', label: 'RTO' },
  { value: 'cancelled', label: 'Cancelled' },
];

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

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    weight: '',
    length: '',
    breadth: '',
    height: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderDropdownOpen, setOrderDropdownOpen] = useState(false);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');

  // Refs
  const isMounted = useRef(true);
  const orderDropdownRef = useClickOutside(() => setOrderDropdownOpen(false));

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchShipments = async () => {
    if (!isMounted.current) return;

    try {
      setLoading(true);
      const response = await getAllShipments(
        pagination.page,
        pagination.limit,
        debouncedSearchTerm,
        shipmentStatusFilter
      );

      if (!isMounted.current) return;

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
      if (isMounted.current) {
        toast.error(error.message || 'Failed to fetch shipments');
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
    fetchShipments();
  }, [debouncedSearchTerm, shipmentStatusFilter]);

  useEffect(() => {
    fetchShipments();
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
    setSearchTerm('');
    setShipmentStatusFilter('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleOrderClick = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleShipmentClick = (shipmentId) => {
    navigate(`/admin/shipments/${shipmentId}`);
  };

  const fetchAcceptedOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await getAcceptedOrders();
      if (response.status && response.data) {
        setAcceptedOrders(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching accepted orders:', error);
      toast.error(error.message || 'Failed to fetch accepted orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    fetchAcceptedOrders();
    setFormData({
      orderId: '',
      weight: '',
      length: '',
      breadth: '',
      height: '',
    });
    setOrderDropdownOpen(false);
    setOrderSearchTerm('');
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setFormData({
      orderId: '',
      weight: '',
      length: '',
      breadth: '',
      height: '',
    });
    setOrderDropdownOpen(false);
    setOrderSearchTerm('');
  };

  const filteredOrders = acceptedOrders.filter((order) => {
    const searchLower = orderSearchTerm.toLowerCase();
    const orderId = order.order_id?.toLowerCase() || '';
    const customerName = order.shipping_address?.fullName?.toLowerCase() || '';
    const email = order.shipping_address?.email?.toLowerCase() || '';
    return orderId.includes(searchLower) || customerName.includes(searchLower) || email.includes(searchLower);
  });

  const getSelectedOrderText = () => {
    if (!formData.orderId) return 'Select an order';
    const selectedOrder = acceptedOrders.find((o) => o.order_id === formData.orderId);
    if (selectedOrder) {
      return `${selectedOrder.order_id} - ${selectedOrder.shipping_address?.fullName || 'N/A'} (₹${selectedOrder.total_amount?.toLocaleString('en-IN') || '0'})`;
    }
    return 'Select an order';
  };

  const handleOrderSelect = (orderId) => {
    setFormData(prev => ({ ...prev, orderId }));
    setOrderDropdownOpen(false);
    setOrderSearchTerm('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();

    if (!formData.orderId) {
      toast.error('Please select an order');
      return;
    }

    if (!formData.weight || !formData.length || !formData.breadth || !formData.height) {
      toast.error('Please fill all dimension fields');
      return;
    }

    const weight = parseFloat(formData.weight);
    const length = parseFloat(formData.length);
    const breadth = parseFloat(formData.breadth);
    const height = parseFloat(formData.height);

    if (isNaN(weight) || weight <= 0 || isNaN(length) || length <= 0 || isNaN(breadth) || breadth <= 0 || isNaN(height) || height <= 0) {
      toast.error('All dimensions must be positive numbers');
      return;
    }

    try {
      setSubmitting(true);
      const response = await createShipment(formData.orderId, {
        weight,
        length,
        breadth,
        height,
      });

      if (response.status) {
        toast.success(response.message || 'Shipment created successfully');
        handleCloseCreateModal();
        fetchShipments();
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast.error(error.message || 'Failed to create shipment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && shipments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <span className="text-lg font-medium text-gray-700">Loading shipments...</span>
        <span className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</span>
      </div>
    );
  }

  const hasActiveFilters = searchTerm || shipmentStatusFilter;

  return (
    <div className="space-y-5">
      {/* Top Box - Header, Search & Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
        <div className="p-5 lg:p-6 space-y-5">
          {/* Header with Create Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Truck className="w-7 h-7 text-indigo-600" />
              Shipment Management
            </h1>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Shipment
            </button>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 min-w-[250px] sm:min-w-[300px]">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by AWB Code or Shiprocket Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-400"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={shipmentStatusFilter}
              onChange={setShipmentStatusFilter}
              placeholder="All Shipment Status"
              className="min-w-[180px]"
              options={SHIPMENT_STATUS_OPTIONS}
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
        {shipments.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Truck className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-700 mb-1.5">No shipments found</p>
            <p className="text-sm text-gray-500">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Shipments will appear here once orders are moved to shipment status'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-gradient-to-r from-indigo-50 to-blue-50/50">
                  <tr>
                    {['#', 'Shipment ID', 'Shiprocket Order ID', 'AWB Code', 'Courier', 'Status', 'Order ID', 'Created At', 'Actions'].map((header) => (
                      <th key={header} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {shipments.map((shipment) => (
                    <tr key={shipment._id} className="hover:bg-indigo-50/30 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-600">
                          {shipment.number_id || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          onClick={() => handleShipmentClick(shipment._id)}
                        >
                          {shipment._id?.substring(0, 8) || 'N/A'}...
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {shipment.shiprocket_order_id || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {shipment.awb_code || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {shipment.courier_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${getShipmentStatusColor(shipment.shipment_status)}`}>
                          {shipment.shipment_status || 'created'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          onClick={() => {
                            if (shipment.order_details?.order_id) {
                              handleOrderClick(shipment.order_details.order_id);
                            }
                          }}
                        >
                          {shipment.order_details?.order_id || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {formatDate(shipment.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {shipment.tracking_url ? (
                          <a
                            href={shipment.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
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

      {/* Create Shipment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-lg shadow-2xl p-6 border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Create New Shipment</h2>
              <button
                onClick={handleCloseCreateModal}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID <span className="text-red-500">*</span>
                </label>
                {loadingOrders ? (
                  <div className="flex items-center justify-center py-3 border border-gray-300 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  </div>
                ) : (
                  <div ref={orderDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        if (acceptedOrders.length > 0) {
                          setOrderDropdownOpen(!orderDropdownOpen);
                          setOrderSearchTerm('');
                        }
                      }}
                      className={`w-full px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all flex items-center justify-between ${
                        !formData.orderId ? 'text-gray-500' : 'text-gray-900'
                      } ${
                        acceptedOrders.length === 0
                          ? 'bg-gray-100 cursor-not-allowed border-gray-300'
                          : 'bg-white cursor-pointer border-gray-300 hover:border-gray-400'
                      }`}
                      disabled={acceptedOrders.length === 0}
                    >
                      <span className="truncate">{getSelectedOrderText()}</span>
                      <svg className={`w-4 h-4 text-gray-400 transition-transform ${orderDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {orderDropdownOpen && acceptedOrders.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                        <div className="p-2 border-b border-gray-200">
                          <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Search by Order ID, Customer Name, or Email..."
                              value={orderSearchTerm}
                              onChange={(e) => setOrderSearchTerm(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredOrders.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">No orders found</div>
                          ) : (
                            filteredOrders.map((order) => (
                              <button
                                key={order._id}
                                type="button"
                                onClick={() => handleOrderSelect(order.order_id)}
                                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 transition-colors ${
                                  formData.orderId === order.order_id
                                    ? 'bg-indigo-100 text-indigo-900'
                                    : 'text-gray-900'
                                }`}
                              >
                                <div className="font-medium">{order.order_id}</div>
                                <div className="text-xs text-gray-600 mt-0.5">
                                  {order.shipping_address?.fullName || 'N/A'} • ₹
                                  {order.total_amount?.toLocaleString('en-IN') || '0'}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {acceptedOrders.length === 0 && !loadingOrders && (
                  <p className="text-xs text-gray-500 mt-1">
                    Only orders with status "accepted" that don't have shipments yet are shown
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="e.g., 0.5"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length (cm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="length"
                    value={formData.length}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="0.1"
                    placeholder="e.g., 10"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Breadth (cm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="breadth"
                    value={formData.breadth}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="0.1"
                    placeholder="e.g., 10"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="0.1"
                    placeholder="e.g., 10"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  disabled={submitting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Shipment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentList;
