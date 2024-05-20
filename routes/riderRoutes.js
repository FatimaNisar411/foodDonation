const bcrypt = require('bcrypt');
const express = require("express");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const Rider = require("../models/Rider"); // Assuming your Rider model is in this path
const cors = require('cors');
const Donation= require('../models/Donations');
const Donor= require('../models/donor');
const Recipient= require('../models/Recipient');
const { sendEmail } = require('../utils/emailUtils');
const nodemailer = require('nodemailer');
const { validate } = require('../models/Admin');
const mongoose = require('mongoose');

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
  const token = req.headers.authorization.split(' ')[1];

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

const sendEmailllll = async (email, username, password) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'syedabdulrab1133@gmail.com', // Your email address
      pass: 'fdvvmbxqxyfftxit',    // Your email app password
    },
  });

  const mailOptions = {
    from: 'syedabdulrab1133@gmail.com', // Sender address
    to: email,                          // Recipient's email address
    subject: ' ✨ Welcome to Satiate  ✨',
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Welcome to Satiate</h1>
      </div>
      <div style="padding: 20px; background-color: white; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; color: #333;">Hello <strong>${username}</strong>!</p>
        <p style="font-size: 16px; color: #555;">We are thrilled to have you on board. Here are your credentials:</p>
        <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 16px; color: #333;">Username: <strong>${username}</strong></p>
          <p style="font-size: 16px; color: #333;">Password: <strong>${password}</strong></p>
        </div>
        <p style="font-size: 16px; color: #555;">Please keep this information safe and do not share it with anyone.</p>
        <p style="font-size: 16px; color: #555;">If you have any questions or need assistance, feel free to <a href="mailto:support@satiate.com" style="color: #4CAF50; text-decoration: none;">contact us</a>.</p>
        <p style="font-size: 16px; color: #555;">Thank you for joining Satiate! We're excited to have you with us.</p>
        <p style="font-size: 16px; color: #333;">Best Regards,</p>
        <p style="font-size: 16px; color: #333;"><strong>The Satiate Team</strong></p>
      </div>
    </div>
    `, 
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.response);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
};
// const sendEmailllll = async (email,subject,message) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'syedabdulrab1133@gmail.com', 
//       pass: "fdvvmbxqxyfftxit",  
//     },
//   });

//   const mailOptions = {
//     from: 'syedabdulrab1133@gmail.com', 
//     to: email,
//     subject: subject,
//     text: message,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent: ', info.response);
//   } catch (error) {
//     console.error('Error sending email: ', error);
//   }
// };


app.post('/signup-rider/:recipientId', validateTokenMiddleware, async (req, res) => {
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
    sendEmailllll(email, username, password);

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

    if (!rider) {
      console.log('Rider not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Rider found:', rider);
    console.log('Provided password:', password);
    console.log('Stored hashed password:', rider.password);

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, rider.password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Password matches');

    // Password is correct, generate a JWT token
    const token = jwt.sign({ userId: rider._id }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// app.post('/signup-rider/:recipientId', validateTokenMiddleware, async (req, res) => {
//   const recipientId = req.params.recipientId;
//   const { username, contact, email, number_plate, starting_time, ending_time } = req.body;
//   try {
//     // Check if the email is already registered
//     Rider.findByIdAndUpdate
//     const existingRider = await Rider.findOne({ email });
//     if (existingRider) {
//       return res.status(400).json({ message: 'Email is already registered' });
//     }

//     // Generate a random 8-character password
//     const password = generateRandomPassword(8);

//     // Hash the password using bcrypt
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a new Rider with the provided data
//     const newRider = new Rider({
//       username,
//       contact,
//       email,
//       password: hashedPassword,
//       recipient: recipientId, // Assign the recipient's object ID from the URL
//       delivered_donations: [],
//       number_plate,
//       starting_time,
//       ending_time
//     });

//     await newRider.save();
//     sendEmailllll(email, `Welcome , ${username}!`, `Your password is: ${password}, please keep it safe.`);

//     const token = jwt.sign({ userId: newRider._id }, secretKey, { expiresIn: '1h' });

//     // Optionally, send the plain password to the rider via email or response
//     res.json({ token, password }); // Sending the plain password in the response (not recommended for production)
//   } catch (error) {
//     console.error('Error:', error)
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });
// // ============= AUTH ROUTES - END ==========/
// app.post('/login-rider', async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     // Check if the rider exists in MongoDB
//     console.log(`Looking for rider with username: ${username}`);
//     const rider = await Rider.findOne({ username });

//     if (!rider) {
//       console.log('Rider not found');
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     console.log('Rider found:', rider);
//     console.log('Provided password:', password);
//     console.log('Stored hashed password:', rider.password);

//     // Compare the provided password with the hashed password
//     const isMatch = await bcrypt.compare(password, rider.password);
//     if (!isMatch) {
//       console.log('Password does not match');
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     console.log('Password matches');

//     // Password is correct, generate a JWT token
//     const token = jwt.sign({ userId: rider._id }, secretKey, { expiresIn: '1h' });
//     res.json({ token });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });


// app.post('/login-rider', async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     // Check if the rider exists in MongoDB
//     const rider = await Rider.findOne({ username });

//     if (rider && (await bcrypt.compare(password, rider.password))) {
//       // Password is correct, generate a JWT token
//       const token = jwt.sign({ userId: rider._id }, secretKey, { expiresIn: '1h' });
//       res.json({ token });
//     } else {
//       res.status(401).json({ message: 'Invalid credentials' });
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

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
//-------------------Update Status----------------------------------
// app.put('/rider/update-last-delivered-donation-status/:riderId/:status', async (req, res) => {
//   const { status } = req.params;
//   const { riderId } = req.params;

//   try {
//     // Find the rider in the database
//     const rider = await Rider.findById(riderId);
//     if (!rider) {
//       console.log(`Rider with ID ${riderId} not found`);
//       return res.status(404).json({ message: 'Rider not found' });
//     }

//     // Check if the rider has any delivered donations
//     if (rider.delivered_donations && rider.delivered_donations.length > 0) {
//       // Get the last delivered donation
//       const lastDeliveredDonation = rider.delivered_donations[rider.delivered_donations.length - 1];

//       // Update the status of the last delivered donation in the donation collection
//       const donation = await Donation.findById(lastDeliveredDonation.donation_id);
//       if (!donation) {
//         console.log(`Donation with ID ${lastDeliveredDonation.donation_id} not found`);
//         return res.status(404).json({ message: 'Donation not found' });
//       }

//       // Update the status based on the input status
//       if (status === 'pending') {
//         donation.status = 'pending';
//       } else if (status === 'in_progress') {
//         donation.status = 'picked_up';
//         donation.recipient_donation_status = 'in_progress';
//       } else if (status === 'delivered') {
//         donation.status = 'delivered';
//         donation.recipient_donation_status = 'delivered';
//       }
//       await donation.save();
//       console.log(`Updated donation status to: ${donation.status}`);

//       // Update the donation in the donor's array of donations
//       const donor = await Donor.findById(donation.donor);
//       if (!donor) {
//         console.log(`Donor with ID ${donation.donor} not found`);
//         return res.status(404).json({ message: 'Donor not found' });
//       }

//       const donorDonationIndex = donor.donations.findIndex(d => d.donation_id.toString() === donation._id.toString());
//       if (donorDonationIndex !== -1) {
//         donor.donations[donorDonationIndex].status = donation.status;
//         await donor.save();
//         console.log(`Updated donor's donation status`);
//       } else {
//         console.log(`Donation with ID ${donation._id} not found in donor's donations array`);
//         console.log('Donor donations:', donor.donations);
//       }

//       // Check if the recipient field is defined in the donation
//       if (donation.recipient) {
//         // Update the donation in the recipient's array of received donations
//         const recipient = await Recipient.findById(donation.recipient);
//         if (!recipient) {
//           console.log(`Recipient with ID ${donation.recipient} not found`);
//           return res.status(404).json({ message: 'Recipient not found' });
//         }

//         const recipientDonationIndex = recipient.received_donations.findIndex(d => d.donation_id.toString() === donation._id.toString());
//         if (recipientDonationIndex !== -1) {
//           recipient.received_donations[recipientDonationIndex].status = donation.status;
//           recipient.received_donations[recipientDonationIndex].recipient_donation_status = donation.recipient_donation_status;
//           await recipient.save();
//           console.log(`Updated recipient's received donation status`);
//         } else {
//           console.log(`Donation with ID ${donation._id} not found in recipient's received donations array`);
//           console.log('Recipient donations:', recipient.received_donations);
//         }
//       } else {
//         console.log(`Donation recipient is undefined`);
//       }

//       // Update the rider's last delivered donation status
//       lastDeliveredDonation.delivery_status = donation.status === 'picked_up' ? 'in_progress' : donation.status;
//       await rider.save();
//       console.log(`Rider updated successfully`);

//       // Return a success message or the updated rider object
//       return res.status(200).json({ message: 'Status updated successfully', rider });
//     } else {
//       console.log('Rider has no delivered donations');
//       return res.status(400).json({ message: 'Rider has no delivered donations' });
//     }
//   } catch (err) {
//     console.error('Error:', err.message);
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
// });
// New endpoint to fetch recipient location
app.get('/riders/:riderId/recipient/location', async (req, res) => {
  try {
    const { riderId } = req.params;

    // Find the rider
    const rider = await Rider.findById(riderId);
    if (!rider) {
      console.log('Rider not found');
      return res.status(404).json({ message: 'Rider not found' });
    }

    // Find the recipient
    const recipient = await Recipient.findById(rider.recipient);
    if (!recipient) {
      console.log('Recipient not found');
      return res.status(404).json({ message: 'Recipient not found' });
    }

    console.log('Retrieved recipient:', recipient);

    // Return the recipient's location
    console.log('Returning recipient location:', recipient.location.coordinates);
    res.json({ coordinates: recipient.location.coordinates });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});
//-----------donor coordinates for the recipient----------------
app.get('/riders/:riderId/donor/location', async (req, res) => {
  try {
    const { riderId } = req.params;

    // Find the rider
    const rider = await Rider.findById(riderId);
    if (!rider) {
      return res.status(404).json({ message: 'Rider not found' });
    }

    // Check if the rider has any delivered donations
    if (rider.delivered_donations.length > 0) {
      // Get the last added delivered donation
      const lastDeliveredDonation = rider.delivered_donations[rider.delivered_donations.length - 1];

      // Ensure that lastDeliveredDonation.donation_id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(lastDeliveredDonation.donation_id)) {
        return res.status(400).json({ message: 'Invalid donation ID' });
      }

      // Find the corresponding donation
      const donation = await Donation.findById(lastDeliveredDonation.donation_id);
      if (!donation) {
        return res.status(404).json({ message: 'Donation not found' });
      }

      // Find the donor using the donation's donor reference
      const donor = await Donor.findById(donation.donor);
      if (!donor) {
        return res.status(404).json({ message: 'Donor not found for the last delivered donation' });
      }

      // Return the donor's location
      res.json({ coordinates: donor.location.coordinates });
    } else {
      return res.status(404).json({ message: 'Rider has no delivered donations' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.put('/rider/update-last-delivered-donation-status/:riderId/:status', validateTokenMiddleware, async (req, res) => {
  const { status } = req.params;
  const { riderId } = req.params;

  try {
    // Find the rider in the database
    const rider = await Rider.findById(riderId);
    if (!rider) {
      console.log(`Rider with ID ${riderId} not found`);
      return res.status(404).json({ message: 'Rider not found' });
    }

    // Check if the rider has any delivered donations
    if (rider.delivered_donations && rider.delivered_donations.length > 0) {
      // Get the last delivered donation
      const lastDeliveredDonation = rider.delivered_donations[rider.delivered_donations.length - 1];

      // Update the status of the last delivered donation in the donation collection
      const donation = await Donation.findById(lastDeliveredDonation.donation_id);
      if (!donation) {
        console.log(`Donation with ID ${lastDeliveredDonation.donation_id} not found`);
        return res.status(404).json({ message: 'Donation not found' });
      }

      // Update the status based on the input status
      if (status === 'pending') {
        donation.status = 'pending';
        donation.recipient_donation_status = 'pending';
      } else if (status === 'in_progress') {
        donation.status = 'picked_up';
        donation.recipient_donation_status = 'in_progress';
      } else if (status === 'delivered') {
        donation.status = 'delivered';
        donation.recipient_donation_status = 'delivered';
      }

      // Update the recipient's received donation
      if (donation.recipient) {
        const recipient = await Recipient.findById(donation.recipient);
        if (!recipient) {
          console.log(`Recipient with ID ${donation.recipient} not found`);
          return res.status(404).json({ message: 'Recipient not found' });
        }

        const recipientDonationIndex = recipient.received_donations.findIndex(d => d.donation_id.toString() === donation._id.toString());
        if (recipientDonationIndex !== -1) {
          // Update the recipient's received donation status
          if (status === 'in_progress') {
            recipient.received_donations[recipientDonationIndex].delivery_status = 'in_progress';
          } else {
            recipient.received_donations[recipientDonationIndex].delivery_status = status;
          }
          recipient.received_donations[recipientDonationIndex].recipient_donation_status = donation.recipient_donation_status;
          await recipient.save();
          console.log(`Updated recipient's received donation status`);
        } else {
          console.log(`Donation with ID ${donation._id} not found in recipient's received donations array`);
          console.log('Recipient donations:', recipient.received_donations);
        }
      } else {
        console.log(`Donation recipient is undefined`);
      }

      await donation.save();

      // Update the donor's donation status
      const donor = await Donor.findById(donation.donor);
      if (!donor) {
        console.log(`Donor with ID ${donation.donor} not found`);
        return res.status(404).json({ message: 'Donor not found' });
      }

      const donorDonationIndex = donor.donations.findIndex(d => d.donation_id.toString() === donation._id.toString());
      if (donorDonationIndex !== -1) {
        donor.donations[donorDonationIndex].status = donation.status;
        await donor.save();
        console.log(`Updated donor's donation status`);
      } else {
        console.log(`Donation with ID ${donation._id} not found in donor's donations array`);
        console.log('Donor donations:', donor.donations);
      }

      // Update the rider's last delivered donation status
      lastDeliveredDonation.delivery_status = status;
      await rider.save();
      console.log(`Rider updated successfully`);

      // Return a success message or the updated rider object
      return res.status(200).json({ message: 'Status updated successfully', rider });
    } else {
      console.log('Rider has no delivered donations');
      return res.status(400).json({ message: 'Rider has no delivered donations' });
    }
  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ message: 'Internal Server Error' });
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
// ----------------get rider info-------------------
app.get("/riders/:id", validateTokenMiddleware,async (req, res) => {
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
