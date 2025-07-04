// C:\Users\ellin\Desktop\Project\MyAccountBook\server\controllers\authController.js

const User = require("../models/User"); // Import User model
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For JSON Web Token generation

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { email, password } = req.body; // Extract email and password from request body

  // 1. Check if all fields are entered
  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  // 2. Check if user already exists by email
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  // 3. Hash password
  const salt = await bcrypt.genSalt(10); // Generate a salt for hashing
  const hashedPassword = await bcrypt.hash(password, salt); // Hash the user's password

  // 4. Create and save the new user in the database
  const user = await User.create({
    email,
    password: hashedPassword, // Store the hashed password
  });

  // 5. Send response based on user creation status
  if (user) {
    res.status(201).json({
      _id: user._id, // User ID from database
      email: user.email, // User email
      token: generateToken(user._id), // Generate and send JWT upon successful registration (optional, can be done only on login)
      message: "User registered successfully",
    });
  } else {
    // If user creation failed for some reason
    res.status(400).json({ message: "Invalid user data provided" });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body; // Extract email and password from request body

  // Find user by email in the database, explicitly selecting the password field
  // The .select('+password') is needed because in UserSchema, password has `select: false` for security reasons by default.
  const user = await User.findOne({ email }).select("+password");

  // Check if user exists and provided password matches the hashed password
  if (user && (await bcrypt.compare(password, user.password))) {
    // If user found and password matches, send success response with JWT
    res.json({
      _id: user._id, // User ID
      email: user.email, // User email
      token: generateToken(user._id), // Generate and send JWT
    });
  } else {
    // If user not found or password does not match
    res.status(400).json({ message: "Invalid credentials" }); // Send authentication failure message
  }
};

// Generate JWT (Helper function to create a JSON Web Token)
const generateToken = (id) => {
  // Sign the token with the user ID, JWT secret from environment variables, and an expiration time
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Token expires in 1 hour
  });
};

module.exports = {
  registerUser,
  loginUser,
};
