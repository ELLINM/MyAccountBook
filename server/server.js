// server/server.js
const express = require("express"); // Import Express for building the server
const connectDB = require("./config/db"); // Import the database connection function
require("dotenv").config(); // Load environment variables

const app = express(); // Initialize Express application

// Connect Database
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route for testing
app.get("/", (req, res) => {
  res.send("API is running..."); // Send a simple response for the root URL
});

const PORT = process.env.PORT || 5000; // Set the port from environment variables or default to 5000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Start the server
