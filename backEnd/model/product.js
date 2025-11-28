const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Product name is required"] },
    SKU: String,
    description: String,
    images: [String],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category"
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'DRAFT'],
        default: 'ACTIVE'
    },
    selling_price: {
        type: Number,
        default: 0
    },
    original_price: {
        type: Number,
        default: 0      //MRP
    },
    discount_percentage: {
        type: Number,
        default: 0
    },
    cost_price: {
        type: Number,   //for profit calculate
        default: 0
    },
    quantity: {
        type: Number,
        default: 0
    },
    attributes: [
        {
            attributeId: { type: mongoose.Schema.Types.ObjectId, ref: 'attributes' },
            attributeValuesIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'attributes' }]   // attributeValuesIds: ["a5277982868628sks", "asa2983868778787"]
        }
    ],
    variants: [{
        variant_name: String,
        variant_SKU: String,
        variant_price: Number,
        variant_image: String,
        variant_attributes: [
            {
                attribute_id: { type: mongoose.Schema.Types.ObjectId, ref: 'attributes' },
                value_id: { type: mongoose.Schema.Types.ObjectId, ref: 'attributes' }
            }
        ],
        quantity: Number,
        status: {
            type: String,
            enum: ['ACTIVE', 'DRAFT'],
            default: 'ACTIVE'
        }
    }],
    is_best_seller: {
        type: Boolean,
        default: false
    },
    is_new: {
        type: Boolean,
        default: false
    },
    is_trending: {
        type: Boolean,
        default: false
    },
    sort_order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Product = mongoose.model("product", productSchema);
module.exports = Product;
