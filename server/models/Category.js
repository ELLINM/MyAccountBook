// C:\Users\ellin\Desktop\Project\MyAccountBook\server\models\Category.js

const mongoose = require("mongoose");

const CategorySchema = mongoose.Schema(
  {
    user: {
      // User who owns this category
      type: mongoose.Schema.Types.ObjectId, // This field will store MongoDB ObjectId
      required: true, // User ID is required
      ref: "User", // Refers to the 'User' model
    },
    name: {
      type: String,
      required: [true, "Please add a category name"], // Category name is required
      unique: true, // Category names should be unique per user (handled in controller)
      trim: true, // Remove whitespace
    },
    type: {
      type: String,
      enum: ["income", "expense"], // Type can only be 'income' or 'expense'
      required: [true, "Please select a type (income/expense)"], // Type is required
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Category", CategorySchema);
