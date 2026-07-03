// components/Admin/TransactionManagement/TransactionManager.jsx
import React, { useState, useEffect } from "react";
import TransactionCard from "./TransactionCard";
import TransactionFilters from "./TransactionFilters";
import LoadingSpinner from "../Shared/LoadingSpinner";
import MessageAlert from "../Shared/MessageAlert";
import DeleteAllModal from "./DeleteAllModal";

const TransactionManager = ({
  title,
  fetchEndpoint,
  deleteAllEndpoint,
  transactionType, // 'cart' or 'order'
  apiClient,
  transformData,
}) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(fetchEndpoint);
      let data = response.data.data || response.data;

      if (transformData) {
        data = transformData(data);
      }

      setTransactions(data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || `Failed to load ${transactionType}s`,
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    if (!searchTerm.trim()) {
      setFilteredTransactions(transactions);
      return;
    }

    const filtered = transactions.filter((transaction) => {
      const userName = transaction.user?.name?.toLowerCase() || "";
      const userEmail = transaction.user?.email?.toLowerCase() || "";
      const userUsername = transaction.user?.username?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();

      return (
        userName.includes(search) ||
        userEmail.includes(search) ||
        userUsername.includes(search)
      );
    });

    setFilteredTransactions(filtered);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 3000);
  };

  const handleDeleteAll = async () => {
    try {
      setDeleting(true);
      await apiClient.delete(deleteAllEndpoint);
      await fetchTransactions();
      showSuccess(`All ${transactionType}s have been deleted successfully`);
      setShowDeleteModal(false);
    } catch (err) {
      showError(
        err.response?.data?.message || `Failed to delete ${transactionType}s`,
      );
    } finally {
      setDeleting(false);
    }
  };

  const calculateStats = () => {
    let totalItems = 0;
    let totalValue = 0;

    transactions.forEach((transaction) => {
      if (transaction.items && Array.isArray(transaction.items)) {
        totalItems += transaction.items.length;
        totalValue += transaction.total_amount || transaction.total || 0;
      } else if (
        transaction.cart_items &&
        Array.isArray(transaction.cart_items)
      ) {
        totalItems += transaction.cart_items.length;
        totalValue += transaction.total_amount || 0;
      }
    });

    return { totalItems, totalValue };
  };

  const stats = calculateStats();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-600">
          Manage and monitor all {transactionType}s in the system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600">Total {transactionType}s</div>
          <div className="text-2xl font-bold text-gray-800">
            {transactions.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-600">Total Items</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.totalItems}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="text-sm text-gray-600">Total Value</div>
          <div className="text-2xl font-bold text-purple-600">
            ${stats.totalValue.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="text-sm text-gray-600">Active {transactionType}s</div>
          <div className="text-2xl font-bold text-red-600">
            {filteredTransactions.length}
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageAlert message={error} type="error" />
      <MessageAlert message={successMessage} type="success" />

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex-1 w-full">
            <TransactionFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              transactionType={transactionType}
            />
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={transactions.length === 0 || deleting}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>🗑️</span>
            Delete All {transactionType}s
          </button>
        </div>
      </div>

      {/* Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTransactions.map((transaction, index) => (
          <TransactionCard
            key={transaction.id || index}
            transaction={transaction}
            transactionType={transactionType}
          />
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No {transactionType}s found</p>
        </div>
      )}

      {/* Delete All Modal */}
      <DeleteAllModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAll}
        title={title}
        itemCount={transactions.length}
        isDeleting={deleting}
      />
    </div>
  );
};

export default TransactionManager;
