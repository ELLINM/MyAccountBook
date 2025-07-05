// C:\Users\ellin\Desktop\Project\MyAccountBook\server\routes\transactionRoutes.js

const express = require("express");
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController"); // Will import transaction controller functions
const { protect } = require("../middleware/authMiddleware"); // Import authentication middleware

// Routes for getting all transactions and creating a new transaction
// Both require authentication using 'protect' middleware
router
  .route("/")
  .get(protect, getTransactions)
  .post(protect, createTransaction);

// Routes for updating and deleting a specific transaction by ID
// Both require authentication using 'protect' middleware
router
  .route("/:id")
  .put(protect, updateTransaction)
  .delete(protect, deleteTransaction);

module.exports = router;
