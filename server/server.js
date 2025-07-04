// C:\Users\ellin\Desktop\Project\MyAccountBook\server\server.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes"); // Import auth routes

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// Route setup
app.use("/api/auth", authRoutes); // All requests to /api/auth will be handled by authRoutes

// Basic route (for server status check)
app.get("/", (req, res) => {
  res.send("AccountBook Backend API is running!");
});

// API test route (keeping existing)
app.get("/api/test", (req, res) => {
  res.json({ message: "API test successful!", timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access backend at http://localhost:${PORT}`);
  console.log(`Test API at http://localhost:${PORT}/api/test`);
  console.log(
    `Register user at POST http://localhost:${PORT}/api/auth/register`
  );
});
