const draftOrder_model = require('../model/draftOrder');

/**
 * Get all draft orders with pagination and filters
 * GET /draft-orders/list
 */
exports.get_draft_orders_list = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = '',
      search = '',
    } = req.query || {};

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = {};
    
    // Status filter
    if (status && status.trim()) {
      filter.status = status.trim();
    } else {
      // Default: show only in_progress (converted ones are deleted)
      filter.status = 'in_progress';
    }

    // Search filter (by email, name, phone)
    if (search && search.trim()) {
      filter.$or = [
        { email: { $regex: search.trim(), $options: 'i' } },
        { 'shipping_address.fullName': { $regex: search.trim(), $options: 'i' } },
        { 'shipping_address.phone': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Fetch draft orders with pagination
    const draftOrders = await draftOrder_model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const totalCount = await draftOrder_model.countDocuments(filter);

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limitNum);

    // Format response
    const formattedDraftOrders = draftOrders.map((draftOrder) => ({
      _id: draftOrder._id,
      email: draftOrder.email,
      customer_name: draftOrder.shipping_address?.fullName || 'N/A',
      customer_phone: draftOrder.shipping_address?.phone || 'N/A',
      total_amount: draftOrder.total_amount || 0,
      cart_items_count: draftOrder.cart_items?.length || 0,
      step: draftOrder.step,
      status: draftOrder.status,
      createdAt: draftOrder.createdAt,
      updatedAt: draftOrder.updatedAt,
    }));

    return res.status(200).json({
      status: true,
      message: 'Draft orders fetched successfully',
      data: {
        draftOrders: formattedDraftOrders,
        total_count: totalCount,
        total_pages: totalPages,
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Error fetching draft orders:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch draft orders',
    });
  }
};

