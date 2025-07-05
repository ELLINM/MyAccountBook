// C:\Users\ellin\Desktop\Project\MyAccountBook\server\controllers\transactionController.js

const Transaction = require("../models/Transaction"); // Import Transaction model
const Category = require("../models/Category"); // Import Category model to validate category

// @desc    Get all transactions for the authenticated user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    // Find transactions belonging to the logged-in user (req.user.id from auth middleware)
    // Populate the 'category' field with actual category details (name, type)
    const transactions = await Transaction.find({ user: req.user.id }).populate(
      "category",
      "name type"
    );
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// @desc    Create a new transaction for the authenticated user
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  const { amount, type, description, date, category } = req.body; // Extract transaction details

  // 1. Basic validation
  if (!amount || !type || !date || !category) {
    return res
      .status(400)
      .json({ message: "Please add amount, type, date, and category" });
  }

  // 2. Validate type
  if (!["income", "expense"].includes(type)) {
    return res
      .status(400)
      .json({ message: 'Type must be either "income" or "expense"' });
  }

  try {
    // 3. Verify if the provided category ID belongs to the authenticated user
    const existingCategory = await Category.findOne({
      _id: category,
      user: req.user.id,
    });

    if (!existingCategory) {
      return res
        .status(400)
        .json({
          message: "Invalid category or category does not belong to user",
        });
    }

    // 4. Create new transaction, linking it to the logged-in user and verified category
    const newTransaction = await Transaction.create({
      user: req.user.id, // Set the user ID from the authenticated request
      category, // Use the provided category ID
      amount,
      type,
      description: description || "", // Use provided description or empty string
      date: new Date(date), // Convert date string to Date object
    });

    // Populate the category details in the response for immediate feedback
    const populatedTransaction = await newTransaction.populate(
      "category",
      "name type"
    );

    res.status(201).json(populatedTransaction); // Respond with the newly created transaction
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// @desc    Update a transaction for the authenticated user
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  const { amount, type, description, date, category } = req.body;

  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Ensure the logged-in user owns this transaction
    if (transaction.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this transaction" });
    }

    // Validate type if provided
    if (type && !["income", "expense"].includes(type)) {
      return res
        .status(400)
        .json({ message: 'Type must be either "income" or "expense"' });
    }

    // Verify if updated category belongs to the authenticated user
    if (category) {
      const existingCategory = await Category.findOne({
        _id: category,
        user: req.user.id,
      });
      if (!existingCategory) {
        return res
          .status(400)
          .json({
            message: "Invalid category or category does not belong to user",
          });
      }
    }

    // Update transaction fields
    transaction.amount = amount || transaction.amount;
    transaction.type = type || transaction.type;
    transaction.description =
      description !== undefined ? description : transaction.description; // Allow clearing description
    transaction.date = date ? new Date(date) : transaction.date;
    transaction.category = category || transaction.category;

    const updatedTransaction = await transaction.save(); // Save the updated transaction
    // Populate category details for the response
    const populatedTransaction = await updatedTransaction.populate(
      "category",
      "name type"
    );

    res.status(200).json(populatedTransaction);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// @desc    Delete a transaction for the authenticated user
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Ensure the logged-in user owns this transaction
    if (transaction.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this transaction" });
    }

    await Transaction.deleteOne({ _id: req.params.id }); // Delete the transaction

    res.status(200).json({ message: "Transaction removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
