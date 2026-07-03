// pages/Admin/SimpleAllCarts.jsx
import React, { useState, useEffect } from "react";
import apiClientCarts from "../services/api-client_order";
import TransactionCard from "./TransactionManagement/TransactionCard";
import LoadingSpinner from "./Shared/LoadingSpinner";
import MessageAlert from "./Shared/MessageAlert";

const SimpleAllCarts = () => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const response = await apiClientCarts.get("/allCarts");
      setCarts(response.data.data || response.data);
    } catch (err) {
      setError("Failed to load carts");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete all ${carts.length} carts?`,
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await apiClientCarts.delete("/allCarts");
      setCarts([]);
      setSuccess("All carts deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete carts");
      setTimeout(() => setError(""), 3000);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Shopping Carts</h1>
        <button
          onClick={handleDeleteAll}
          disabled={carts.length === 0 || deleting}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg disabled:bg-gray-400"
        >
          {deleting ? "Deleting..." : `Delete All (${carts.length})`}
        </button>
      </div>

      <MessageAlert message={error} type="error" />
      <MessageAlert message={success} type="success" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {carts.map((cart) => (
          <TransactionCard
            key={cart.id}
            transaction={cart}
            transactionType="cart"
          />
        ))}
      </div>

      {carts.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No carts found</p>
        </div>
      )}
    </div>
  );
};

export default SimpleAllCarts;
