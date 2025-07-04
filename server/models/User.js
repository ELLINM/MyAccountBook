// C:\Users\ellin\Desktop\Project\MyAccountBook\server\models\User.js

const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please add an email"], // Required field
      unique: true, // Email must be unique
      trim: true, // Remove leading/trailing whitespace
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, // Email format regex validation
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"], // Required field
      minlength: 6, // Minimum 6 characters
      select: false, // Do not return password by default when querying users (security)
    },
    createdAt: {
      type: Date,
      default: Date.now, // Default to current date and time
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("User", UserSchema);
