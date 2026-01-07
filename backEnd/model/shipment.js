const mongoose = require('mongoose');
const shipmentSchema = new mongoose.Schema({
    number_id: {
      type: Number,
      unique: true,
      sparse: true, // Allow null values for existing records
      index: true,
    },
    order_id: {
      type: mongoose.Types.ObjectId,
      ref: 'order',
      required: true
    },
    shiprocket_order_id: String,
    shipment_id: String,
    awb_code: String,
    courier_name: String,
    courier_id: Number,
    pickup_scheduled: {
      type: Boolean,
      default: false
    },
    shipment_status: {
      type: String,
      enum: [
        'created',
        'pickup_scheduled',
        'picked_up',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'rto',
        'cancelled'
      ],
      default: 'created'
    },
    tracking_url: String,
    weight: Number,
    length: Number,
    breadth: Number,
    height: Number,
    created_at: {
      type: Date,
      default: Date.now
    }
  }, { timestamps: true });
  
  module.exports = mongoose.model('shipment', shipmentSchema);
  