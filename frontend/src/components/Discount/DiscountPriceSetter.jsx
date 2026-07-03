import axios from "axios";
import apiClient from "../../services/api-client_discount";
import React, { FormEvent, useState } from "react";
import MessageAlert from "../Shared/MessageAlert";
import InputField from "../Shared/InputField";
import Button from "../Shared/Button";

const DiscountPriceSetter = () => {
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (value) => {
    // فقط اعداد بین 0 تا 100 قبول می‌شوند
    const numValue = parseFloat(value);
    if (
      value === "" ||
      (!isNaN(numValue) && numValue >= 0 && numValue <= 100)
    ) {
      setDiscountPercentage(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // اعتبارسنجی سمت کلاینت
    const numValue = parseFloat(discountPercentage);
    if (discountPercentage === "" || isNaN(numValue)) {
      setError("Please enter a valid discount percentage");
      return;
    }

    if (numValue < 0 || numValue > 100) {
      setError("Discount percentage must be between 0 and 100");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await apiClient.post("/setDiscountPrices", {
        discountPercentage: numValue,
      });

      setMessage(res.data.message || "Discount applied successfully!");

      // ریست کردن فیلد
      setDiscountPercentage("");
    } catch (err) {
      setError(err.response?.data?.message || "Error setting discount prices");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container text-center my-5">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-y-4 max-w-md mx-auto"
      >
        <div className="text-left mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Percentage
          </label>
          <div className="relative">
            <input
              type="number"
              name="discountPercentage"
              value={discountPercentage}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Enter discount percentage (0-100)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              min="0"
              max="100"
              step="0.1"
              required
              disabled={loading}
            />
            <span className="absolute right-3 top-2.5 text-gray-400">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter a number between 0 and 100
          </p>
        </div>

        <button
          type="submit"
          className={`px-4 py-2 text-white rounded transition duration-200 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          disabled={loading}
        >
          {loading ? "Applying..." : "Apply Discount to All Products"}
        </button>

        {message && <MessageAlert message={message} type="success" />}
        {error && <MessageAlert message={error} type="error" />}
      </form>
    </div>
  );
};

export default DiscountPriceSetter;
