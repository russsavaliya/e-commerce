const product_model = require('../../model/product');
const order_model = require('../../model/order');

/**
 * Place order using session cart + shipping details
 */
exports.place_order = async (req, res) => {
  try {
    const cart = req.session.cart || [];
    if (!cart.length) {
      return res.status(400).json({
        status: false,
        message: 'Cart is empty. Add items before placing an order.',
      });
    }

    const {
      fullName,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      landmark,
      payment_method = 'cod',
    } = req.body || {};

    // Basic validation
    if (!fullName || !phone || !email || !address || !city || !state || !pincode) {
      return res.status(400).json({
        status: false,
        message: 'Please provide all required shipping fields.',
      });
    }

    const allowedPaymentMethods = ['cod', 'online'];
    if (!allowedPaymentMethods.includes(payment_method)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid payment method.',
      });
    }

    // Populate cart items with latest product data
    const items = [];
    let subtotal = 0;

    for (const item of cart) {
      const product = await product_model.findById(item.productId).select('name selling_price original_price discount_percentage variants images');
      if (!product) {
        return res.status(404).json({
          status: false,
          message: 'One of the products in your cart is no longer available.',
        });
      }

      let price = product.selling_price;
      let variantName = item.variantName || null;
      let image = product.images?.[0] || null;

      if (item.variantId) {
        const variant = product.variants?.find(v => v._id.toString() === item.variantId);
        if (!variant) {
          return res.status(404).json({
            status: false,
            message: 'A selected variant is no longer available.',
          });
        }
        price = variant.variant_price || price;
        variantName = variant.variant_name || variantName;
        if (variant.variant_image) {
          image = variant.variant_image;
        }
      }

      const lineTotal = price * item.quantity;
      subtotal += lineTotal;

      items.push({
        product_id: item.productId,
        variant_id: item.variantId || null,
        product_name: product.name,
        variant_name: variantName,
        unit_price: price,
        quantity: item.quantity,
        total: lineTotal,
        image,
      });
    }

    const shipping_amount = 0;
    const total_tax = 0;
    const total_amount = subtotal + shipping_amount + total_tax;

    const orderPayload = {
      order_id: `ORD-${Date.now()}`,
      products: items,
      sub_total: subtotal,
      shipping_amount,
      total_tax,
      total_amount,
      payment_method,
      payment_status: payment_method === 'online' ? 'pending' : 'pending',
      shipping_address: {
        fullName,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        landmark,
      },
    };

    const order = await order_model.create(orderPayload);

    // Clear cart after order placement
    req.session.cart = [];

    return res.status(201).json({
      status: true,
      message: 'Order placed successfully',
      data: {
        order_id: order.order_id,
        total_amount: order.total_amount,
        order_status: order.order_status,
        payment_method: order.payment_method,
        created_at: order.created_at,
      },
    });
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Failed to place order',
    });
  }
};

