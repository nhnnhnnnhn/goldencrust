const Delivery = require("../models/delivery.model");
const User = require("../models/user.model");
const controllerHandler = require("../../../helpers/controllerHandler");

// Get all deliveries
module.exports.getAllDeliveries = controllerHandler(async (req, res) => {
    try {
        const deliveries = await Delivery.find();
        res.status(200).json(deliveries);
    } catch (error) {
        res.status(500).json({ message: "Error fetching deliveries", error });
    }
});

// Get all deliveries by user ID
module.exports.getAllDeliveriesByUserId = controllerHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const deliveries = await Delivery.find({ userId: user._id });
        res.status(200).json(deliveries);
    } catch (error) {
        res.status(500).json({ message: "Error fetching deliveries", error });
    }
});

// Get a delivery by ID
module.exports.getDeliveryById = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const delivery = await Delivery.findById(id);
        res.status(200).json(delivery);
    } catch (error) {
        res.status(500).json({ message: "Error fetching delivery", error });
    }
});

// Create a new delivery
module.exports.createDelivery = controllerHandler(async (req, res) => {
    try {
        let { userId, customerName, items, expectedDeliveryTime, notes, deliveryAddress, deliveryPhone, paymentMethod, paymentStatus } = req.body;
        const user = await User.findById(userId);
        if (!deliveryAddress && user) {
            deliveryAddress = user.address;
        }
        if (!deliveryPhone && user) {
            deliveryPhone = user.phone;
        }
        if (!customerName && user) {
            customerName = user.fullName;
        }
        else if ((!deliveryAddress || !deliveryPhone) && !user) {
            return res.status(400).json({ message: "Delivery address and phone are required" });
        }
        if (!items) {
            return res.status(400).json({ message: "Items are required" });
        }
        if (paymentMethod && paymentMethod !== "cash on delivery" && paymentMethod !== "online payment") {
            return res.status(400).json({ message: "Invalid payment method" });
        }
        if (paymentStatus && paymentStatus !== "pending" && paymentStatus !== "paid" && paymentStatus !== "failed") {
            return res.status(400).json({ message: "Invalid payment status" });
        }
        if (expectedDeliveryTime && expectedDeliveryTime < Date.now()) {
            return res.status(400).json({ message: "Expected delivery time cannot be in the past" });
        }
        if (!expectedDeliveryTime) {
            expectedDeliveryTime = new Date(Date.now() + 1000 * 60 * 30);
        }
        const delivery = await Delivery.create({ userId, customerName, items, expectedDeliveryTime, notes, deliveryAddress, deliveryPhone, paymentMethod, paymentStatus });
        res.status(201).json(delivery);
    } catch (error) {
        res.status(500).json({ message: "Error creating delivery", error });
    }
});

// Edit a delivery
module.exports.editDelivery = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { notes, deliveryAddress, deliveryPhone } = req.body;
        const existingDelivery = await Delivery.findById(id);
        if (!existingDelivery) {
            return res.status(404).json({ message: "Delivery not found" });
        }
        if (!deliveryAddress && !deliveryPhone) {
            return res.status(400).json({ message: "Delivery address and phone are required" });
        }
        if (existingDelivery.deliveryStatus !== "preparing" || existingDelivery.createdAt < Date.now() - 1000 * 60 * 30) {
            return res.status(400).json({ message: "Cannot edit delivery after it has been prepared or more than 30 minutes have passed" });
        }
        const delivery = await Delivery.findByIdAndUpdate(id, { notes, deliveryAddress, deliveryPhone }, { new: true });
        res.status(200).json(delivery);
    } catch (error) {
        res.status(500).json({ message: "Error updating delivery status", error });
    }
});

// Update a delivery status
module.exports.updateDeliveryStatus = controllerHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { deliveryStatus } = req.body;
        const delivery = await Delivery.findByIdAndUpdate(id, { deliveryStatus }, { new: true });
        res.status(200).json({ message: "Delivery status updated successfully", delivery });
    } catch (error) {
        res.status(500).json({ message: "Error updating delivery status", error });
    }
});