const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
    deliveryStatus: {
        type: String,
        enum: ["preparing", "on the way", "delivered", "cancelled"],
        default: "preparing",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    customerName: {
        type: String,
        required: true,
    },
    items: [{
        menuItemId: String,
        menuItemName: String,
        quantity: Number,
        price: Number,
        discountPercentage: Number,
        total: {
            type: Number,
            default: function() {
                return this.price * this.quantity * (1 - this.discountPercentage / 100);
            },
        },
    }],
    totalAmount: {
        type: Number,
        default: function() {
            return this.items.reduce((total, item) => total + item.total, 0);
        },
    },
    expectedDeliveryTime: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 1000 * 60 * 30);
        },
    },
    notes: {
        type: String,
        default: "",
    },
    deliveryAddress: {
        type: String,
        required: true,
    },
    deliveryPhone: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ["cash on delivery", "online payment"],
        default: "cash on delivery",
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
    }
}, {
    timestamps: true
});

const Delivery = mongoose.model("Delivery", deliverySchema, "deliveries");

module.exports = Delivery;
