const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    parent_category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        default: null
    }
})
let category_model = mongoose.model("category", categorySchema);
module.exports = category_model;
