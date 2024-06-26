const bcrypt = require('bcrypt');
const express = require("express");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const Donor = require("../models/donor");
const cors = require('cors');
const Donation= require('../models/Donations');
const Rider = require('../models/Rider');


const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
console.log('Donor routes working');

// Secret key for JWT
const secretKey = 'your-secret-key';
const blacklistedTokens = new Set();

// ======================= MIDDLEWARES ===============================
const validateTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header is missing" });
  }

  const tokenParts = authHeader.split(' ');
  
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: "Authorization header format is invalid" });
  }

  const token = tokenParts[1];
  
  if (!token) {
    return res.status(401).json({ message: "Authorization header is missing" });
  }

  console.log('Token:', token); // Debug line

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

// ============= AUTH ROUTES START ==========/

// app.post('/signup-donor', async (req, res) => {
//   const { username, type,restaurant_name, contact, address, email, password, location } = req.body;
//    console.log("REQ BODY", req.body);
//   try {
//     // Check if the email is already registered
//     const existingDonor = await Donor.findOne({ email });
//     if (existingDonor) {
//       return res.status(400).json({ message: 'Email is already registered' });
//     }

//     // Hash the password using bcrypt
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a new Donor with the provided data
//     const newDonor = new Donor({
//       // name,
//       username,
//       type,
//       restaurant_name: restaurant_name || '',
//       contact,
//       address,
//       // city,
//       email,
//       password: hashedPassword,
//       location,
//       donations: []
//     });

//     await newDonor.save();

//     const token = jwt.sign({ userId: newDonor._id }, secretKey, { expiresIn: '1h' });
//     res.json({ token });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });
app.post('/signup-donor', async (req, res) => {
  const { username, type, restaurant_name, contact, address, email, password, location } = req.body;
  console.log("REQ BODY", req.body);
  try {
    // Check if the email is already registered
    const existingDonor = await Donor.findOne({ email });
    if (existingDonor) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Donor with the provided data
    const newDonor = new Donor({
      username,
      type,
      restaurant_name: restaurant_name || '',
      contact,
      address,
      email,
      password: hashedPassword,
      location: {
        // type: 'Point',
        coordinates: location
      },
      donations: []
    });

    await newDonor.save();

    const token = jwt.sign({ userId: newDonor._id }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// ============= AUTH ROUTES - END ==========/

app.post('/login-donor', async (req, res) => {
    const {username, password } = req.body;
  
    try {
      // Check if the donor exists in MongoDB
      const donor = await Donor.findOne({ username });
  
      if (donor && (await bcrypt.compare(password, donor.password))) {
        // Password is correct, generate a JWT token
        const token = jwt.sign({ userId: donor._id }, secretKey, { expiresIn: '1h' });
        res.json({ token });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/logout-donor', validateTokenMiddleware, (req, res) => {
    const token = req.headers.authorization;
  
    // Add the token to the blacklist
    blacklistedTokens.add(token);
  
    res.json({ message: 'Logout successful' });
  });
  
  app.get(
    "/validate_token_donor",
    validateTokenMiddleware,
    isTokenBlacklisted,
    (req, res) => {
      // If the middleware succeeds, the token is valid & IS NOT BLACKLISTED, and req.userId is available
      res.json({ message: "Token is valid", userId: req.userId });
    }
  );
  app.post('/add-donation-to-donor/:donorId', async (req, res) => {
    try {
      const { donorId } = req.params; // Extract donorId from the request parameters
      const donor = await Donor.findById(donorId);
  
      if (!donor) {
        return res.status(404).json({ message: 'Donor not found' });
      }
  
      console.log('Donor found:', donor);
  
      const { food_type, quantity, expiry_date, pickup_time } = req.body;
  
      // Generate a unique donation ID
      const donationId = '000000000000111111112222';
  
      // Create a new donation object with the required fields
      const newDonation = {
        food_type,
        quantity,
        expiry_date,
        pickup_time,
        donation_id: donationId
      };
  
      console.log('New donation object:', newDonation);
  
      // Push the new donation object to the donor's donations array
      donor.donations.push(newDonation);
  
      // Save the updated donor object
      await donor.save();
  
      const updatedDonor = await Donor.findById(donorId);
  
      console.log('Updated Donor:', updatedDonor);
      console.log('Donations:', updatedDonor.donations);
  
      res.json({ message: 'Donation added successfully' });
    } catch (error) {
      console.error('Error adding donation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  app.get("/donors", async (req, res) => {
    try {
      const allStudents = await Donor.find().populate('donations');
      res.json(allStudents);
    } catch (error) {
      console.error("Error fetching all students:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  
app.post('/add-donation-to-Donations', async (req, res) => {
  try {
    const userId = '6648553d17337efdebf72d96'; // Replace with a valid user ID
    const donor = await Donor.findById(userId);

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    console.log('Donor found:', donor);

    const { food_type, quantity, expiry_date, pickup_time } = req.body;

    // Generate a unique donation ID
    const donationId = '000000000000111111112222';

    // Create a new donation object
    const newDonation = new Donation({
      donor: userId, // Set the donor field to the user ID
      food_type,
      quantity,
      expiry_date,
      pickup_time,
      
    });

    console.log('New donation object:', newDonation);

    // Save the new donation to the donations collection
    await newDonation.save();
    console.log('Donation saved successfully:', newDonation);

    res.json({ message: 'Donation added successfully' });
  } catch (error) {
    console.error('Error adding donation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ----------------------Combined Functionality---------------------
app.post('/add-donation/:donorId', validateTokenMiddleware , async (req, res) => {
  try {
    const { donorId } = req.params; // Extract donorId from the request parameters
    const donor = await Donor.findById(donorId);

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    console.log('Donor found:', donor);

    const { food_type, quantity, expiry_date, status ,pickup_time,recipient } = req.body;

    // Create a new donation object
    const newDonation = new Donation({
      donor: donorId, // Set the donor field to the donor ID
      food_type,
      quantity,
      expiry_date,
      status,
      pickup_time,
    });

    console.log('New donation object:', newDonation);

    // Save the new donation to the donations collection
    await newDonation.save();
    console.log('Donation saved successfully:', newDonation);

    // Push the new donation object to the donor's donations array
    const newDonationWithId = {
      food_type,
      quantity,
      expiry_date,
      status,
      pickup_time,
      recipient,
      donation_id: newDonation._id // Add the donation ID from the newly created donation
    };

    donor.donations.push(newDonationWithId);

    // Save the updated donor object
    await donor.save();

    const updatedDonor = await Donor.findById(donorId);

    console.log('Updated Donor:', updatedDonor);
    console.log('Donations:', updatedDonor.donations);

    res.json({ message: 'Donation added successfully', newDonation });
  } catch (error) {
    console.error('Error adding donation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Route to get donations of a donor with status pending or pickup
app.get('/donor/:donorId/donations', validateTokenMiddleware , async (req, res) => {
  try {
    const { donorId } = req.params;

    const donations = await Donation.find({ donor: donorId, status: { $in: ['pending', 'picked_up'] } });

    if (!donations.length) {
      return res.status(404).json({ message: 'No donations found with the specified status' });
    }

    res.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get donations of a donor with status completed (history)
app.get('/donor/:donorId/donations/delivered',validateTokenMiddleware , async (req, res) => {
  try {
    const { donorId } = req.params;

    const donations = await Donation.find({ donor: donorId, status: 'delivered' });

    if (!donations.length) {
      return res.status(404).json({ message: 'No completed donations found' });
    }

    res.json(donations);
  } catch (error) {
    console.error('Error fetching completed donations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Endpoint for donor to get rider details
app.get('/donors/:donorId/donations/:donationId/rider', async (req, res) => {
  try {
    const { donorId, donationId } = req.params;
    console.log('Request received:', req.method, req.url);
    console.log('donorId:', donorId);
    console.log('donationId:', donationId);

    // Find the donation
    const donation = await Donation.findById(donationId);
    if (!donation) {
      console.log('Donation not found');
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Find the rider
    const rider = await Rider.findById(donation.rider);
    if (!rider) {
      console.log('Rider not found');
      return res.status(200).json({});
    }

    // Return the rider details
    console.log('Returning rider details:', rider);
    res.json({
      riderName: rider.username,
      riderContact: rider.contact,
      riderEmail: rider.email,
      riderVehicle: rider.number_plate,
      riderStartTime: rider.starting_time,
      riderEndTime: rider.ending_time
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


  // CRUD Routes for Donors
  app.post("/donors", async (req, res) => {
    try {
      const donorData = req.body;
      console.log(donorData);
      // Validate donorData
      // const validatedData = validateAndStructureDonorData(donorData);
  
      const newDonor = await Donor.create(donorData);
      res.status(201).json(newDonor);
    } catch (error) {
      console.error("Error creating donor:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  //-----------------get donor info-------------------
  app.get("/donors/:id", validateTokenMiddleware,  async (req, res) => {
    try {
      const id = req.params.id;
      const donor = await Donor.findById(id);
      res.status(200).json(donor);
    } catch (error) {
      console.error("Error fetching donors:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  // app.get("/donors", async (req, res) => {
  //   try {
  //     const donors = await Donor.find();
  //     res.status(200).json(donors);
  //   } catch (error) {
  //     console.error("Error fetching donors:", error);
  //     res.status(500).json({ error: "Internal Server Error" });
  //   }
  // });
  
  app.put("/donors/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const donorData = req.body;
      console.log(donorData);
      // Validate donorData
      // const validatedData = validateAndStructureDonorData(donorData);
  
      const updatedDonor = await Donor.findByIdAndUpdate(id, donorData, { new: true });
      res.status(200).json(updatedDonor);
    } catch (error) {
      console.error("Error updating donor:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  app.delete("/donors/:id", async (req, res) => {
    try {
      const id = req.params.id;
  
      await Donor.findByIdAndDelete(id);
      res.status(200).json({ message: "Donor deleted successfully" });
    } catch (error) {
      console.error("Error deleting donor:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

module.exports = app;
