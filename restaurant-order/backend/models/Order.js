const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    customerName: {
        type: String,
        default: ""
    },
    tableNumber: {
        type: Number,
        required: true
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    gst: {
        type: Number,
        required: true
    },
    grandTotal: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["Placed", "Preparing", "Served", "Paid", "Cancelled"],
        default: "Placed"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);
