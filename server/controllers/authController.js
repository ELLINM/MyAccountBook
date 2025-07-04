// C:\Users\ellin\Desktop\Project\MyAccountBook\server\controllers\authController.js

const User = require("../models/User"); // Import User model
const bcrypt = require("bcryptjs"); // For password hashing

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { email, password } = req.body; // Extract email and password from request body

  // 1. Check if all fields are entered
  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  // 2. Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  // 3. Hash password
  const salt = await bcrypt.genSalt(10); // Generate a salt
  const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

  // 4. Create and save new user
  const user = await User.create({
    email,
    password: hashedPassword, // Store the hashed password
  });

  // 5. Send response
  if (user) {
    res.status(201).json({
      _id: user._id,
      email: user.email,
      // Token will be generated and sent upon login later
      message: "User registered successfully",
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  // Login logic will be implemented later
  res.send("Login API endpoint - Not yet implemented");
};

module.exports = {
  registerUser,
  loginUser,
};
