// client/tests/unit/categoriesService.spec.js

// Import the service using its correct filename and assign it to a consistent variable name.
import categoryService from "@/services/categoryService";
import axios from "axios";

// Declare mockApiInstance.
let mockApiInstance;

// Mock the axios library for the entire test file.
jest.mock("axios", () => {
  const mockAxiosInstance = {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  };

  return {
    create: jest.fn(() => mockAxiosInstance),
    defaults: {
      headers: {
        common: {},
      },
    },
    ...mockAxiosInstance,
  };
});

describe("categoryService", () => {
  // Describe block name also changed for consistency
  beforeAll(() => {
    mockApiInstance = axios.create();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiInstance.post.mockClear();
    mockApiInstance.get.mockClear();
    mockApiInstance.put.mockClear();
    mockApiInstance.delete.mockClear();
    mockApiInstance.defaults.headers.common = {};
  });

  // --- getCategories method tests ---
  it("getCategories should fetch all categories successfully", async () => {
    const mockCategories = [
      { _id: "cat1", name: "Food", type: "expense" },
      { _id: "cat2", name: "Salary", type: "income" },
    ];
    mockApiInstance.get.mockResolvedValueOnce({ data: mockCategories });

    // Use the consistent variable name 'categoryService'
    const result = await categoryService.getCategories();

    expect(mockApiInstance.get).toHaveBeenCalledWith("/categories");
    expect(result).toEqual(mockCategories);
  });

  it("getCategories should throw an error on API call failure", async () => {
    const errorMessage = "Failed to fetch categories";
    const mockError = { response: { data: { message: errorMessage } } };
    mockApiInstance.get.mockRejectedValueOnce(mockError);

    // Use the consistent variable name 'categoryService'
    await expect(categoryService.getCategories()).rejects.toEqual(mockError);
  });

  // --- addCategory method tests ---
  it("addCategory should add a new category successfully", async () => {
    const newCategoryData = { name: "Transport", type: "expense" };
    const returnedCategory = { _id: "cat3", ...newCategoryData };
    mockApiInstance.post.mockResolvedValueOnce({ data: returnedCategory });

    // Use the consistent variable name 'categoryService'
    const result = await categoryService.addCategory(newCategoryData);

    expect(mockApiInstance.post).toHaveBeenCalledWith(
      "/categories",
      newCategoryData
    );
    expect(result).toEqual(returnedCategory);
  });

  it("addCategory should throw an error on API call failure", async () => {
    const errorMessage = "Failed to add category";
    const mockError = { response: { data: { message: errorMessage } } };
    mockApiInstance.post.mockRejectedValueOnce(mockError);

    // Use the consistent variable name 'categoryService'
    await expect(categoryService.addCategory({})).rejects.toEqual(mockError);
  });

  // --- updateCategory method tests ---
  it("updateCategory should update an existing category successfully", async () => {
    const categoryId = "cat1";
    const updatedData = { name: "Updated Food", type: "expense" };
    const returnedUpdatedCategory = { _id: categoryId, ...updatedData };
    mockApiInstance.put.mockResolvedValueOnce({
      data: returnedUpdatedCategory,
    });

    // Use the consistent variable name 'categoryService'
    const result = await categoryService.updateCategory(
      categoryId,
      updatedData
    );

    expect(mockApiInstance.put).toHaveBeenCalledWith(
      `/categories/${categoryId}`,
      updatedData
    );
    expect(result).toEqual(returnedUpdatedCategory);
  });

  it("updateCategory should throw an error on API call failure", async () => {
    const errorMessage = "Failed to update category";
    const mockError = { response: { data: { message: errorMessage } } };
    mockApiInstance.put.mockRejectedValueOnce(mockError);

    // Use the consistent variable name 'categoryService'
    await expect(categoryService.updateCategory("cat1", {})).rejects.toEqual(
      mockError
    );
  });

  // --- deleteCategory method tests ---
  it("deleteCategory should delete a category successfully", async () => {
    const categoryId = "cat1";
    const successMessage = { message: "Category deleted" };
    mockApiInstance.delete.mockResolvedValueOnce({ data: successMessage });

    // Use the consistent variable name 'categoryService'
    const result = await categoryService.deleteCategory(categoryId);

    expect(mockApiInstance.delete).toHaveBeenCalledWith(
      `/categories/${categoryId}`
    );
    expect(result).toEqual(successMessage);
  });

  it("deleteCategory should throw an error on API call failure", async () => {
    const errorMessage = "Failed to delete category";
    const mockError = { response: { data: { message: errorMessage } } };
    mockApiInstance.delete.mockRejectedValueOnce(mockError);

    // Use the consistent variable name 'categoryService'
    await expect(categoryService.deleteCategory("cat1")).rejects.toEqual(
      mockError
    );
  });
});
