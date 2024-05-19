// const mongoose = require('mongoose');
// const connectToMongoDB = require('../config/db');
// const DonationsSchema = new mongoose.Schema({
//   donor: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Donor',
//     required: true
//   },
//   donation_id: { type: mongoose.Schema.Types.ObjectId, required: true },
//   food_type: { type: String, required: true },
//   quantity: { type: Number, required: true },
//   expiry_date: { type: Date, required: true },
//   status: { type: String, enum: ['pending', 'picked_up', 'delivered'], required: true },
//   pickup_time: { type: Date, required: true },
//   delivery_time: { type: Date, required: true },
// });

// const Donations = mongoose.model('Donations',DonationsSchema);


// module.exports = Donations;
const mongoose = require('mongoose');
const connectToMongoDB = require('../config/db');

const DonationsSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true
  },
  food_type: { type: String, required: true },
  quantity: { type: Number, required: true },
  expiry_date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'picked_up', 'delivered'], required: true, default: 'pending' },
  pickup_time: { type: String },  // Changed to String
  delivery_time: { type: String },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipient',
    default: null,  // Default value set to null
    required: false  // Not required
  }, // Changed to String
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    default: null,  // Default value set to null
    required: false  // Not required
  } 
});

const Donations = mongoose.model('Donations', DonationsSchema);

module.exports = Donations;
