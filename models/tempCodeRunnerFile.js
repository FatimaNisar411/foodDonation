const mongoose = require('mongoose');
const connectToMongoDB = require('../config/db');

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['individual', 'restaurant'], required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
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
  donations: [
    {
      donation_id: { type: mongoose.Schema.Types.ObjectId, required: true },
      food_type: { type: String, required: true },
      quantity: { type: Number, required: true },
      expiry_date: { type: Date, required: true },
      status: { type: String, enum: ['pending', 'picked_up', 'delivered'], required: true },
      pickup_time: { type: Date, required: true },
     
    },
  ],
});
const Donor = mongoose.model('Donor', donorSchema);

const createDonorCollection = async () => {
  try {
    const collectionExists = await connectToMongoDB.db.listCollections({ name: 'donors' }).hasNext();

    if (!collectionExists) {
      await connection.db.createCollection('donors');
      console.log('Donor collection created.');
    } else {
      console.log('Donor collection already exists.');
    }
  } catch (error) {
    console.error('Error creating donor collection:', error);
  }
};
createDonorCollection();
module.exports = Donor;