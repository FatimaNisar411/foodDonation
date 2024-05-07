// const express = require('express');
// const bodyParser = require('body-parser');
// const jwt = require('jsonwebtoken');
// const cors = require('cors'); // Import the cors package
// const cron = require('node-cron'); // Import node-cron
// const User = require("./models/User");
// const { default: mongoose } = require('mongoose');

// const app = express();
// const port = 3003;

// // Middleware to parse JSON in requests
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());

// const DB_URL="mongodb+srv://syed_abdulrab:syedabdulrab@cluster0.nt7qb.mongodb.net/cloud_auth_svc?retryWrites=true&w=majority"
// // Connect to MongoDB

// mongoose.connect(DB_URL);

// // Check if the connection was successful
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', () => {
//   console.log('Connected to MongoDB');
// });

// // Schedule the cron job to run every 24 hours
// cron.schedule('43 13 * * *', async () => {
//   try {
//     console.log("ABOUT TO EXECUTE THE CRON JOB LETS GO")
//     // Reset bandwidthQuota and storageQuota for all users to 0
//     await User.updateMany({}, { $set: { bandwidthQuota: 0, storageQuota: 0 } });
//     console.log('Quotas reset for all users.');
//   } catch (error) {
//     console.error('Error resetting quotas:', error);
//   }
// });

// // Secret key for JWT
// const secretKey = 'your-secret-key';
// const blacklistedTokens = new Set();

// // ======================= MIDDLEWARES ===============================
// const validateTokenMiddleware = (req, res, next) => {
//   const token = req.headers.authorization;

//   if (!token) {
//     return res.status(401).json({ message: "Authorization header is missing" });
//   }

//   jwt.verify(token, secretKey, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Invalid token" });
//     }

//     req.userId = decoded.userId;
//     next();
//   });
// };

// // Middleware to check if the token is blacklisted
// const isTokenBlacklisted = (req, res, next) => {
//   const token = req.headers.authorization;

//   if (blacklistedTokens.has(token)) {
//     return res.status(401).json({ message: 'Token has been blacklisted' });
//   }

//   next();
// };

// // ======================= ENDPOINTS ================== //
// // Signup endpoint
// app.post('/signup', async (req, res) => {
//   console.log(req.body);
//   const { username, password } = req.body;

//   try {
//     const newUser = new User({ username, password });
//     await newUser.save();

//     const token = jwt.sign({ userId: newUser._id }, secretKey, { expiresIn: '1h' });
//     res.json({ token });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // Login endpoint
// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     // Check if the user exists in MongoDB
//     const user = await User.findOne({ username });

//     if (user && (user.password == password)) {
//       // Generate a JWT token
//       const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
//       res.json({ token });
//     } else {
//       res.status(401).json({ message: 'Invalid credentials' });
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.post('/logout', validateTokenMiddleware, (req, res) => {
//   const token = req.headers.authorization;
  
//   // Add the token to the blacklist
//   blacklistedTokens.add(token);
  
//   res.json({ message: 'Logout successful' });
// });

// app.post('/updateQuotas/:userId', async (req, res) => {
//   try {

//     console.log("REQ BODY IN AUTH SVC",req.body);
//     const userId = req.params.userId;
//     const { amount, type } = req.body;

//     if (!amount || !type) {
//       return res.status(400).json({ message: 'Invalid request body' });
//     }

//     // Fetch the user by ID
//     const user = await User.findById(userId);
//     console.log(user,userId,amount,type);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Check if the update will exceed quotas
//     if ((user.bandwidthQuota + amount/100000) > 25 || (user.storageQuota + amount/100000) > 10) {
//       console.log("OHO BRO QUOTA EXCEED HOGAYA APKA TOH")
//       return res.status(205).json({ message: 'quota exceeded, chutti karo' });
//     }

//     // Update quotas based on the type (upload or delete)
//     if (type === 'upload') {
//       user.bandwidthQuota += amount/100000;
//       user.storageQuota += amount/100000;
//     } else if (type === 'delete') {
//       user.bandwidthQuota += amount/100000;
//       user.storageQuota -= amount/100000;
//     } else {
//       return res.status(400).json({ message: 'Invalid operation type' });
//     }

//     // Save the updated user
//     await user.save();

//     res.status(200).json({ message: 'User quotas updated successfully' });
//   } catch (error) {
//     console.error('Error updating user quotas:', error);
//     res.status(500).json({ message: 'Internal server error rola parh gaya hai bhai' });
//   }
// });

// app.get('/users', async (req, res) => {
//   try {
//     const users = await User.find({}, { password: 0 }); // Exclude the password field from the response

//     res.status(200).json(users);
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.get(
//   "/validate_token",
//   validateTokenMiddleware,
//   isTokenBlacklisted,
//   (req, res) => {
//     // If the middleware succeeds, the token is valid & IS NOT BLACKLISTED, and req.userId is available
//     res.json({ message: "Token is valid", userId: req.userId });
//   }
// );


// // ===================================== RUN THE SERVER ===================================
// app.listen(port, () => {
//   console.log(`AUTH SERVC Server is running on http://localhost:${port}`);
// });