// client/tests/unit/categories.spec.js
import categoriesModule from "@/store/modules/categories";
import axios from "axios";

// Mock axios. We don't need a custom instance setup like in services
// because categories.js directly uses the global axios.
jest.mock("axios");

describe("categories Vuex Module", () => {
  let commit;
  let rootGetters;
  let state;

  beforeEach(() => {
    // Reset mocks and state before each test
    jest.clearAllMocks();
    commit = jest.fn(); // Mock commit function
    rootGetters = { "auth/getToken": "mock-jwt-token" }; // Mock rootGetters
    state = { ...categoriesModule.state }; // Create a fresh copy of initial state

    // Mock process.env.VUE_APP_API_URL
    process.env.VUE_APP_API_URL = "http://localhost:5000";
  });

  // --- Getters tests ---
  describe("getters", () => {
    it("allCategories returns categories from state", () => {
      state.categories = [{ id: "1", name: "Food" }];
      const result = categoriesModule.getters.allCategories(state);
      expect(result).toEqual([{ id: "1", name: "Food" }]);
    });

    it("categoryStatus returns status from state", () => {
      state.status = "loading";
      const result = categoriesModule.getters.categoryStatus(state);
      expect(result).toBe("loading");
    });

    it("categoryError returns error from state", () => {
      state.error = "Test error";
      const result = categoriesModule.getters.categoryError(state);
      expect(result).toBe("Test error");
    });
  });

  // --- Mutations tests ---
  describe("mutations", () => {
    it("categories_request sets status to loading and clears error", () => {
      state.status = "success";
      state.error = "Previous error";
      categoriesModule.mutations.categories_request(state);
      expect(state.status).toBe("loading");
      expect(state.error).toBeNull();
    });

    it("categories_success sets status to success and updates categories", () => {
      const mockCategories = [{ id: "1", name: "Food" }];
      categoriesModule.mutations.categories_success(state, mockCategories);
      expect(state.status).toBe("success");
      expect(state.categories).toEqual(mockCategories);
      expect(state.error).toBeNull();
    });

    it("categories_error sets status to error, clears categories and sets error message", () => {
      const errorMessage = "API failed";
      state.categories = [{ id: "1", name: "Food" }];
      categoriesModule.mutations.categories_error(state, errorMessage);
      expect(state.status).toBe("error");
      expect(state.categories).toEqual([]);
      expect(state.error).toBe(errorMessage);
    });

    it("add_category_success adds a new category to the list", () => {
      state.categories = [{ _id: "1", name: "Existing" }];
      const newCategory = { _id: "2", name: "New" };
      categoriesModule.mutations.add_category_success(state, newCategory);
      expect(state.status).toBe("success");
      expect(state.categories).toEqual([
        { _id: "1", name: "Existing" },
        { _id: "2", name: "New" },
      ]);
      expect(state.error).toBeNull();
    });

    it("update_category_success updates an existing category", () => {
      state.categories = [
        { _id: "1", name: "Old" },
        { _id: "2", name: "Other" },
      ];
      const updatedCategory = { _id: "1", name: "Updated" };
      categoriesModule.mutations.update_category_success(
        state,
        updatedCategory
      );
      expect(state.status).toBe("success");
      expect(state.categories).toEqual([
        { _id: "1", name: "Updated" },
        { _id: "2", name: "Other" },
      ]);
      expect(state.error).toBeNull();
    });

    it("update_category_success does nothing if category not found", () => {
      state.categories = [{ _id: "1", name: "Old" }];
      const updatedCategory = { _id: "99", name: "NonExistent" };
      categoriesModule.mutations.update_category_success(
        state,
        updatedCategory
      );
      expect(state.status).toBe("success");
      expect(state.categories).toEqual([{ _id: "1", name: "Old" }]); // Should remain unchanged
      expect(state.error).toBeNull();
    });

    it("delete_category_success removes a category from the list", () => {
      state.categories = [
        { _id: "1", name: "To Delete" },
        { _id: "2", name: "Keep" },
      ];
      categoriesModule.mutations.delete_category_success(state, "1");
      expect(state.status).toBe("success");
      expect(state.categories).toEqual([{ _id: "2", name: "Keep" }]);
      expect(state.error).toBeNull();
    });
  });

  // --- Actions tests ---
  describe("actions", () => {
    // fetchCategories
    it("fetchCategories commits success and returns data on success", async () => {
      const mockCategories = [{ _id: "1", name: "Food" }];
      axios.get.mockResolvedValueOnce({ data: mockCategories });

      await categoriesModule.actions.fetchCategories({ commit, rootGetters });

      expect(commit).toHaveBeenCalledWith("categories_request");
      expect(axios.get).toHaveBeenCalledWith(
        `${process.env.VUE_APP_API_URL}/categories`,
        { headers: { Authorization: "Bearer mock-jwt-token" } }
      );
      expect(commit).toHaveBeenCalledWith("categories_success", mockCategories);
    });

    it("fetchCategories commits error and throws on failure", async () => {
      const errorMessage = "API fetch failed";
      const mockError = { response: { data: { message: errorMessage } } };
      axios.get.mockRejectedValueOnce(mockError);

      await expect(
        categoriesModule.actions.fetchCategories({ commit, rootGetters })
      ).rejects.toBe(errorMessage);

      expect(commit).toHaveBeenCalledWith("categories_request");
      expect(axios.get).toHaveBeenCalledWith(
        `${process.env.VUE_APP_API_URL}/categories`,
        { headers: { Authorization: "Bearer mock-jwt-token" } }
      );
      expect(commit).toHaveBeenCalledWith("categories_error", errorMessage);
    });

    // addCategory
    it("addCategory commits success and returns new category on success", async () => {
      const newCategoryData = { name: "New Category" };
      const returnedCategory = { _id: "newId", ...newCategoryData };
      axios.post.mockResolvedValueOnce({ data: returnedCategory });

      const result = await categoriesModule.actions.addCategory(
        { commit, rootGetters },
        newCategoryData
      );

      expect(commit).toHaveBeenCalledWith("categories_request");
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.VUE_APP_API_URL}/categories`,
        newCategoryData,
        { headers: { Authorization: "Bearer mock-jwt-token" } }
      );
      expect(commit).toHaveBeenCalledWith(
        "add_category_success",
        returnedCategory
      );
      expect(result).toEqual(returnedCategory);
    });

    it("addCategory commits error and throws on failure", async () => {
      const errorMessage = "Add category failed";
      const mockError = { response: { data: { message: errorMessage } } };
      axios.post.mockRejectedValueOnce(mockError);

      await expect(
        categoriesModule.actions.addCategory({ commit, rootGetters }, {})
      ).rejects.toBe(errorMessage);

      expect(commit).toHaveBeenCalledWith("categories_request");
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.VUE_APP_API_URL}/categories`,
        {},
        { headers: { Authorization: "Bearer mock-jwt-token" } }
      );
      expect(commit).toHaveBeenCalledWith("categories_error", errorMessage);
    });

    // updateCategory
    it("updateCategory commits success and returns updated category on success", async () => {
      const categoryId = "updateId";
      const updatedData = { name: "Updated Category" };
      const returnedCategory = { _id: categoryId, ...updatedData };
      axios.put.mockResolvedValueOnce({ data: returnedCategory });

      const result = await categoriesModule.actions.updateCategory(
        { commit, rootGetters },
        { id: categoryId, categoryData: updatedData }
      );

      expect(commit).toHaveBeenCalledWith("categories_request");
      expect(axios.put).toHaveBeenCalledWith(
        `${process.env.VUE_APP_API_URL}/categories/${categoryId}`,
        updatedData,
        { headers: { Authorization: "Bearer mock-jwt-token" } }
      );
      expect(commit).toHaveBeenCalledWith(
        "update_category_success",
        returnedCategory
      );
      expect(result).toEqual(returnedCategory);
    });

    it("updateCategory commits error and throws on failure", async () => {
      const errorMessage = "Update category failed";
      const mockError = { response: { data: { message: errorMessage } } };
      axios.put.mockRejectedValueOnce(mockError);

      await expect(
        categoriesModule.actions.updateCategory(
          { commit, rootGetters },
          { id: "someId", categoryData: {} }
        )
      ).rejects.toBe(errorMessage);

      expect(commit).toHaveBeenCalledWith("categories_request");
      expect(axios.put).toHaveBeenCalledWith(
        `${process.env.VUE_APP_API_URL}/categories/someId`,
        {},
        { headers: { Authorization: "Bearer mock-jwt-token" } }
      );
      expect(commit).toHaveBeenCalledWith("categories_error", errorMessage);
    });

    // deleteCategory
    it("deleteCategory commits success and returns deleted id on success", async () => {
      const categoryId = "deleteId";
      axios.delete.mockResolvedValueOnce({}); // delete usually returns empty object or status

      const result = await categoriesModule.actions.deleteCategory(
        { commit, rootGetters },
        categoryId
      );

      expect(commit).toHaveBeenCalledWith("categories_request");
      expect(axios.delete).toHaveBeenCalledWith(
        `${process.env.VUE_APP_API_URL}/categories/${categoryId}`,
        { headers: { Authorization: "Bearer mock-jwt-token" } }
      );
      expect(commit).toHaveBeenCalledWith(
        "delete_category_success",
        categoryId
      );
      expect(result).toBe(categoryId);
    });

    it("deleteCategory commits error and throws on failure", async () => {
      const errorMessage = "Delete category failed";
      const mockError = { response: { data: { message: errorMessage } } };
      axios.delete.mockRejectedValueOnce(mockError);

      await expect(
        categoriesModule.actions.deleteCategory(
          { commit, rootGetters },
          "someId"
        )
      ).rejects.toBe(errorMessage);

      expect(commit).toHaveBeenCalledWith("categories_request");
      expect(axios.delete).toHaveBeenCalledWith(
        `${process.env.VUE_APP_API_URL}/categories/someId`,
        { headers: { Authorization: "Bearer mock-jwt-token" } }
      );
      expect(commit).toHaveBeenCalledWith("categories_error", errorMessage);
    });
  });
});
