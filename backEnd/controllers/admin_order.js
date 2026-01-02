const order_model = require('../model/order');
const shipment_controller = require('./shipment');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const pdf = require('html-pdf');
const shipment_model = require('../model/shipment');

/**
 * Get accepted orders for shipment creation dropdown
 */
exports.get_accepted_orders = async (req, res) => {
  try {
    // Get all accepted orders
    const orders = await order_model
      .find({ order_status: 'accepted' })
      .select('order_id shipping_address.fullName shipping_address.email total_amount createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Get all order IDs that already have shipments
    const shipments = await shipment_model
      .find({})
      .select('order_id')
      .lean();

    // Create a set of order MongoDB IDs that already have shipments
    const orderIdsWithShipments = new Set(
      shipments.map((s) => s.order_id?.toString())
    );

    // Filter out orders that already have shipments
    const availableOrders = orders.filter(
      (order) => !orderIdsWithShipments.has(order._id.toString())
    );

    return res.status(200).json({
      status: true,
      message: 'Accepted orders fetched successfully',
      data: availableOrders,
    });
  } catch (error) {
    console.error('Error fetching accepted orders:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch accepted orders',
    });
  }
};

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


exports.update_order_status = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { order_status } = req.body;

    const allowedStatuses = ['pending', 'accepted', 'shipment', 'shipped', 'missing', 'failed', 'cancelled', 'delivered'];
    
    if (!allowedStatuses.includes(order_status)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid order status',
      });
    }

    const order = await order_model.findOne({ order_id: orderId });

    if (!order) {
      return res.status(404).json({
        status: false,
        message: 'Order not found',
      });
    }

  

    // Update order status
    const updatedOrder = await order_model.findOneAndUpdate(
      { order_id: orderId },
      { $set: { order_status } },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
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

/**
 * Export orders as CSV or PDF
 * Query: format=csv|pdf, search, order_status, payment_status
 */
exports.export_orders = async (req, res) => {
  try {
    let { format = 'csv', search = '', order_status = '', payment_status = '' } = req.query;
    format = format.toLowerCase();

    // Build query conditions (reuse logic from list API)
    const conditions = {};

    if (search && search.trim()) {
      conditions.$or = [
        { order_id: { $regex: search.trim(), $options: 'i' } },
        { 'shipping_address.fullName': { $regex: search.trim(), $options: 'i' } },
        { 'shipping_address.email': { $regex: search.trim(), $options: 'i' } },
        { 'shipping_address.phone': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (order_status && order_status.trim()) {
      conditions.order_status = order_status.trim();
    }

    if (payment_status && payment_status.trim()) {
      conditions.payment_status = payment_status.trim();
    }

    const orders = await order_model
      .find(conditions)
      .sort({ created_at: -1 })
      .lean();

    const safeOrders = Array.isArray(orders) ? orders : [];

    if (format === 'pdf') {
      // Generate simple PDF
      const doc = new PDFDocument({ margin: 40 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="orders_export.pdf"'
      );

      doc.pipe(res);

      doc.fontSize(18).text('Orders Export', { align: 'center' });
      doc.moveDown();

      doc.fontSize(10);

      safeOrders.forEach((order, index) => {
        doc
          .font('Helvetica-Bold')
          .text(`Order #${order.order_id || 'N/A'}`, { continued: false });
        doc.font('Helvetica');
        doc.text(
          `Customer: ${order.shipping_address?.fullName || 'N/A'} (${order.shipping_address?.email || 'N/A'})`
        );
        doc.text(`Phone: ${order.shipping_address?.phone || 'N/A'}`);
        doc.text(
          `Total: ₹${(order.total_amount || 0).toLocaleString('en-IN')} | Order Status: ${order.order_status || 'N/A'} | Payment Status: ${order.payment_status || 'N/A'}`
        );
        doc.text(`Date: ${order.created_at ? new Date(order.created_at).toLocaleString('en-IN') : 'N/A'}`);

        if (index < safeOrders.length - 1) {
          doc.moveDown();
          doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor('#e5e7eb').stroke();
          doc.moveDown();
        }
      });

      doc.end();
      return;
    }

    // Default: CSV
    const headers = [
      'Order ID',
      'Customer Name',
      'Email',
      'Phone',
      'Total Amount',
      'Order Status',
      'Payment Status',
      'Created At',
    ];

    const escapeCsv = (value) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const rows = safeOrders.map((order) => [
      escapeCsv(order.order_id || 'N/A'),
      escapeCsv(order.shipping_address?.fullName || 'N/A'),
      escapeCsv(order.shipping_address?.email || 'N/A'),
      escapeCsv(order.shipping_address?.phone || 'N/A'),
      escapeCsv(order.total_amount || 0),
      escapeCsv(order.order_status || 'N/A'),
      escapeCsv(order.payment_status || 'N/A'),
      escapeCsv(
        order.created_at
          ? new Date(order.created_at).toLocaleString('en-IN')
          : 'N/A'
      ),
    ]);

    const csvLines = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ];

    const csvContent = csvLines.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="orders_export.csv"'
    );

    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting orders:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to export orders',
    });
  }
};
/**
 * Export single order as detailed PDF using HTML template
 */
exports.export_order_one = async (req, res) => {
  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({
        status: false,
        message: 'Order ID is required',
      });
    }

    // Aggregation to fetch full order with products
    const pipeline = [
      { $match: { order_id: orderId } },
      {
        $unwind: {
          path: '$products',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'products.category_id',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
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
        },
      },
    ];

    const result = await order_model.aggregate(pipeline);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'Order not found',
      });
    }

    const order = result[0];

    // Load HTML template
    const templatePath = path.join(
      __dirname,
      '../helper/html_templates/order_one.html'
    );
    let template = fs.readFileSync(templatePath, 'utf8');

    const addr = order.shipping_address || {};

    const formatDateTime = (date) =>
      date ? new Date(date).toLocaleString('en-IN') : 'N/A';

    // Build product rows HTML
    const productRowsHtml = (order.products || [])
      .map((p, index) => {
        const name = p.product_name || p.product_details?.name || 'N/A';
        const variant = p.variant_name ? ` (${p.variant_name})` : '';
        const category =
          p.category_details?.name || p.product_details?.category?.name || '';

        return `
          <tr>
            <td>${index + 1}</td>
            <td>
              <div class="prod-name">${name}${variant}</div>
              ${
                category
                  ? `<div class="prod-meta">Category: ${category}</div>`
                  : ''
              }
            </td>
            <td>${p.quantity || 0}</td>
            <td>₹${(p.unit_price || 0).toLocaleString('en-IN')}</td>
            <td>₹${(p.total || 0).toLocaleString('en-IN')}</td>
          </tr>
        `;
      })
      .join('');

    const safe = (val) => (val === null || val === undefined ? '' : String(val));

    // Replace placeholders
    template = template
      .replace(/{{ORDER_ID}}/g, safe(order.order_id))
      .replace(/{{ORDER_DATE}}/g, safe(formatDateTime(order.created_at)))
      .replace(/{{ORDER_STATUS}}/g, safe(order.order_status))
      .replace(/{{PAYMENT_METHOD}}/g, safe(order.payment_method))
      .replace(/{{PAYMENT_STATUS}}/g, safe(order.payment_status))
      .replace(/{{CUSTOMER_NAME}}/g, safe(addr.fullName))
      .replace(/{{CUSTOMER_PHONE}}/g, safe(addr.phone))
      .replace(/{{CUSTOMER_EMAIL}}/g, safe(addr.email))
      .replace(
        /{{CUSTOMER_ADDRESS}}/g,
        safe(
          `${addr.address || ''}${
            addr.landmark ? `, ${addr.landmark}` : ''
          }`.trim()
        )
      )
      .replace(
        /{{CUSTOMER_CITY_STATE_PIN}}/g,
        safe(
          `${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`.trim()
        )
      )
      .replace(
        /{{SUBTOTAL}}/g,
        `₹${(order.sub_total || 0).toLocaleString('en-IN')}`
      )
      .replace(
        /{{SHIPPING}}/g,
        `₹${(order.shipping_amount || 0).toLocaleString('en-IN')}`
      )
      .replace(
        /{{TAX}}/g,
        `₹${(order.total_tax || 0).toLocaleString('en-IN')}`
      )
      .replace(
        /{{TOTAL}}/g,
        `₹${(order.total_amount || 0).toLocaleString('en-IN')}`
      )
      .replace(/{{PRODUCT_ROWS}}/g, productRowsHtml || '');

    const options = {
      format: 'A4',
      border: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    };

    pdf.create(template, options).toStream((err, stream) => {
      if (err) {
        console.error('Error generating order PDF:', err);
        return res.status(500).json({
          status: false,
          message: 'Failed to generate order PDF',
        });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="order_${order.order_id || 'invoice'}.pdf"`
      );

      stream.pipe(res);
    });
  } catch (error) {
    console.error('Error exporting order PDF:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to export order PDF',
    });
  }
};

