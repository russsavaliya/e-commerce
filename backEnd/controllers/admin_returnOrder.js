const returnOrder_model = require('../model/returnOrder');
const order_model = require('../model/order');
const shipment_model = require('../model/shipment');

/**
 * Get all return orders with pagination and filters
 * GET /return-order/list
 */
exports.get_return_orders_list = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = '',
    } = req.query || {};

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = {};
    if (status && status.trim()) {
      filter.status = status.trim();
    }

    // Fetch return orders with pagination
    const returnOrders = await returnOrder_model
      .find(filter)
      .populate('order_id', 'order_id shipping_address.email shipping_address.fullName shipping_address.phone total_amount createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const totalCount = await returnOrder_model.countDocuments(filter);

    // Calculate total items for each return order
    const returnOrdersWithDetails = returnOrders.map((returnOrder) => {
      const totalItems = returnOrder.products.reduce((sum, product) => sum + product.quantity, 0);
      return {
        _id: returnOrder._id,
        order_id: returnOrder.order_id?.order_id || 'N/A',
        customer_email: returnOrder.order_id?.shipping_address?.email || 'N/A',
        customer_name: returnOrder.order_id?.shipping_address?.fullName || 'N/A',
        total_items: totalItems,
        status: returnOrder.status,
        requestedAt: returnOrder.requestedAt,
        createdAt: returnOrder.createdAt,
        updatedAt: returnOrder.updatedAt,
      };
    });

    return res.status(200).json({
      status: true,
      message: 'Return orders fetched successfully',
      data: {
        returnOrders: returnOrdersWithDetails,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total_count: totalCount,
          total_pages: Math.ceil(totalCount / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching return orders list:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch return orders',
    });
  }
};

/**
 * Get single return order details
 * GET /return-order/get-one?returnOrderId=xxx
 */
exports.get_one_return_order = async (req, res) => {
  try {
    const { returnOrderId } = req.query;

    if (!returnOrderId) {
      return res.status(400).json({
        status: false,
        message: 'Return order ID is required',
      });
    }

    // Fetch return order with populated order details
    const returnOrder = await returnOrder_model
      .findById(returnOrderId)
      .populate('order_id')
      .lean();

    if (!returnOrder) {
      return res.status(404).json({
        status: false,
        message: 'Return order not found',
      });
    }

    // Get delivery date
    const deliveryDate = await getDeliveryDate(returnOrder.order_id._id);

    // Calculate return window
    let returnWindowEnd = null;
    let isEligible = false;
    if (deliveryDate) {
      returnWindowEnd = new Date(deliveryDate);
      returnWindowEnd.setDate(returnWindowEnd.getDate() + 7);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      isEligible = today <= returnWindowEnd;
    }

    // Format response
    const response = {
      _id: returnOrder._id,
      order: {
        order_id: returnOrder.order_id.order_id,
        total_amount: returnOrder.order_id.total_amount,
        sub_total: returnOrder.order_id.sub_total,
        shipping_amount: returnOrder.order_id.shipping_amount,
        payment_method: returnOrder.order_id.payment_method,
        payment_status: returnOrder.order_id.payment_status,
        order_status: returnOrder.order_id.order_status,
        created_at: returnOrder.order_id.createdAt,
      },
      customer: {
        fullName: returnOrder.order_id.shipping_address.fullName,
        email: returnOrder.order_id.shipping_address.email,
        phone: returnOrder.order_id.shipping_address.phone,
        address: returnOrder.order_id.shipping_address.address,
        city: returnOrder.order_id.shipping_address.city,
        state: returnOrder.order_id.shipping_address.state,
        pincode: returnOrder.order_id.shipping_address.pincode,
      },
      products: returnOrder.products.map((p) => ({
        product_id: p.product_id,
        variant_id: p.variant_id,
        product_name: p.product_name,
        variant_name: p.variant_name,
        quantity: p.quantity,
        unit_price: p.unit_price,
      })),
      return_details: {
        status: returnOrder.status,
        reason: returnOrder.reason || '',
        requestedAt: returnOrder.requestedAt,
        shiprocket_return_id: returnOrder.shiprocket_return_id || null,
        createdAt: returnOrder.createdAt,
        updatedAt: returnOrder.updatedAt,
      },
      delivery_info: {
        delivery_date: deliveryDate,
        return_window_end: returnWindowEnd,
        is_eligible: isEligible,
      },
    };

    return res.status(200).json({
      status: true,
      message: 'Return order fetched successfully',
      data: response,
    });
  } catch (error) {
    console.error('Error fetching return order:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch return order',
    });
  }
};

/**
 * Update return order status
 * PATCH /return-order/update-status
 */
exports.update_return_status = async (req, res) => {
  try {
    const { returnOrderId, status } = req.body || {};

    if (!returnOrderId || !status) {
      return res.status(400).json({
        status: false,
        message: 'Return order ID and status are required',
      });
    }

    // Validate status
    const validStatuses = ['Return Requested', 'Pickup Scheduled', 'Picked', 'Refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    // Find return order
    const returnOrder = await returnOrder_model.findById(returnOrderId);
    if (!returnOrder) {
      return res.status(404).json({
        status: false,
        message: 'Return order not found',
      });
    }

    // Validate status transition (basic validation)
    const currentStatus = returnOrder.status;
    const statusOrder = {
      'Return Requested': 1,
      'Pickup Scheduled': 2,
      'Picked': 3,
      'Refunded': 4,
    };

    // Allow same status or forward progression
    if (statusOrder[status] < statusOrder[currentStatus]) {
      return res.status(400).json({
        status: false,
        message: `Cannot change status from "${currentStatus}" to "${status}". Status can only progress forward.`,
      });
    }

    // Update status
    returnOrder.status = status;
    await returnOrder.save();

    return res.status(200).json({
      status: true,
      message: 'Return order status updated successfully',
      data: {
        returnOrderId: returnOrder._id,
        status: returnOrder.status,
        updatedAt: returnOrder.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating return order status:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to update return order status',
    });
  }
};

/**
 * Helper: Get delivery date for an order
 */
const getDeliveryDate = async (orderId) => {
  try {
    // Check shipment - if delivered, use shipment updatedAt
    const shipment = await shipment_model.findOne({
      order_id: orderId,
      shipment_status: 'delivered',
    });

    if (shipment && shipment.updatedAt) {
      return shipment.updatedAt;
    }

    // Check order status - if delivered, use order updatedAt
    const order = await order_model.findById(orderId);
    if (order && order.order_status === 'delivered' && order.updatedAt) {
      return order.updatedAt;
    }

    // Fallback: if order status is delivered but no updatedAt, use createdAt + 5 days (estimated)
    if (order && order.order_status === 'delivered') {
      const estimatedDelivery = new Date(order.createdAt);
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
      return estimatedDelivery;
    }

    return null;
  } catch (error) {
    console.error('Error getting delivery date:', error);
    return null;
  }
};

