const express = require('express');
const connectToMongoDB = require('./config/db');
const Recipient = require('./models/Recipient');
const Donor = require('./models/donor');
const Donations = require('./models/Donations');
const Rider = require('./models/Rider');
const adminRoutes = require('./routes/adminRoutes');


const app = express();
const PORT = 3000;

// Connect to MongoDB Atlas
connectToMongoDB();

// Middleware
app.use(express.json());

// Include the student routes
// app.use('/mms/student', studentRoutes);
app.use('/fatima/admin', adminRoutes);

// Routes
app.get('/mms', (req, res) => {
  res.redirect('/');
});
app.get('/', (req, res) => {
  res.send('hi girlieeee');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});