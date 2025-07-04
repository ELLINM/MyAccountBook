// server/config/db.js
const mongoose = require("mongoose"); // Import Mongoose for MongoDB interaction
require("dotenv").config(); // Load environment variables from .env file

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI); // Connect to MongoDB using the URI from environment variables
    console.log(`MongoDB Connected: ${conn.connection.host}`); // Log successful connection host
  } catch (error) {
    console.error(`Error: ${error.message}`); // Log any connection errors
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB; // Export the connectDB function
