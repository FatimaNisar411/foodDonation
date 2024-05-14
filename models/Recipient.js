const mongoose = require('mongoose');

const connectToMongoDB = require('../config/db');
const recipientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  type: { type: String, enum: ['food_bank', 'ngo'], required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  received_donations: {
    type: [
      {
        donation_id: { type: mongoose.Schema.Types.ObjectId, required: true },
        donor_id: { type: mongoose.Schema.Types.ObjectId, required: true },
        food_type: { type: String, required: true },
        quantity: { type: Number, required: true },
        expiry_date: { type: Date, required: true },
        pickup_time: { type: Date, required: true },
        delivery_time: { type: Date, required: true },
        delivery_status: { type: String, enum: ['pending', 'in_progress', 'delivered'], required: true },
      },
    ],
    default: [], // Empty array as default value
  },
});

recipientSchema.index({ location: '2dsphere' });

const Recipient = mongoose.model('Recipient', recipientSchema);


module.exports = Recipient;

