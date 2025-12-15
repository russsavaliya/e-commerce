const customer_model = require('../model/customer');

/**
 * Get customer list with order counts and last order info
 * Supports search and pagination
 */
exports.get_customer_list = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '', has_order = '' } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const pipeline = [];

    // Search by name/email/phone
    if (search && search.trim()) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: search.trim(), $options: 'i' } },
            { email: { $regex: search.trim(), $options: 'i' } },
            { phone: { $regex: search.trim(), $options: 'i' } },
          ],
        },
      });
    }

    // Lookup orders by order_id stored on customer
    pipeline.push({
      $lookup: {
        from: 'orders',
        let: { orderIds: '$orders' },
        pipeline: [
          {
            $match: {
              $expr: { $in: ['$order_id', { $ifNull: ['$$orderIds', []] }] },
            },
          },
          { $sort: { created_at: -1 } },
        ],
        as: 'order_docs',
      },
    });

    // Compute counts and last order info
    pipeline.push({
      $addFields: {
        order_count: { $size: { $ifNull: ['$orders', []] } },
        last_order_date: { $max: '$order_docs.created_at' },
        last_order_status: { $arrayElemAt: ['$order_docs.order_status', 0] },
        last_payment_status: { $arrayElemAt: ['$order_docs.payment_status', 0] },
      },
    });

    // Optional filter for has/no orders
    if (has_order === 'true') {
      pipeline.push({ $match: { order_count: { $gt: 0 } } });
    } else if (has_order === 'false') {
      pipeline.push({ $match: { order_count: { $eq: 0 } } });
    }

    // Sort by newest customer or last order date
    pipeline.push({ $sort: { last_order_date: -1, createdAt: -1 } });

    // Facet for pagination + total
    pipeline.push({
      $facet: {
        customers: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              name: 1,
              email: 1,
              phone: 1,
              shipping_address: 1,
              order_count: 1,
              last_order_date: 1,
              last_order_status: 1,
              last_payment_status: 1,
              createdAt: 1,
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    });

    const aggregationResult = await customer_model.aggregate(pipeline);
    const result = aggregationResult[0] || { customers: [], totalCount: [] };
    const customers = result.customers || [];
    const total_count = result.totalCount[0]?.count || 0;
    const total_pages = Math.ceil(total_count / limit);

    return res.status(200).json({
      status: true,
      message: 'Customer list fetched successfully',
      data: {
        customers,
        total_count,
        total_pages,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching customer list:', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to fetch customers',
      error: error.message || 'Unknown error',
    });
  }
};

