// routes/studentRoutes.js
const express = require("express");
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
// const app = express.Router();
const studentService = require("../service/studentService");
const Student = require("../models/Student");

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Secret key for JWT
const secretKey = "your-secret-key";
const blacklistedTokens = new Set();

// ======================= MIDDLEWARES ===============================
const validateTokenMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Authorization header is missing" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.userId = decoded.userId;
    next();
  });
};

// Middleware to check if the token is blacklisted
const isTokenBlacklisted = (req, res, next) => {
  const token = req.headers.authorization;

  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ message: "Token has been blacklisted" });
  }

  next();
};

// ============= AUTH ROUTES  START ==========/

app.post("/signup-student", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Student with the hashed password
    const newUser = new Student({ username, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, secretKey, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login-student", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists in MongoDB
    const user = await Student.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Password is correct, generate a JWT token
      const token = jwt.sign({ userId: user._id }, secretKey, {
        expiresIn: "1h",
      });
      res.json({ token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/logout-student", validateTokenMiddleware, (req, res) => {
  const token = req.headers.authorization;

  // Add the token to the blacklist
  blacklistedTokens.add(token);

  res.json({ message: "Logout successful" });
});

app.get(
  "/validate_token_student",
  validateTokenMiddleware,
  isTokenBlacklisted,
  (req, res) => {
    // If the middleware succeeds, the token is valid & IS NOT BLACKLISTED, and req.userId is available
    res.json({ message: "Token is valid", userId: req.userId });
  }
);

// ============= AUTH ROUTES - END ==========/

app.get("/", (req, res) => {
  res.send("Student routes Working");
});

// Route to get a student by ID
app.get("/students/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await studentService.getStudentById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


// Route to create a new student
app.post("/students", async (req, res) => {
  try {
    const studentData = req.body;
    const createdStudent = await studentService.createStudent(studentData);
    res.status(201).json(createdStudent);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/students", async (req, res) => {
  try {
    const allStudents = await studentService.getAllStudents();
    res.json(allStudents);
  } catch (error) {
    console.error("Error fetching all students:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/:email/:password", async (req,res)=>{
  try{
    const email = req.params.email;
    const password = req.params.password;

    const student = await studentService.getStudentByEmailPass(email,password);
    res.json(student);
  } catch(error){
      console.error('Error updating student details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.put("/students/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    const updatedData = req.body;

    // Validate and structure the data as needed

    const updatedStudent = await studentService.updateStudentById(studentId , updatedData);
    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    console.error("Error updating student details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update meal types for a specific day of a student's calendar using ID
app.put('/:id/calendar', async (req, res) => {
  try {
    const { id } = req.params;
    const { day, mealtype } = req.body;

    // Validate input
    if (!day || !mealtype) {
      return res.status(400).json({ error: 'Invalid input. Both day and mealtype are required.' });
    }

    // Call the service function to update the calendar
    const updatedCalendar = await studentService.updateMealTypesById(id, day, mealtype);

    // Respond with the updated calendar
    res.status(200).json(updatedCalendar);
  } catch (error) {
    console.error('Error updating meal types:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = app;