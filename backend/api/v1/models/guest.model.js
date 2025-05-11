const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  name: String, 
  phone: String,
  email: String,
  visitorId: { type: String, required: true, unique: true, default: function() { return `guest_${Date.now()}`; } },
  linkedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  verifiedPhone: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Guest = mongoose.model('Guest', guestSchema, 'guest');
module.exports = Guest;
