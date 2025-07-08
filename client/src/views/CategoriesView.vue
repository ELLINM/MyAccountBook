<template>
  <div class="category-management">
    <h1>Manage Categories</h1>

    <div class="form-container">
      <h2>{{ editingCategory ? "Edit Category" : "Add New Category" }}</h2>
      <form @submit.prevent="handleSubmitCategory">
        <div class="form-group">
          <label for="categoryName">Category Name:</label>
          <input
            id="categoryName"
            v-model="newCategory.name"
            type="text"
            placeholder="Enter category name"
            required
          />
        </div>
        <div class="form-group">
          <label for="categoryType">Category Type:</label>
          <select id="categoryType" v-model="newCategory.type" required>
            <option value="">Select Type</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div class="form-actions">
          <button
            type="submit"
            :disabled="
              categoryStatus === 'loading' ||
              categoryStatus === 'creating' ||
              categoryStatus === 'updating'
            "
          >
            {{ editingCategory ? "Update Category" : "Add Category" }}
          </button>
          <button
            v-if="editingCategory"
            type="button"
            class="cancel-button"
            @click="cancelEdit"
          >
            Cancel
          </button>
        </div>
        <p
          v-if="categoryStatus === 'creating' || categoryStatus === 'updating'"
        >
          {{ editingCategory ? "Updating..." : "Adding..." }}
        </p>
        <p v-if="categoryError" class="error-message">{{ categoryError }}</p>
      </form>
    </div>

    <div class="category-list-container">
      <h2>Your Categories</h2>
      <p v-if="categoryStatus === 'loading'">Loading categories...</p>
      <p v-else-if="allCategories.length === 0 && categoryStatus !== 'error'">
        No categories found. Add one above!
      </p>
      <p v-else-if="categoryStatus === 'error'" class="error-message">
        Error loading categories: {{ categoryError }}
      </p>
      <ul v-else class="category-list">
        <li
          v-for="category in allCategories"
          :key="category._id"
          class="category-item"
        >
          <span class="category-name">{{ category.name }}</span>
          <span :class="['category-type', category.type]">{{
            category.type
          }}</span>
          <div class="category-actions">
            <button
              class="edit-button"
              :disabled="categoryStatus === 'deleting'"
              @click="startEdit(category)"
            >
              Edit
            </button>
            <button
              class="delete-button"
              :disabled="categoryStatus === 'deleting'"
              @click="confirmDelete(category)"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
      <p v-if="categoryStatus === 'deleting'">Deleting category...</p>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from "vuex";

  export default {
    // 여기서 컴포넌트 이름을 "CategoriesView"로 변경합니다.
    name: "CategoriesView",
    data() {
      return {
        newCategory: {
          name: "",
          type: "",
        },
        editingCategory: null, // Stores the category being edited
      };
    },
    computed: {
      ...mapGetters("categories", [
        "allCategories",
        "categoryStatus",
        "categoryError",
      ]),
    },
    methods: {
      ...mapActions("categories", [
        "fetchCategories",
        "addCategory",
        "updateCategory",
        "deleteCategory",
      ]),

      async handleSubmitCategory() {
        if (this.editingCategory) {
          // Update existing category
          try {
            await this.updateCategory({
              id: this.editingCategory._id,
              data: {
                name: this.newCategory.name,
                type: this.newCategory.type,
              },
            });
            alert("Category updated successfully!");
            this.resetForm();
          } catch (error) {
            // Error handled by Vuex, just preventing further action
            console.error("Failed to update category:", error);
          }
        } else {
          // Add new category
          try {
            await this.addCategory(this.newCategory);
            alert("Category added successfully!");
            this.resetForm();
          } catch (error) {
            // Error handled by Vuex, just preventing further action
            console.error("Failed to add category:", error);
          }
        }
      },

      startEdit(category) {
        this.editingCategory = category;
        this.newCategory.name = category.name;
        this.newCategory.type = category.type;
      },

      cancelEdit() {
        this.resetForm();
      },

      async confirmDelete(category) {
        if (
          confirm(
            `Are you sure you want to delete the category "${category.name}"? This cannot be undone.`
          )
        ) {
          try {
            await this.deleteCategory(category._id);
            alert("Category deleted successfully!");
          } catch (error) {
            // Error handled by Vuex, just preventing further action
            console.error("Failed to delete category:", error);
          }
        }
      },

      resetForm() {
        this.newCategory = { name: "", type: "" };
        this.editingCategory = null;
      },
    },
    created() {
      // Fetch categories when the component is created
      this.fetchCategories();
    },
  };
</script>

<style scoped>
  .category-management {
    max-width: 800px;
    margin: 50px auto;
    padding: 25px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-family: "Arial", sans-serif;
  }

  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
    font-size: 2.2em;
  }

  h2 {
    color: #555;
    margin-top: 30px;
    margin-bottom: 20px;
    font-size: 1.6em;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
  }

  .form-container {
    background-color: #f8f8f8;
    padding: 25px;
    border-radius: 8px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-bottom: 30px;
  }

  .form-group {
    margin-bottom: 18px;
    text-align: left;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #333;
  }

  .form-group input[type="text"],
  .form-group select {
    width: calc(100% - 20px); /* Adjust for padding */
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1em;
    box-sizing: border-box; /* Include padding in width */
  }

  .form-group input[type="text"]:focus,
  .form-group select:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
    outline: none;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end; /* Align buttons to the right */
    gap: 10px; /* Space between buttons */
    margin-top: 20px;
  }

  button {
    padding: 12px 25px;
    border: none;
    border-radius: 6px;
    background-color: #007bff;
    color: white;
    font-size: 1em;
    cursor: pointer;
    transition:
      background-color 0.3s ease,
      transform 0.2s ease;
    min-width: 120px;
  }

  button:hover:not(:disabled) {
    background-color: #0056b3;
    transform: translateY(-1px);
  }

  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .cancel-button {
    background-color: #6c757d;
  }

  .cancel-button:hover:not(:disabled) {
    background-color: #5a6268;
  }

  .error-message {
    color: #dc3545;
    margin-top: 15px;
    text-align: center;
    font-weight: bold;
  }

  .category-list-container {
    margin-top: 40px;
    background-color: #fdfdfd;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .category-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
  }

  .category-item:last-child {
    border-bottom: none;
  }

  .category-name {
    font-weight: bold;
    color: #333;
    flex-grow: 1; /* Allows name to take available space */
    text-align: left;
  }

  .category-type {
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.85em;
    font-weight: bold;
    text-transform: capitalize; /* Capitalize 'income'/'expense' */
    min-width: 70px; /* Consistent width for type badge */
    text-align: center;
    margin-left: 15px;
  }

  .category-type.income {
    background-color: #d4edda;
    color: #155724;
  }

  .category-type.expense {
    background-color: #f8d7da;
    color: #721c24;
  }

  .category-actions {
    margin-left: 20px;
    display: flex;
    gap: 8px;
  }

  .edit-button,
  .delete-button {
    padding: 8px 15px;
    font-size: 0.9em;
    border-radius: 4px;
    min-width: unset; /* Override general button min-width */
  }

  .edit-button {
    background-color: #ffc107; /* Yellow for edit */
    color: #333;
  }

  .edit-button:hover:not(:disabled) {
    background-color: #e0a800;
  }

  .delete-button {
    background-color: #dc3545; /* Red for delete */
    color: white;
  }

  .delete-button:hover:not(:disabled) {
    background-color: #c82333;
  }
</style>
