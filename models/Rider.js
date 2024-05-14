const mongoose = require('mongoose');
const connectToMongoDB = require('../config/db');
const riderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
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
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipient', required: true },
  
  delivered_donations: {
    type: [
      {
        donation_id: { type: mongoose.Schema.Types.ObjectId, required: true },
        delivery_status: { type: String, enum: ['pending', 'in_progress', 'delivered'], required: true },
        pickup_time: { type: Date, required: true },
        delivery_time: { type: Date, required: true },
      },
    ],
    default: [],
  },
  number_plate: { type: String, required: true },
});

riderSchema.index({ location: '2dsphere' });

const Rider = mongoose.model('Rider', riderSchema);

// const createRiderCollection = async () => {
//   try {
//     const collectionExists = await connectToMongoDB.db.listCollections({ name: 'riders' }).hasNext();

//     if (!collectionExists) {
//       await connection.db.createCollection('riders');
//       console.log('Rider collection created.');
//     }
//   } catch (error) {
//     console.error('Error creating rider collection:', error);
//   }
// };
// createRiderCollection();
module.exports = Rider;
// console.log('Rider model created');