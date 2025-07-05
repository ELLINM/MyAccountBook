// C:\Users\ellin\Desktop\Project\MyAccountBook\server\controllers\categoryController.js

const Category = require("../models/Category"); // Import Category model

// @desc    Get all categories for the authenticated user
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    // Find categories belonging to the logged-in user (req.user.id is set by auth middleware)
    const categories = await Category.find({ user: req.user.id });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// @desc    Create a new category for the authenticated user
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  const { name, type } = req.body; // Extract name and type from request body

  // 1. Basic validation
  if (!name || !type) {
    return res
      .status(400)
      .json({ message: "Please add a name and type for the category" });
  }

  // 2. Check if type is valid
  if (!["income", "expense"].includes(type)) {
    return res
      .status(400)
      .json({ message: 'Type must be either "income" or "expense"' });
  }

  try {
    // 3. Check if category name already exists for this specific user
    // We use req.user.id to ensure uniqueness *per user*, not globally
    const categoryExists = await Category.findOne({ user: req.user.id, name });

    if (categoryExists) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists for you" });
    }

    // 4. Create new category, linking it to the logged-in user
    const newCategory = await Category.create({
      user: req.user.id, // Set the user ID from the authenticated request
      name,
      type,
    });

    res.status(201).json(newCategory); // Respond with the newly created category
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// @desc    Update a category for the authenticated user
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  const { name, type } = req.body;

  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Ensure the logged-in user owns the category
    if (category.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this category" });
    }

    // Check if type is valid if provided
    if (type && !["income", "expense"].includes(type)) {
      return res
        .status(400)
        .json({ message: 'Type must be either "income" or "expense"' });
    }

    // Check for duplicate name if name is being updated
    if (name && name !== category.name) {
      const categoryExists = await Category.findOne({
        user: req.user.id,
        name,
      });
      if (categoryExists) {
        return res
          .status(400)
          .json({ message: "Category with this name already exists for you" });
      }
    }

    // Update category fields
    category.name = name || category.name;
    category.type = type || category.type;

    const updatedCategory = await category.save(); // Save the updated category
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// @desc    Delete a category for the authenticated user
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Ensure the logged-in user owns the category
    if (category.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this category" });
    }

    await Category.deleteOne({ _id: req.params.id }); // Delete the category

    res.status(200).json({ message: "Category removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
