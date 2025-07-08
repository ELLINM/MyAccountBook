<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p>Hello, {{ currentUser?.email }}!</p>
    <p>Welcome. This page is accessible only after logging in.</p>

    <div class="summary-cards">
      <div class="summary-card income-card">
        <h3>Total Income</h3>
        <p>{{ formattedTotalIncome }}</p>
      </div>
      <div class="summary-card expense-card">
        <h3>Total Expense</h3>
        <p>{{ formattedTotalExpense }}</p>
      </div>
      <div class="summary-card balance-card">
        <h3>Net Balance</h3>
        <p>{{ formattedNetBalance }}</p>
      </div>
    </div>

    <div class="recent-transactions">
      <h2>Recent Transactions</h2>
      <p v-if="transactionStatus === 'loading'">Loading transactions...</p>
      <p v-else-if="transactionStatus === 'error'">
        Error loading transactions: {{ transactionError }}
      </p>
      <p v-else-if="allTransactions.length === 0">No transactions found.</p>
      <ul v-else class="transaction-list">
        <li
          v-for="transaction in recentTransactions"
          :key="transaction._id"
          :class="['transaction-item', transaction.type]"
        >
          <span class="transaction-date">{{
            formatDate(transaction.date)
          }}</span>
          <span class="transaction-category">{{
            transaction.category?.name || "N/A"
          }}</span>
          <span class="transaction-description">{{
            transaction.description || "No description"
          }}</span>
          <span class="transaction-amount"
            >{{ transaction.type === "income" ? "+" : "-" }}
            {{ formatCurrency(transaction.amount) }}</span
          >
        </li>
      </ul>
      <router-link to="/transactions" class="dashboard-link view-all-link"
        >View All Transactions</router-link
      >
    </div>

    <div class="dashboard-links">
      <router-link to="/categories" class="dashboard-link"
        >Manage Categories</router-link
      >
      <router-link to="/transactions" class="dashboard-link"
        >Manage Transactions</router-link
      >
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from "vuex";

  export default {
    name: "DashboardView",
    computed: {
      ...mapGetters("auth", ["currentUser"]),
      ...mapGetters("transactions", [
        "allTransactions",
        "transactionStatus",
        "transactionError",
      ]),

      // Calculate total income from all transactions
      totalIncome() {
        return this.allTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);
      },
      // Calculate total expense from all transactions
      totalExpense() {
        return this.allTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);
      },
      // Calculate net balance
      netBalance() {
        return this.totalIncome - this.totalExpense;
      },
      // Format total income for display
      formattedTotalIncome() {
        return this.formatCurrency(this.totalIncome);
      },
      // Format total expense for display
      formattedTotalExpense() {
        return this.formatCurrency(this.totalExpense);
      },
      // Format net balance for display
      formattedNetBalance() {
        // Apply different color based on balance (optional, can be done with class binding)
        return this.formatCurrency(this.netBalance);
      },
      // Get only the most recent 5 transactions
      recentTransactions() {
        // Sort by date in descending order and take the first 5
        return [...this.allTransactions]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
      },
    },
    methods: {
      ...mapActions("transactions", ["fetchTransactions"]),

      // Helper to format currency (e.g., add commas)
      formatCurrency(value) {
        return value.toLocaleString("en-US", {
          style: "currency",
          currency: "KRW",
        }); // Example for KRW
      },
      // Helper to format date
      formatDate(dateString) {
        const options = { year: "numeric", month: "short", day: "numeric" };
        return new Date(dateString).toLocaleDateString("en-US", options);
      },
    },
    created() {
      // Fetch transactions when the component is created
      this.fetchTransactions();
    },
  };
</script>

<style scoped>
  .dashboard {
    text-align: center;
    margin-top: 50px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
  }

  h1 {
    color: #333;
    margin-bottom: 20px;
  }

  .summary-cards {
    display: flex;
    justify-content: space-around;
    margin-bottom: 30px;
    gap: 20px; /* Space between cards */
  }

  .summary-card {
    flex: 1;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    color: white;
    min-width: 200px; /* Ensure cards don't get too small */
  }

  .income-card {
    background-color: #28a745; /* Green */
  }

  .expense-card {
    background-color: #dc3545; /* Red */
  }

  .balance-card {
    background-color: #007bff; /* Blue */
  }

  .summary-card h3 {
    margin-top: 0;
    font-size: 1.2em;
  }

  .summary-card p {
    font-size: 1.8em;
    font-weight: bold;
  }

  .recent-transactions {
    margin-top: 40px;
    text-align: left;
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .recent-transactions h2 {
    color: #333;
    margin-bottom: 20px;
    text-align: center;
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
    padding: 10px 0;
    border-bottom: 1px solid #eee;
    font-size: 0.95em;
  }

  .transaction-item:last-child {
    border-bottom: none;
  }

  .transaction-date {
    flex: 0 0 100px; /* Fixed width for date */
    font-weight: bold;
    color: #666;
  }

  .transaction-category {
    flex: 0 0 120px; /* Fixed width for category */
    color: #555;
  }

  .transaction-description {
    flex-grow: 1; /* Takes remaining space */
    color: #444;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0 10px;
  }

  .transaction-amount {
    flex: 0 0 120px; /* Fixed width for amount */
    text-align: right;
    font-weight: bold;
  }

  .transaction-item.income .transaction-amount {
    color: #28a745; /* Green for income */
  }

  .transaction-item.expense .transaction-amount {
    color: #dc3545; /* Red for expense */
  }

  .dashboard-links {
    margin-top: 40px;
  }

  .dashboard-link {
    display: inline-block;
    margin: 10px;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }

  .dashboard-link.view-all-link {
    margin-top: 20px;
    background-color: #6c757d; /* Gray for "View All" */
  }

  .dashboard-link:hover {
    background-color: #0056b3;
  }

  .dashboard-link.view-all-link:hover {
    background-color: #5a6268;
  }
</style>
