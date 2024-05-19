
const express = require('express');
const connectToMongoDB = require('./config/db');
const Recipient = require('./models/Recipient');
const Donor = require('./models/donor');
const Donations = require('./models/Donations');
const Rider = require('./models/Rider');
const recipientRoutes = require('./routes/recipientRoutes');
const donorRoutes = require('./routes/donorRoutes');
const riderRoutes = require('./routes/riderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = 3002;

// Connect to MongoDB Atlas
connectToMongoDB();

// Middleware
app.use(express.json());

// Include the recipient and admin routes
app.use('/fatima/recipients', recipientRoutes);
app.use('/fatima/donors', donorRoutes);
app.use('/fatima/riders', riderRoutes);
// app.use('/fatima/admin', adminRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Hi girlieeee');
});
const jwt = require('jsonwebtoken');

// Sample token
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjQ2NDc2OWY4ZTliYzA1NzA5ODc4ZjciLCJpYXQiOjE3MTU4ODE4ODUsImV4cCI6MTcxNTg4NTQ4NX0.il42fHnGTl3mszeq6CI5Ubr9i225zMfnT84Ko0WZ5OQ';

// Decode the token
const decodedToken = jwt.decode(token);

// Check if the decoded token contains the userId
if (decodedToken && decodedToken.userId) {
  console.log('User ID:', decodedToken.userId);
} else {
  console.log('Token does not contain user ID');
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});