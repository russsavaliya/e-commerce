const order_model = require('../model/order');

/**
 * Get all orders with pagination and filters
 */
exports.get_order_list = async (req, res) => {
  try {
    console.log('Order list API called with params:', req.query);
    let { page = 1, limit = 10, search = '', order_status = '', payment_status = '' } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Build aggregation pipeline
    const pipeline = [];

    // Build match conditions
    const matchConditions = {};

    // Search by order_id, customer name, email, or phone
    if (search && search.trim()) {
      matchConditions.$or = [
        { order_id: { $regex: search.trim(), $options: 'i' } },
        { 'shipping_address.fullName': { $regex: search.trim(), $options: 'i' } },
        { 'shipping_address.email': { $regex: search.trim(), $options: 'i' } },
        { 'shipping_address.phone': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Filter by order status
    if (order_status && order_status.trim()) {
      matchConditions.order_status = order_status.trim();
    }

    // Filter by payment status
    if (payment_status && payment_status.trim()) {
      matchConditions.payment_status = payment_status.trim();
    }

    // Add $match stage if conditions exist
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Add $sort stage (newest first)
    pipeline.push({ $sort: { created_at: -1 } });

    // Use $facet to get both paginated results and total count in one query
    pipeline.push({
      $facet: {
        // Paginated orders
        orders: [
          { $skip: skip },
          { $limit: limit },
        ],
        // Total count
        totalCount: [
          { $count: 'count' },
        ],
      },
    });

    // Execute aggregation
    const aggregationResult = await order_model.aggregate(pipeline);

    // Extract results
    const result = aggregationResult[0] || { orders: [], totalCount: [] };
    const orders = result.orders || [];
    const total_count = result.totalCount[0]?.count || 0;
    const total_pages = Math.ceil(total_count / limit);

    return res.status(200).json({
      status: true,
      message: 'Order list fetched successfully',
      data: {
        orders,
        total_count,
        total_pages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch orders',
    });
  }
};

/**
 * Get single order by order_id with aggregation (populated product and category)
 */
exports.get_order_one = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Build aggregation pipeline
    const pipeline = [
      // Match order by order_id
      {
        $match: { order_id: orderId },
      },
      // Lookup product details for each product in the order
      {
        $unwind: {
          path: '$products',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup product details
      {
        $lookup: {
          from: 'products',
          localField: 'products.product_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      // Lookup category details
      {
        $lookup: {
          from: 'categories',
          localField: 'products.category_id',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      // Add product and category info to products array
      {
        $addFields: {
          'products.product_details': {
            $arrayElemAt: ['$productDetails', 0],
          },
          'products.category_details': {
            $arrayElemAt: ['$categoryDetails', 0],
          },
        },
      },
      // Group back to reconstruct order with populated products
      {
        $group: {
          _id: '$_id',
          order_id: { $first: '$order_id' },
          products: { $push: '$products' },
          sub_total: { $first: '$sub_total' },
          shipping_amount: { $first: '$shipping_amount' },
          total_tax: { $first: '$total_tax' },
          total_amount: { $first: '$total_amount' },
          order_status: { $first: '$order_status' },
          payment_method: { $first: '$payment_method' },
          payment_status: { $first: '$payment_status' },
          payment_reference: { $first: '$payment_reference' },
          shipping_address: { $first: '$shipping_address' },
          created_at: { $first: '$created_at' },
          updatedAt: { $first: '$updatedAt' },
          createdAt: { $first: '$createdAt' },
        },
      },
      // Project to clean up the structure
      {
        $project: {
          'products.product_details.attributes': 0,
          'products.product_details.variants': 0,
          'products.product_details.__v': 0,
        },
      },
    ];

    // Execute aggregation
    const result = await order_model.aggregate(pipeline);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'Order not found',
      });
    }

    const order = result[0];

    return res.status(200).json({
      status: true,
      message: 'Order fetched successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch order',
    });
  }
};

/**
 * Update order status
 */
exports.update_order_status = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { order_status } = req.body;

    const allowedStatuses = ['pending', 'accepted', 'shipped', 'missing', 'failed', 'cancelled', 'delivered'];
    
    if (!allowedStatuses.includes(order_status)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid order status',
      });
    }

    const order = await order_model.findOneAndUpdate(
      { order_id: orderId },
      { $set: { order_status } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to update order status',
    });
  }
};

/**
 * Update payment status
 */
exports.update_payment_status = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { payment_status } = req.body;

    const allowedStatuses = ['pending', 'paid', 'failed', 'refunded'];
    
    if (!allowedStatuses.includes(payment_status)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid payment status',
      });
    }

    const order = await order_model.findOneAndUpdate(
      { order_id: orderId },
      { $set: { payment_status } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found',
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Payment status updated successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to update payment status',
    });
  }
};

