const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  guest: { type: mongoose.Schema.Types.ObjectId, ref: "Guest", default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  senderType: { type: String, enum: ["guest", "user", "employee"], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  seenByEmployee: { type: Boolean, default: false },
  seenAt: Date
});

const Message = mongoose.model('Message', messageSchema, 'message');
module.exports = Message;