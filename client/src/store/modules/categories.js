// client/src/store/modules/categories.js
const state = {
  categories: [], // Array to store category objects
  status: "", // 'loading', 'success', 'error'
};

const getters = {
  allCategories: (state) => state.categories,
  categoryStatus: (state) => state.status,
};

const actions = {
  // Action to fetch all categories
  async fetchCategories({ commit }) {
    commit("categories_request");
    try {
      // API call to backend: GET /api/categories
      // const response = await axios.get('/api/categories');
      // commit('categories_success', response.data);

      // Mock data for now
      const mockCategories = [
        { _id: "c1", name: "Food", type: "expense", icon: "🍔" },
        { _id: "c2", name: "Salary", type: "income", icon: "💰" },
        { _id: "c3", name: "Transportation", type: "expense", icon: "🚌" },
      ];
      commit("categories_success", mockCategories);
    } catch (error) {
      commit("categories_error");
    }
  },
  // Action to add a new category
  async addCategory({ commit }, _categoryData) {
    commit("categories_request");
    try {
      // API call to backend: POST /api/categories
      // const response = await axios.post('/api/categories', _categoryData);
      // commit('add_category_success', response.data);
      // For mock: assume success
      commit("categories_success");
    } catch (error) {
      commit("categories_error");
    }
  },
  // Action to update a category
  async updateCategory({ commit }, { id: _id, categoryData: _categoryData }) {
    commit("categories_request");
    try {
      // API call to backend: PUT /api/categories/:id
      // const response = await axios.put(`/api/categories/${_id}`, _categoryData);
      // commit('update_category_success', response.data);
      // For mock: assume success
      commit("categories_success");
    } catch (error) {
      commit("categories_error");
    }
  },
  // Action to delete a category
  async deleteCategory({ commit }, _id) {
    commit("categories_request");
    try {
      // API call to backend: DELETE /api/categories/:id
      // await axios.delete(`/api/categories/${_id}`);
      // commit('delete_category_success', _id);
      // For mock: assume success
      commit("categories_success");
    } catch (error) {
      commit("categories_error");
    }
  },
};

const mutations = {
  categories_request(state) {
    state.status = "loading";
  },
  categories_success(state, categories) {
    state.status = "success";
    if (categories) {
      // Only update if data is provided
      state.categories = categories;
    }
  },
  categories_error(state) {
    state.status = "error";
  },
  // Consider specific mutations for add, update, delete for better reactivity
  // add_category_success(state, newCategory) {
  //   state.categories.push(newCategory);
  // },
  // update_category_success(state, updatedCategory) {
  //   const index = state.categories.findIndex(c => c._id === updatedCategory._id);
  //   if (index !== -1) {
  //     state.categories.splice(index, 1, updatedCategory);
  //   }
  // },
  // delete_category_success(state, id) {
  //   state.categories = state.categories.filter(c => c._id !== id);
  // },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
