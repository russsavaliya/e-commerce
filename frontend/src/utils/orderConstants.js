/**
 * Order Status Colors
 */
export const ORDER_STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  shipment: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  missing: 'bg-orange-50 text-orange-700 border-orange-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
};

/**
 * Payment Status Colors
 */
export const PAYMENT_STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  refunded: 'bg-orange-50 text-orange-700 border-orange-200',
};

/**
 * Order Status Options
 */
export const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'All Order Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'shipment', label: 'Shipment' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'missing', label: 'Missing' },
  { value: 'failed', label: 'Failed' },
];

/**
 * Payment Status Options
 */
export const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'All Payment Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

/**
 * Get status color class
 */
export const getStatusColor = (status, type = 'order') => {
  const colors = type === 'order' ? ORDER_STATUS_COLORS : PAYMENT_STATUS_COLORS;
  return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
