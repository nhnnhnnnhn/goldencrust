const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientType: { type: String, enum: ['user', 'guest'], required: true },
  recipient: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: {
    type: String,
    enum: ["message", "order", "system", "custom"],
    required: true
  },
  content: { type: String, required: true },
  link: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema, 'notification');
module.exports = Notification;