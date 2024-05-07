const mongoose = require('mongoose');

const connectToMongoDB = require('../config/db');
const recipientSchema = new mongoose.Schema({
  name: { type: String, required: true },
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
  received_donations: [
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
});

recipientSchema.index({ location: '2dsphere' });

const Recipient = mongoose.model('Recipient', recipientSchema);

const createRecipientCollection = async () => {
  try {
    await connectToMongoDB(); // Establish a connection to the MongoDB database
    const connection = mongoose.connection;
    const collectionExists = await connection.db.listCollections({ name: 'recipients' }).hasNext();

    if (!collectionExists) {
      await connection.db.createCollection('recipients');
      console.log('Recipient collection created.');
    } else {
      console.log('Recipient collection already exists.');
    }
  } catch (error) {
    console.error('Error creating recipient collection:', error);
  }
};

createRecipientCollection();

module.exports = Recipient;

