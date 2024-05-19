const mongoose = require('mongoose');
const connectToMongoDB = require('../config/db');

const donorSchema = new mongoose.Schema({
  // name: { type: String, required: true },
  username: { type: String, required: true },
  type: { type: String, enum: ['Individual', 'Restaurant'], required: true },
  restaurant_name: { type: String, required: false,default: '' },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  // city: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
location: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: function(value) {
        return Array.isArray(value) && value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number';
      },
      message: 'Location must be an array of two numbers [longitude, latitude].'
    }
  }
},
  donations: {
    type: [
      {
        donation_id: { type: mongoose.Schema.Types.ObjectId, required: true },
        food_type: { type: String, required: true },
        quantity: { type: Number, required: true },
        expiry_date: { type: String, required: true }, // Changed to String
        status: { type: String, enum: ['pending', 'picked_up', 'delivered'], default: 'pending' }, // Default set to 'pending'
        pickup_time: { type: String },
        recipient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Recipient',
          default: null,  // Default value set to null
          required: false  // Not required
        }
      },
    ],
    default: [],
  },
});
const Donor = mongoose.model('Donor', donorSchema);

module.exports = Donor;
// const mongoose = require('mongoose');

// const donorSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   type: { type: String, required: true },
//   restaurant_name: { type: String, default: '' },
//   contact: { type: String, required: true },
//   address: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   location: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       default: 'Point'
//     },
//     coordinates: {
//       type: [Number],
//       required: true,
//       validate: {
//         validator: function(value) {
//           return Array.isArray(value) && value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number';
//         },
//         message: 'Location must be an array of two numbers [longitude, latitude].'
//       }
//     }
//   },
//   donations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donation' }]
// });

// donorSchema.index({ location: '2dsphere' }); // Create a geospatial index

// const Donor = mongoose.model('Donor', donorSchema);

// module.exports = Donor;
