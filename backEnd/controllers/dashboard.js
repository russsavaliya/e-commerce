const product_model = require('../model/product');
const category_model = require('../model/category');
const order_model = require('../model/order');
const customer_model = require('../model/customer');

/**
 * Admin dashboard summary
 * Returns counts and monthly revenue/orders trend
 */
exports.get_dashboard_summary = async (req, res) => {
  try {
    const [
      total_products,
      total_categories,
      total_orders,
      total_customers,
      revenueAgg,
      pending_orders,
      monthlyAgg,
    ] = await Promise.all([
      product_model.countDocuments(),
      category_model.countDocuments(),
      order_model.countDocuments(),
      customer_model.countDocuments(),
      order_model.aggregate([
        { $group: { _id: null, total: { $sum: '$total_amount' } } },
      ]),
      order_model.countDocuments({ order_status: 'pending' }),
      order_model.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$created_at' },
              month: { $month: '$created_at' },
            },
            revenue: { $sum: '$total_amount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 },
      ]),
    ]);

    const total_revenue = revenueAgg[0]?.total || 0;

    const monthlyOrders = monthlyAgg
      .map((item) => {
        const date = new Date(item._id.year, item._id.month - 1, 1);
        return {
          month: date.toLocaleString('default', { month: 'short' }),
          year: item._id.year,
          revenue: item.revenue,
          orders: item.orders,
        };
      })
      .sort((a, b) => {
        const aKey = new Date(a.year, new Date(Date.parse(a.month + ' 1')).getMonth());
        const bKey = new Date(b.year, new Date(Date.parse(b.month + ' 1')).getMonth());
        return aKey - bKey;
      });

    return res.status(200).json({
      status: true,
      message: 'Dashboard summary fetched successfully',
      data: {
        metrics: {
          total_products,
          total_categories,
          total_orders,
          total_customers,
          total_revenue,
          pending_orders,
        },
        trends: {
          monthlyOrders,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to fetch dashboard summary',
      error: error.message || 'Unknown error',
    });
  }
};

