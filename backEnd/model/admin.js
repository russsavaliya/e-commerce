const mongoose = require('mongoose');
let schema = mongoose.Schema
const admin = new schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        required: [true, 'enter a email'],
    },
    password: {
        type: String,
        required: [true, 'enter a password'],
    },
    isSuperAdmin: {
        type: Boolean,
        default: false,
    },
    role: {
        type: mongoose.Types.ObjectId,
        // required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

let admin_model = mongoose.model('admin', admin)

module.exports = admin_model

