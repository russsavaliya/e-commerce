const mongoose = require('mongoose');
const schema = mongoose.Schema;

/**
 * DraftOrder Model
 * Used to track checkout sessions before Order and Customer creation
 * Deleted after Order is successfully created
 */
const draftOrderSchema = new schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
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
    cart_items: [
        {
            productId: {
                type: mongoose.Types.ObjectId,
                ref: 'product',
                required: true,
            },
            variantId: {
                type: mongoose.Types.ObjectId,
                ref: 'product',
                required: false,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
        },
    ],
    step: {
        type: String,
        enum: ['address', 'payment'],
        default: 'address',
        required: true,
    },
    status: {
        type: String,
        enum: ['in_progress', 'converted'],
        default: 'in_progress',
        required: true,
    },
    // Store calculated amounts for reference
    sub_total: {
        type: Number,
        default: 0,
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
        default: 0,
    },
}, {
    timestamps: true,
});

const draftOrderModel = mongoose.model('draftOrder', draftOrderSchema);
module.exports = draftOrderModel;

