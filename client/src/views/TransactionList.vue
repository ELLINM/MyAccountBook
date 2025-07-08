<template>
  <div class="transaction-list-page">
    <h1>Manage Transactions</h1>

    <div class="form-container">
      <h2>
        {{ editingTransaction ? "Edit Transaction" : "Add New Transaction" }}
      </h2>
      <form @submit.prevent="handleSubmitTransaction">
        <div class="form-group">
          <label for="transactionAmount">Amount:</label>
          <input
            id="transactionAmount"
            v-model.number="newTransaction.amount"
            type="number"
            placeholder="Enter amount"
            required
            min="0"
          />
        </div>
        <div class="form-group">
          <label for="transactionType">Type:</label>
          <select id="transactionType" v-model="newTransaction.type" required>
            <option value="">Select Type</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div class="form-group">
          <label for="transactionCategory">Category:</label>
          <select
            id="transactionCategory"
            v-model="newTransaction.category"
            required
          >
            <option value="">Select Category</option>
            <option
              v-for="cat in filteredCategories"
              :key="cat._id"
              :value="cat._id"
            >
              {{ cat.name }}
            </option>
          </select>
          <p
            v-if="
              allCategories.length === 0 &&
              categoryStatus !== 'loading' &&
              categoryStatus !== 'error'
            "
            class="info-message"
          >
            No categories available. Please add some
            <router-link to="/categories">here</router-link>.
          </p>
        </div>
        <div class="form-group">
          <label for="transactionDate">Date:</label>
          <input
            id="transactionDate"
            v-model="newTransaction.date"
            type="date"
            required
          />
        </div>
        <div class="form-group">
          <label for="transactionDescription">Description (Optional):</label>
          <input
            id="transactionDescription"
            v-model="newTransaction.description"
            type="text"
            placeholder="Enter description"
          />
        </div>
        <div class="form-actions">
          <button
            type="submit"
            :disabled="
              transactionStatus === 'loading' ||
              transactionStatus === 'creating' ||
              transactionStatus === 'updating'
            "
          >
            {{ editingTransaction ? "Update Transaction" : "Add Transaction" }}
          </button>
          <button
            v-if="editingTransaction"
            type="button"
            class="cancel-button"
            @click="cancelEdit"
          >
            Cancel
          </button>
        </div>
        <p
          v-if="
            transactionStatus === 'creating' || transactionStatus === 'updating'
          "
          class="status-message"
        >
          {{
            editingTransaction
              ? "Updating transaction..."
              : "Adding transaction..."
          }}
        </p>
        <p v-if="transactionError" class="error-message">
          {{ transactionError }}
        </p>
      </form>
    </div>

    <div class="transaction-list-container">
      <h2>Your Transactions</h2>
      <p v-if="transactionStatus === 'loading'">Loading transactions...</p>
      <p
        v-else-if="
          allTransactions.length === 0 && transactionStatus !== 'error'
        "
      >
        No transactions found. Add one above!
      </p>
      <p v-else-if="transactionStatus === 'error'" class="error-message">
        Error loading transactions: {{ transactionError }}
      </p>
      <ul v-else class="transaction-list">
        <li
          v-for="transaction in sortedTransactions"
          :key="transaction._id"
          :class="['transaction-item', transaction.type]"
        >
          <span class="transaction-date">{{
            formatDate(transaction.date)
          }}</span>
          <span class="transaction-category">{{
            transaction.category?.name || "Unknown"
          }}</span>
          <span class="transaction-description">{{
            transaction.description || "No description"
          }}</span>
          <span class="transaction-amount">
            {{ transaction.type === "income" ? "+" : "-"
            }}{{ formatCurrency(transaction.amount) }}
          </span>
          <div class="transaction-actions">
            <button
              class="edit-button"
              :disabled="transactionStatus === 'deleting'"
              @click="startEdit(transaction)"
            >
              Edit
            </button>
            <button
              class="delete-button"
              :disabled="transactionStatus === 'deleting'"
              @click="confirmDelete(transaction)"
            >
              Delete
            </button>
          </div>
        </li>
      </ul>
      <p v-if="transactionStatus === 'deleting'" class="status-message">
        Deleting transaction...
      </p>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from "vuex";

  export default {
    name: "TransactionList",
    data() {
      return {
        newTransaction: {
          amount: 0,
          type: "",
          category: "", // Stores category ID
          date: "",
          description: "",
        },
        editingTransaction: null, // Stores the transaction being edited
      };
    },
    computed: {
      ...mapGetters("transactions", [
        "allTransactions",
        "transactionStatus",
        "transactionError",
      ]),
      ...mapGetters("categories", ["allCategories", "categoryStatus"]),

      // Filter categories based on the selected transaction type
      filteredCategories() {
        if (!this.newTransaction.type) {
          return this.allCategories; // Show all if no type selected
        }
        return this.allCategories.filter(
          (cat) => cat.type === this.newTransaction.type
        );
      },
      // Sort transactions by date descending
      sortedTransactions() {
        // Create a shallow copy to avoid modifying the original state array
        return [...this.allTransactions].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
      },
    },
    methods: {
      ...mapActions("transactions", [
        "fetchTransactions",
        "addTransaction",
        "updateTransaction",
        "deleteTransaction",
      ]),
      ...mapActions("categories", ["fetchCategories"]), // Need categories for the dropdown

      async handleSubmitTransaction() {
        // Basic validation that category is selected for the given type
        if (this.newTransaction.type && !this.newTransaction.category) {
          alert("Please select a category for the chosen type.");
          return;
        }

        const payload = {
          amount: this.newTransaction.amount,
          type: this.newTransaction.type,
          category: this.newTransaction.category,
          date: this.newTransaction.date,
          description: this.newTransaction.description,
        };

        try {
          if (this.editingTransaction) {
            await this.updateTransaction({
              id: this.editingTransaction._id,
              transactionData: payload,
            });
            alert("Transaction updated successfully!");
          } else {
            await this.addTransaction(payload);
            alert("Transaction added successfully!");
          }
          this.resetForm();
          this.fetchTransactions(); // Re-fetch to ensure list is up-to-date and sorted
        } catch (error) {
          console.error("Failed to save transaction:", error);
          // Error message is handled by Vuex error state
        }
      },

      startEdit(transaction) {
        this.editingTransaction = transaction;
        // Populate form fields with transaction data
        this.newTransaction = {
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category?._id, // Use category ID for the form
          date: transaction.date
            ? new Date(transaction.date).toISOString().split("T")[0]
            : "", // Format date for input type="date"
          description: transaction.description,
        };
      },

      cancelEdit() {
        this.resetForm();
      },

      async confirmDelete(transaction) {
        if (
          confirm(
            `Are you sure you want to delete this transaction for ${this.formatCurrency(transaction.amount)} on ${this.formatDate(transaction.date)}?`
          )
        ) {
          try {
            await this.deleteTransaction(transaction._id);
            alert("Transaction deleted successfully!");
            // The delete_transaction_success mutation updates the state, no need to re-fetch all
          } catch (error) {
            console.error("Failed to delete transaction:", error);
            // Error message is handled by Vuex error state
          }
        }
      },

      resetForm() {
        this.newTransaction = {
          amount: 0,
          type: "",
          category: "",
          date: "",
          description: "",
        };
        this.editingTransaction = null;
      },
      // Helper to format currency (same as DashboardView)
      formatCurrency(value) {
        return value.toLocaleString("en-US", {
          style: "currency",
          currency: "KRW",
        });
      },
      // Helper to format date (same as DashboardView)
      formatDate(dateString) {
        const options = { year: "numeric", month: "short", day: "numeric" };
        return new Date(dateString).toLocaleDateString("en-US", options);
      },
    },
    watch: {
      // When the transaction type changes, reset the category selection
      "newTransaction.type": function (newType, oldType) {
        if (newType !== oldType) {
          this.newTransaction.category = "";
        }
      },
    },
    created() {
      // Fetch both transactions and categories when the component is created
      this.fetchTransactions();
      this.fetchCategories();
    },
  };
</script>

<style scoped>
  .transaction-list-page {
    max-width: 900px;
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

  .form-group input[type="number"],
  .form-group input[type="date"],
  .form-group input[type="text"],
  .form-group select {
    width: calc(100% - 20px); /* Adjust for padding */
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1em;
    box-sizing: border-box;
  }

  .form-group input:focus,
  .form-group select:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
    outline: none;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
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

  .status-message {
    color: #007bff;
    margin-top: 15px;
    text-align: center;
    font-weight: bold;
  }

  .error-message {
    color: #dc3545;
    margin-top: 15px;
    text-align: center;
    font-weight: bold;
  }

  .info-message {
    color: #007bff;
    font-size: 0.9em;
    margin-top: 5px;
  }

  .info-message a {
    color: #007bff;
    text-decoration: underline;
  }

  .transaction-list-container {
    margin-top: 40px;
    background-color: #fdfdfd;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .transaction-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .transaction-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
    font-size: 0.95em;
  }

  .transaction-item:last-child {
    border-bottom: none;
  }

  .transaction-date {
    flex: 0 0 100px;
    font-weight: bold;
    color: #666;
  }

  .transaction-category {
    flex: 0 0 120px;
    color: #555;
    text-align: left;
  }

  .transaction-description {
    flex-grow: 1;
    color: #444;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0 10px;
    text-align: left;
  }

  .transaction-amount {
    flex: 0 0 120px;
    text-align: right;
    font-weight: bold;
  }

  .transaction-item.income .transaction-amount {
    color: #28a745;
  }

  .transaction-item.expense .transaction-amount {
    color: #dc3545;
  }

  .transaction-actions {
    margin-left: 20px;
    display: flex;
    gap: 8px;
  }

  .edit-button,
  .delete-button {
    padding: 8px 15px;
    font-size: 0.9em;
    border-radius: 4px;
    min-width: unset;
  }

  .edit-button {
    background-color: #ffc107;
    color: #333;
  }

  .edit-button:hover:not(:disabled) {
    background-color: #e0a800;
  }

  .delete-button {
    background-color: #dc3545;
    color: white;
  }

  .delete-button:hover:not(:disabled) {
    background-color: #c82333;
  }
</style>
