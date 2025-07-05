// C:\Users\ellin\Desktop\Project\MyAccountBook\server\routes\categoryRoutes.js

const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController"); // Will import category controller functions
const { protect } = require("../middleware/authMiddleware"); // Import authentication middleware

// Routes for getting all categories and creating a new category
// Both require authentication using 'protect' middleware
router.route("/").get(protect, getCategories).post(protect, createCategory);

// Routes for updating and deleting a specific category by ID
// Both require authentication using 'protect' middleware
router
  .route("/:id")
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

module.exports = router;
