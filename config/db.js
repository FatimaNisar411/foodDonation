const mongoose = require('mongoose');
const connectToMongoDB = async () => {
  const connectWithRetry = async () => {
  try {
  await mongoose.connect("mongodb+srv://syed_abdulrab:syedabdulrab@cluster0.nt7qb.mongodb.net/fatima?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Other options...
  });
  console.log('Connected to MongoDB Atlas');
  } catch (error) {
  console.error('Error connecting to MongoDB:', error.message);
  console.log('Retrying connection in 5 seconds...');
  setTimeout(connectWithRetry, 5000);
  }
  };
  
  // Start the initial connection attempt
  await connectWithRetry();
  };
  
  // connectToMongoDB().then(async () => {
  // // Define a schema for the collection
  // const donorSchema = new mongoose.Schema({
  // name: { type: String, required: true },
  // // Define other fields...
  // });
  
  // // Create a model based on the schema
  // const Donor = mongoose.model('Donor', donorSchema);
  
  // // Create a document (instance) of the Donor model
  // const newDonor = new Donor({ name: 'John Doe' });
  
  // // Save the document to the database
  // await newDonor.save();
  // console.log('New donor created:', newDonor);
  // }).catch((error) => {
  // console.error('Error connecting to MongoDB:', error.message);
  // });
  module.exports = connectToMongoDB