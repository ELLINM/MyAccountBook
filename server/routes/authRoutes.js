// C:\Users\ellin\Desktop\Project\MyAccountBook\server\routes\authRoutes.js

const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController"); // Will import functions from the controller

// Register user route
router.post("/register", registerUser);

// Login user route
router.post("/login", loginUser);

module.exports = router;
