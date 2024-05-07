// routes/adminRoutes.js
const bcrypt = require('bcrypt');
const express = require("express");
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const adminService = require("../service/AdminService");
const { validateAndStructureAdminData } = require("../validators/validators");
const Admin = require("../models/Admin");
const cors = require('cors'); // Import the cors package


const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

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

// ============= AUTH ROUTES  START ==========/

app.post('/signup-admin', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Admin with the hashed password
    const newUser = new Admin({ username, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/login-admin', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists in MongoDB
    const user = await Admin.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Password is correct, generate a JWT token
      const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/logout-admin', validateTokenMiddleware, (req, res) => {
  const token = req.headers.authorization;
  
  // Add the token to the blacklist
  blacklistedTokens.add(token);
  
  res.json({ message: 'Logout successful' });
});

app.get(
  "/validate_token_admin",
  validateTokenMiddleware,
  isTokenBlacklisted,
  (req, res) => {
    // If the middleware succeeds, the token is valid & IS NOT BLACKLISTED, and req.userId is available
    res.json({ message: "Token is valid", userId: req.userId });
  }
);

// ============= AUTH ROUTES - END ==========/

app.get("/", (req, res) => {
  res.send("Admin routes Working");
});

app.post("/admins", async (req, res) => {
  try {
    const adminData = req.body;
    console.log(adminData);
    // Validate adminData
    const validatedData = validateAndStructureAdminData(adminData);

    const newAdmin = await adminService.createAdmin(validatedData);
    res.status(201).json(newAdmin);
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/admins/:id", async (req, res) => {
  try {
    const id  = req.params.id;
    const admin = await adminService.getAdminByID(id);
    res.status(200).json(admin);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/admins", async (req, res) => {
  try {
    const admins = await adminService.getAllAdmins();
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/admins/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params;

    // Check if adminId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ error: "Invalid adminId" });
    }

    const deletedAdmin = await adminService.deleteAdminById(adminId);

    if (!deletedAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.status(200).json(deletedAdmin);
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/admins/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedAdmin = await adminService.updateAdminById(id, updatedData);

    if (!updatedAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



///---------------STUDENTS------------------///

// Route to get all students
app.get('/students', async (req, res) => {
  try {
    const allStudents = await adminService.getAllStudents();
    res.status(200).json(allStudents);
  } catch (error) {
    console.error('Error getting all students:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
);

// Route to get students by hostel name

// app.get('/students/:hostelName', async (req, res) => {
//   try {
//     const { hostelName } = req.params;
//     const studentsInHostel = await adminService.getStudentsByHostel(hostelName);

//     res.status(200).json(studentsInHostel);
//   } catch (error) {
//     console.error('Error getting students by hostel name:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

//endpoint to get a single student
app.get('/students/:id', async (req, res) => {
  try {
    const id  = req.params.id;
    console.log(id);
    const student = await adminService.getStudentById(id);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error('Error getting student by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// admin route to create a student
app.post('/students', async (req, res) => {
  try {
    const studentData = req.body;
    
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(studentData.password, 10);
    
    // Replace the plain password with the hashed password
    studentData.password = hashedPassword;

    const createdStudent = await adminService.createStudent(studentData);
    res.status(201).json(createdStudent);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
})

// admin route to delete a student
app.delete('/students/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const deletedStudent = await adminService.deleteStudentById(studentId);

    if (!deletedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.status(200).json({ message: 'Student deleted successfully', deletedStudent });
  } catch (error) {
    console.error('Error deleting student by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to update a student by ID
app.put('/students/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const updatedData = req.body;

    const updatedStudent = await adminService.updateStudentById(studentId, updatedData);

    if (!updatedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.status(200).json({ message: 'Student updated successfully', updatedStudent });
  } catch (error) {
    console.error('Error updating student by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// ------------ Mess Menu -------------------

// Route to get mess menu
app.get('/messmenu', async (req, res) => {
  try {
    const menu = await adminService.getMessMenu();
    res.status(200).json(menu);
  } catch (error) {
    console.error('Error getting mess menu:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get the students with specified Day mess off
app.get('/messOffStudents/:day', async(req,res)=>{
  try {
    const { day } = req.params;
    const messOffStudents = await adminService.getMessOffStdsByDate(day);

    if (!messOffStudents) {
      return res.status(404).json({ error: 'Mess off students not found for the specified day' });
    }

    res.status(200).json(messOffStudents);
  } catch (error) {
    console.error('Error fetching mess off students:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

  // Route to create a mess menu
  app.post('/messmenu', async (req, res) => {
    try {
      const menuData = req.body;
      const createdMenu = await adminService.createMessMenu(menuData);
      res.status(201).json(createdMenu);
      res.send(menuData);
    } catch (error) {
      console.error('Error creating mess menu:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.put('/messmenu/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updatedMenu = req.body;
      const newDay = updatedMenu['day'];
  
      // console.log('Received request with data:', { id, updatedMenu, newDay });
  
      const updatedMenuEntry = await adminService.updateMessMenu(id, updatedMenu, newDay);
  
      if (!updatedMenuEntry) {
        return res.status(404).json({ error: 'Mess menu not found for the specified day' });
      }
  
      res.status(200).json(updatedMenuEntry);
    } catch (error) {
      console.error('Error updating mess menu:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  


module.exports = app;