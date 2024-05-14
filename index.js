
const express = require('express');
const connectToMongoDB = require('./config/db');
const Recipient = require('./models/Recipient');
const Donor = require('./models/donor');
const Donations = require('./models/Donations');
const Rider = require('./models/Rider');
const recipientRoutes = require('./routes/recipientRoutes');
const donorRoutes = require('./routes/donorRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = 3000;

// Connect to MongoDB Atlas
connectToMongoDB();

// Middleware
app.use(express.json());

// Include the recipient and admin routes
app.use('/fatima/recipients', recipientRoutes);
app.use('/fatima/donors', donorRoutes);
// app.use('/fatima/admin', adminRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Hi girlieeee');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});