// C:\Users\ellin\Desktop\Project\MyAccountBook\server\middleware\authMiddleware.js

const jwt = require("jsonwebtoken"); // Import jsonwebtoken to verify tokens
const User = require("../models/User"); // Import User model to find user by ID

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check for token in 'Authorization: Bearer <token>' header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token string
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from the decoded token (excluding password for security)
      req.user = await User.findById(decoded.id).select("-password");

      // If user not found, throw an error
      if (!req.user) {
        const error = new Error("Not authorized, user not found");
        res.status(401); // Set status before passing to error handler
        return next(error);
      }

      next(); // Call next middleware/controller
    } catch (error) {
      console.error(error); // Log the error
      const customError = new Error("Not authorized, token failed");
      res.status(401); // Set status before passing to error handler
      return next(customError);
    }
  }
  // Check for token in 'x-auth-token' header (for clients sending custom header)
  else if (req.headers["x-auth-token"]) {
    try {
      token = req.headers["x-auth-token"]; // Get token from x-auth-token header

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from the decoded token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        const error = new Error(
          "Not authorized, user not found (x-auth-token)"
        );
        res.status(401);
        return next(error);
      }

      next(); // Call next middleware/controller
    } catch (error) {
      console.error(error);
      const customError = new Error(
        "Not authorized, token failed (x-auth-token)"
      );
      res.status(401);
      return next(customError);
    }
  }

  // If no token is found in any recognized header, throw an error
  if (!token) {
    const error = new Error("Not authorized, no token");
    res.status(401);
    return next(error);
  }
};

module.exports = { protect };
