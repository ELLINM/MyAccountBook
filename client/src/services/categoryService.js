// client/src/services/categoriesService.js
import axios from "axios";

// Create an Axios instance for the categories API.
// Use a relative path '/api/categories' to leverage the proxy configured in vue.config.js.
const api = axios.create({
  baseURL: "/api", // Base path for the backend categories API, relative to the proxy
});

const categoriesService = {
  /**
   * Fetches all categories from the backend.
   * This will be proxied from `/api/categories/` to `http://localhost:5000/api/categories/`.
   * @returns {Promise<Array>} A promise that resolves with an array of category objects.
   */
  async getCategories() {
    const response = await api.get("/categories");
    return response.data;
  },

  /**
   * Adds a new category.
   * This will be proxied from `/api/categories/` to `http://localhost:5000/api/categories/`.
   * @param {object} categoryData - The category data to add.
   * @returns {Promise<object>} A promise that resolves with the created category object.
   */
  async addCategory(categoryData) {
    const response = await api.post("/categories", categoryData);
    return response.data;
  },

  /**
   * Updates an existing category.
   * This will be proxied from `/api/categories/:id` to `http://localhost:5000/api/categories/:id`.
   * @param {string} id - The ID of the category to update.
   * @param {object} categoryData - The updated category data.
   * @returns {Promise<object>} A promise that resolves with the updated category object.
   */
  async updateCategory(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  /**
   * Deletes a category.
   * This will be proxied from `/api/categories/:id` to `http://localhost:5000/api/categories/:id`.
   * @param {string} id - The ID of the category to delete.
   * @returns {Promise<object>} A promise that resolves with a confirmation message.
   */
  async deleteCategory(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoriesService;
