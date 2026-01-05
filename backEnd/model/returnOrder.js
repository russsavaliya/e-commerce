const mongoose = require('mongoose');
const schema = mongoose.Schema;

const returnOrderSchema = new schema({
  order_id: {
    type: mongoose.Types.ObjectId,
    ref: 'order',
    required: true,
    index: true,
  },
  products: [
    {
      product_id: {
        type: mongoose.Types.ObjectId,
        ref: 'product',
        required: true,
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
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      unit_price: {
        type: Number,
        required: true,
      },
    },
  ],
  reason: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Return Requested', 'Pickup Scheduled', 'Picked', 'Refunded'],
    default: 'Return Requested',
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Prevent duplicate return requests for the same order
returnOrderSchema.index({ order_id: 1 }, { unique: true });

const returnOrderModel = mongoose.model('returnOrder', returnOrderSchema);
module.exports = returnOrderModel;

