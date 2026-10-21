const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    isVeg: {
        type: Boolean,
        default: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    image: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("MenuItem", menuItemSchema);
