const mongoose = require("mongoose");
let schema = mongoose.Schema
const permissions = [
    "super_admin",
    "admin_create",
    "admin_delete",
    "role_create",
    "role_update",
    "role_delete",
    "category_add",
    "category_update",
    "category_delete",
    "attribute_add",
    "attribute_update",
    "attribute_delete",
    "product_add",
    "product_update",
    "product_delete",
];

const Role = new schema({
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    permissions: {
        type: [String],
        required: true,
        default: [],
        enum: permissions,
    },

});

let role_model = mongoose.model("role", Role);
module.exports = role_model

