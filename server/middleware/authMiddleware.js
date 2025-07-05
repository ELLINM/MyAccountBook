// C:\Users\ellin\Desktop\Project\MyAccountBook\server\middleware\authMiddleware.js

const jwt = require("jsonwebtoken"); // Import jsonwebtoken to verify tokens
const User = require("../models/User"); // Import User model to find user by ID

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (e.g., 'Bearer TOKEN_STRING')
      token = req.headers.authorization.split(" ")[1];

      // Verify token using JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from the decoded token (excluding password for security)
      req.user = await User.findById(decoded.id).select("-password");

      // If user not found, throw an error
      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      next(); // Call next middleware/controller
    } catch (error) {
      console.error(error); // Log the error for debugging
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // If no token is provided in the header
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
