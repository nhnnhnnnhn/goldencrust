const express = require("express");
const router = express.Router();
const controller = require("../controllers/delivery.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Get all deliveries
router.get("/get", authMiddleware, controller.getAllDeliveries);

// Get all deliveries by user ID
router.get("/get/user/:userId", authMiddleware, controller.getAllDeliveriesByUserId);

// Get a delivery by ID
router.get("/get/:id", authMiddleware, controller.getDeliveryById);

// Create a new delivery
router.post("/create", authMiddleware, controller.createDelivery);

// Edit a delivery
router.patch("/edit/:id", authMiddleware, controller.editDelivery);

// Update a delivery status
router.patch("/update/:id", authMiddleware, controller.updateDeliveryStatus);

module.exports = router;