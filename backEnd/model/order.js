const mongoose = require('mongoose');
const schema = mongoose.Schema;

const orderSchema = new schema({
  number_id: {
    type: Number,
    unique: true,
    sparse: true, // Allow null values for existing records
    index: true,
  },
  order_id: {
    type: String,
    required: true,
    unique: true,
  },
  products: [
    {
      product_id: {
        type: mongoose.Types.ObjectId,
        ref: 'product',
        required: true,
      },
      category_id: {
        type: mongoose.Types.ObjectId,
        ref: 'category',
        required: false,
      },
      variant_id: {
        type: mongoose.Types.ObjectId,
        ref: 'product',
        required: false,
      },
      product_name: {
        type: String,
        required: true,
      },
      variant_name: {
        type: String,
      },
      unit_price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      total: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
      },
    },
  ],
  sub_total: {
    type: Number,
    required: true,
  },
  shipping_amount: {
    type: Number,
    default: 0,
  },
  total_tax: {
    type: Number,
    default: 0,
  },
  total_amount: {
    type: Number,
    required: true,
  },
  order_status: {
    type: String,
    enum: ['pending', 'confirmed', 'accepted', 'shipment', 'missing', 'failed', 'cancelled', 'delivered'],
    default: 'pending',
  },
  payment_method: {
    type: String,
    enum: ['cod', 'online'],
    default: 'cod',
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  payment_reference: {
    type: String,
  },
  razorpay_order_id: {
    type: String,
  },
  razorpay_payment_id: {
    type: String,
  },
  paid_at: {
    type: Date,
  },
  shipping_address: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String },
  },
  coupon: {
    coupon_id: {
      type: mongoose.Types.ObjectId,
      ref: 'coupon',
      default: null,
    },
    coupon_code: {
      type: String,
      default: null,
    },
    discount_amount: {
      type: Number,
      default: 0,
    },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const orderModel = mongoose.model('order', orderSchema);
module.exports = orderModel;