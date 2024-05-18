const { ObjectId } = require('mongodb'); // Import ObjectId from mongodb
const bcrypt = require('bcrypt');
const express = require("express");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
// const recipientService = require("../service/RecipientService");
const { validateAndStructureRecipientData } = require("../validators/validators");
const Recipient = require("../models/Recipient");
const Donation= require('../models/Donations');
const Rider= require('../models/Rider');

const cors = require('cors');

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
console.log('Recipient routes working');

// Secret key for JWT
const secretKey = 'your-secret-key';
const blacklistedTokens = new Set();

// ======================= MIDDLEWARES ===============================
const validateTokenMiddleware = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization header is missing" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.log(err);
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

// ============= AUTH ROUTES START ==========/

app.post('/signup-recipient', async (req, res) => {
    const { username , contact, address, email, password, location } = req.body;
     console.log("REW BODY", req.body);
    try {
      // Check if the email is already registered
      const existingRecipient = await Recipient.findOne({ email });
      if (existingRecipient) {
        return res.status(400).json({ message: 'Email is already registered' });
      }
  
      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new Recipient with the provided data
      const newRecipient = new Recipient({
        // name,
        username,
        // type,
        contact,
        address,
        email,
        password: hashedPassword,
        location: {
          // type: 'Point',
          coordinates: location
        },
        received_donations: []
      });
  
      await newRecipient.save();
  
      const token = jwt.sign({ userId: newRecipient._id }, secretKey, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

app.post('/login-recipient', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists in MongoDB
    const recipient = await Recipient.findOne({ username });

    if (recipient && (await bcrypt.compare(password, recipient.password))) {
      // Password is correct, generate a JWT token
      const token = jwt.sign({ userId: recipient._id }, secretKey, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/logout-recipient', validateTokenMiddleware, (req, res) => {
  const token = req.headers.authorization;

  // Add the token to the blacklist
  blacklistedTokens.add(token);

  res.json({ message: 'Logout successful' });
});

app.get(
  "/validate_token_recipient",
  validateTokenMiddleware,
  isTokenBlacklisted,
  (req, res) => {
    // If the middleware succeeds, the token is valid & IS NOT BLACKLISTED, and req.userId is available
    res.json({ message: "Token is valid", userId: req.userId });
  }
);

// ============= AUTH ROUTES - END ==========/

app.post('/assign-rider/:recipientId/:donationId', async (req, res) => {
  try {
    const { recipientId, donationId } = req.params;
    const { riderId } = req.body;

    // Find the recipient
    const recipient = await Recipient.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Find the donation
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Find the rider
    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    // Update the donation's assigned_rider field
    donation.assigned_rider = riderId;
    await donation.save();

    // Add the donation to the recipient's received_donations array
    recipient.received_donations.push({
      donation_id: donation._id,
      donor_id: donation.donor,
      food_type: donation.food_type,
      quantity: donation.quantity,
      expiry_date: donation.expiry_date,
      // pickup_time: donation.pickup_time,
      // delivery_time: donation.delivery_time,
      // delivery_status: donation.delivery_status,
    });
    await recipient.save();

    // Add the donation to the rider's delivered_donations array
    rider.delivered_donations.push({
      donation_id: donation._id,
      delivery_status: 'pending', // initial status
      pickup_time: null,          // set to null initially
      delivery_time: null,        // set to null initially
    });
    await rider.save();

    res.json({ message: 'Rider assigned successfully', donation });
  } catch (error) {
    console.error('Error assigning rider:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// app.post('/assign-rider/:recipientId/:donationId', async (req, res) => {
//   try {
//     const { recipientId, donationId } = req.params;
//     const { riderId } = req.body;

//     // Find the recipient and donation
//     const recipient = await Recipient.findById(recipientId);
//     if (!recipient) {
//       return res.status(404).json({ message: 'Recipient not found' });
//     }

//     const donation = await Donation.findById(donationId);
//     if (!donation) {
//       return res.status(404).json({ message: 'Donation not found' });
//     }

//     // Update the donation's assigned_rider field
//     donation.assigned_rider = riderId;
//     await donation.save();

//     // Add the donation to the recipient's received_donations array
//     recipient.received_donations.push({
//       donation_id: donation._id,
//       donor_id: donation.donor,
//       food_type: donation.food_type,
//       quantity: donation.quantity,
//       expiry_date: donation.expiry_date,
//       // pickup_time: donation.pickup_time,
//       // delivery_time: donation.delivery_time,
//       // delivery_status: donation.delivery_status,
//     });

//     await recipient.save();

//     res.json({ message: 'Rider assigned successfully', donation });
//   } catch (error) {
//     console.error('Error assigning rider:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

app.get("/", (req, res) => {
  // console.log("Recipient routes Working");
  res.send("Recipient routes Working");
});

app.post("/recipients", async (req, res) => {
  try {
    const recipientData = req.body;
    console.log(recipientData);
    // Validate recipientData
    const validatedData = validateAndStructureRecipientData(recipientData);

    const newRecipient = await recipientService.createRecipient(validatedData);
    res.status(201).json(newRecipient);
  } catch (error) {
    console.error("Error creating recipient:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/recipients/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const recipient = await recipientService.getRecipientByID(id);
    res.status(200).json(recipient);
  } catch (error) {
    console.error("Error fetching recipients:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/recipients", validateTokenMiddleware ,async (req, res) => {
  try {
    // const recipients = await recipientService.getAllRecipients();
    const recipients = await Recipient.find();
    res.status(200).json(recipients);
  } catch (error) {
    console.error("Error fetching recipients:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/recipients/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const recipientData = req.body;
    console.log(recipientData);
    // Validate recipientData
    const validatedData = validateAndStructureRecipientData(recipientData);

    const updatedRecipient = await recipientService.updateRecipient(id, validatedData);
    res.status(200).json(updatedRecipient);
  } catch (error) {
    console.error("Error updating recipient:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/recipients/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await recipientService.deleteRecipient(id);
    res.status(200).json({ message: "Recipient deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipient:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = app;