const bcrypt = require('bcrypt');
const express = require("express");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const Rider = require("../models/Rider"); // Assuming your Rider model is in this path
const cors = require('cors');
const Donation= require('../models/Donations');
const { sendEmail } = require('../utils/emailUtils');
const nodemailer = require('nodemailer');

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
console.log('Rider routes working');

// Secret key for JWT
const secretKey = 'your-secret-key';
const blacklistedTokens = new Set();

// ======================= MIDDLEWARES ===============================
const validateTokenMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Authorization header is missing" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.json({ message: "Invalid token" });
    }

    req.userId = decoded.userId;
    next();
  });
};

// Middleware to check if the token is blacklisted
const isTokenBlacklisted = (req, res, next) => {
  const token = req.headers.authorization;

  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ message: 'Token has been blacklisted' });
  }

  next();
};

// Password generation function
function generateRandomPassword(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// ============= AUTH ROUTES START ==========/


const sendEmailllll = async (email,subject,message) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'syedabdulrab1133@gmail.com', 
      pass: "fdvvmbxqxyfftxit",  
    },
  });

  const mailOptions = {
    from: 'syedabdulrab1133@gmail.com', 
    to: email,
    subject: subject,
    text: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.response);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
};


app.post('/signup-rider/:recipientId', async (req, res) => {
  const recipientId = req.params.recipientId;
  const { username, contact, email, number_plate, starting_time, ending_time } = req.body;
  try {
    // Check if the email is already registered
    Rider.findByIdAndUpdate
    const existingRider = await Rider.findOne({ email });
    if (existingRider) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Generate a random 8-character password
    const password = generateRandomPassword(8);

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Rider with the provided data
    const newRider = new Rider({
      username,
      contact,
      email,
      password: hashedPassword,
      recipient: recipientId, // Assign the recipient's object ID from the URL
      delivered_donations: [],
      number_plate,
      starting_time,
      ending_time
    });

    await newRider.save();
    sendEmailllll(email, `Welcome Fatima Riders, ${username}!`, `Your password is: ${password}, please keep it safe. Happy Riding!`);

    const token = jwt.sign({ userId: newRider._id }, secretKey, { expiresIn: '1h' });

    // Optionally, send the plain password to the rider via email or response
    res.json({ token, password }); // Sending the plain password in the response (not recommended for production)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: 'Internal server error' });
  }
});
// ============= AUTH ROUTES - END ==========/

app.post('/login-rider', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the rider exists in MongoDB
    const rider = await Rider.findOne({ username });

    if (rider && (await bcrypt.compare(password, rider.password))) {
      // Password is correct, generate a JWT token
      const token = jwt.sign({ userId: rider._id }, secretKey, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/logout-rider', validateTokenMiddleware, (req, res) => {
  const token = req.headers.authorization;

  // Add the token to the blacklist
  blacklistedTokens.add(token);

  res.json({ message: 'Logout successful' });
});

app.get(
  "/validate_token_rider",
  validateTokenMiddleware,
  isTokenBlacklisted,
  (req, res) => {
    // If the middleware succeeds, the token is valid & IS NOT BLACKLISTED, and req.userId is available
    res.json({ message: "Token is valid", userId: req.userId });
  }
);

app.get('/assigned-donations/:riderId', async (req, res) => {
  try {
    let { riderId } = req.params;
    riderId = riderId.trim(); // Trim the riderId to remove whitespace

    // Find the rider
    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    // Find the assigned donations
    const assignedDonations = await Donation.find({ assigned_rider: riderId });

    res.json({ rider, assignedDonations });
  } catch (error) {
    console.error('Error fetching assigned donations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// CRUD Routes for Riders (Optional: if needed)
app.post("/riders", async (req, res) => {
  try {
    const riderData = req.body;
    console.log(riderData);
    // Validate riderData
    // const validatedData = validateAndStructureRiderData(riderData);

    const newRider = await Rider.create(riderData);
    res.status(201).json(newRider);
  } catch (error) {
    console.error("Error creating rider:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/riders/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const rider = await Rider.findById(id);
    res.status(200).json(rider);
  } catch (error) {
    console.error("Error fetching rider:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/riders", async (req, res) => {
  try {
    const riders = await Rider.find();
    res.status(200).json(riders);
  } catch (error) {
    console.error("Error fetching riders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/riders/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const riderData = req.body;
    console.log(riderData);
    // Validate riderData
    // const validatedData = validateAndStructureRiderData(riderData);

    const updatedRider = await Rider.findByIdAndUpdate(id, riderData, { new: true });
    res.status(200).json(updatedRider);
  } catch (error) {
    console.error("Error updating rider:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/riders/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await Rider.findByIdAndDelete(id);
    res.status(200).json({ message: "Rider deleted successfully" });
  } catch (error) {
    console.error("Error deleting rider:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = app;
