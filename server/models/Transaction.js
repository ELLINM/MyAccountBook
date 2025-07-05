// C:\Users\ellin\Desktop\Project\MyAccountBook\server\models\Transaction.js

const mongoose = require("mongoose");

const TransactionSchema = mongoose.Schema(
  {
    user: {
      // User who created this transaction
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Refers to the 'User' model
    },
    category: {
      // Category associated with this transaction
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category", // Refers to the 'Category' model
    },
    amount: {
      type: Number,
      required: [true, "Please add an amount"], // Amount is required
      min: 0, // Amount should be non-negative
    },
    type: {
      // Type of transaction (income or expense)
      type: String,
      enum: ["income", "expense"],
      required: [true, "Please select a type (income/expense)"],
    },
    description: {
      // Description of the transaction
      type: String,
      trim: true,
      default: "", // Default to empty string if not provided
    },
    date: {
      // Date of the transaction
      type: Date,
      required: [true, "Please add a date"], // Date is required
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
