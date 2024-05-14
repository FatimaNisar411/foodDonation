const mongoose = require('mongoose');
const connectToMongoDB = require('../config/db');
const DonationsSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    required: true
  },
  donation_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  food_type: { type: String, required: true },
  quantity: { type: Number, required: true },
  expiry_date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'picked_up', 'delivered'], required: true },
  pickup_time: { type: Date, required: true },
  delivery_time: { type: Date, required: true },
});

const Donations = mongoose.model('Donations',DonationsSchema);

// const createDonationCollection = async () => {
//   try {
//     const collectionExists = await connectToMongoDB.db.listCollections({ name: 'donations' }).hasNext();

//     if (!collectionExists) {
//       await connection.db.createCollection('donations');
//       console.log('Donations collection created.');
//     } else {
//       console.log('Donations collection already exists.');
//     }
//   } catch (error) {
//     console.error('Error creating donations collection:', error);
//   }
// };
// createDonationCollection();
module.exports = Donations;
