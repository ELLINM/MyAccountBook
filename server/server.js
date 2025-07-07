// C:\Users\ellin\Desktop\Project\MyAccountBook\server\server.js

require("dotenv").config();
console.log("Server.js file is being executed.");
console.log("Current working directory:", process.cwd());

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const transactionRoutes = require("./routes/transactionRoutes"); // 거래 내역 라우트 불러오기
const { protect } = require("./middleware/authMiddleware");

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors());

// IMPORTANT: Add express.json() right before your routes that need it
// This ensures that the body parsing happens just before your routes are processed.
app.use(express.json());

// Route setup
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes); // /api/transactions 경로로 들어오는 요청은 transactionRoutes에서 처리

// Protected Test Route (only accessible with a valid JWT) - Keep this for testing
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: `Welcome, ${req.user.email}! This is a protected route.`,
    userId: req.user._id,
  });
});

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
  console.log(`Login user at POST http://localhost:${PORT}/api/auth/login`);
  console.log(
    `Access protected route at GET http://localhost:${PORT}/api/protected`
  );
  console.log(
    `Manage categories at /api/categories (GET, POST, PUT, DELETE) - Requires JWT`
  );
  console.log(
    `Manage transactions at /api/transactions (GET, POST, PUT, DELETE) - Requires JWT`
  );
});
