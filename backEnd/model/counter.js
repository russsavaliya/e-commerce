const mongoose = require('mongoose');
const schema = mongoose.Schema;

/**
 * Counter/Sequence Model
 * Used for auto-incrementing numeric IDs for admin display purposes
 * Each model type has its own counter (order, shipment, returnOrder)
 */
const counterSchema = new schema({
    _id: {
        type: String,
        required: true,
        unique: true,
    },
    sequence_value: {
        type: Number,
        required: true,
        default: 0,
    },
}, {
    timestamps: true,
});

const counterModel = mongoose.model('counter', counterSchema);
module.exports = counterModel;

