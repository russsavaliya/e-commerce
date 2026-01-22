/**
 * Order Status Colors
 */
export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-50 text-yellow-800 border-yellow-300',   // Waiting
  confirmed: 'bg-sky-50 text-sky-800 border-sky-300',            // Order confirmed
  accepted: 'bg-teal-50 text-teal-800 border-teal-300',         // Accepted by system
  shipment: 'bg-indigo-50 text-indigo-800 border-indigo-300',  // Shipment created
  shipped: 'bg-violet-50 text-violet-800 border-violet-300',  // On the way
  delivered: 'bg-green-50 text-green-800 border-green-300',     // Success
  cancelled: 'bg-red-50 text-red-800 border-red-300',           // Cancelled
  missing: 'bg-orange-50 text-orange-800 border-orange-300',  // Problem
  failed: 'bg-rose-50 text-rose-800 border-rose-300',         // Failed
};


/**
 * Payment Status Colors
 */
export const PAYMENT_STATUS_COLORS = {
  pending: 'bg-yellow-50 text-yellow-800 border-yellow-300',   // Waiting for payment
  paid: 'bg-green-50 text-green-800 border-green-300',     // Success
  failed: 'bg-red-50 text-red-800 border-red-300',           // Payment failed
  refunded: 'bg-blue-50 text-blue-800 border-blue-300',        // Money returned
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
