import React, { useState, useEffect } from "react";
import apiClient from "../../services/api-client_discount";
import MessageAlert from "../Shared/MessageAlert";
import InputField from "../Shared/InputField";
import Button from "../Shared/Button";

const DiscountCodeManager = () => {
  // State برای فرم ایجاد کد
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    max_uses: "",
    valid_from: "",
    valid_until: "",
  });

  // State برای لیست کدها
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAllCodes, setShowAllCodes] = useState(false);

  // تابع دریافت همه کدها
  const fetchAllCodes = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/allDiscountCodes");
      setCodes(res.data.codes || []);
      setShowAllCodes(true);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching discount codes");
    } finally {
      setLoading(false);
    }
  };

  // تابع ایجاد کد جدید
  const handleCreateCode = async (e) => {
    e.preventDefault();

    // اعتبارسنجی
    if (!form.code || !form.discount_value) {
      setError("Code and discount value are required");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await apiClient.post("/createCodeForAllProducts", {
        code: form.code,
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        max_uses: form.max_uses ? parseInt(form.max_uses) : undefined,
        valid_from: form.valid_from || undefined,
        valid_until: form.valid_until || undefined,
      });

      setMessage(res.data.message || "Discount code created successfully!");

      // ریست فرم
      setForm({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        max_uses: "",
        valid_from: "",
        valid_until: "",
      });

      // بروزرسانی لیست کدها
      await fetchAllCodes();
    } catch (err) {
      setError(err.response?.data?.message || "Error creating discount code");
    } finally {
      setLoading(false);
    }
  };

  // تابع حذف کد تکی
  const handleDeleteCode = async (code) => {
    if (!window.confirm(`Are you sure you want to delete code "${code}"?`)) {
      return;
    }

    try {
      setLoading(true);
      console.log(code);

      const res = await apiClient.delete(`/removeSingleCode/${code}`);

      setMessage(res.data.message || "Code deleted successfully!");

      // بروزرسانی لیست
      await fetchAllCodes();
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting code");
    } finally {
      setLoading(false);
    }
  };

  // تابع حذف همه کدها
  const handleDeleteAllCodes = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL discount codes? This action cannot be undone!",
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.delete("/removeAllCodes");

      setMessage(res.data.message || "All codes deleted successfully!");

      // بروزرسانی لیست
      await fetchAllCodes();
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting all codes");
    } finally {
      setLoading(false);
    }
  };

  // تابع تغییر فرم
  const handleChange = (name, value) => {
    setForm({
      ...form,
      [name]: value,
    });
  };

  // فرمت تاریخ برای نمایش
  const formatDate = (dateString) => {
    if (!dateString) return "No limit";
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  return (
    <div className="container mx-auto p-4">
      {/* بخش ایجاد کد جدید */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Create Discount Code
        </h2>

        <form
          onSubmit={handleCreateCode}
          className="flex flex-col gap-y-4 max-w-md mx-auto"
        >
          <InputField
            name="code"
            label="Code"
            value={form.code}
            onChange={(e) =>
              handleChange(e.target.name, e.target.value.toUpperCase())
            }
            placeholder="Enter discount code"
            required={true}
            disabled={loading}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Type
            </label>
            <select
              name="discount_type"
              value={form.discount_type}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={loading}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

          <InputField
            name="discount_value"
            label="Discount Value"
            type="number"
            value={form.discount_value}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
            placeholder={
              form.discount_type === "percentage"
                ? "Enter percentage (e.g., 20)"
                : "Enter fixed amount"
            }
            required={true}
            disabled={loading}
            step="0.01"
            min="0"
          />

          <InputField
            name="max_uses"
            label="Max Uses (Optional)"
            type="number"
            value={form.max_uses}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
            placeholder="Leave empty for unlimited"
            disabled={loading}
            min="1"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid From (Optional)
              </label>
              <input
                type="date"
                name="valid_from"
                value={form.valid_from}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid Until (Optional)
              </label>
              <input
                type="date"
                name="valid_until"
                value={form.valid_until}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`px-4 py-2 text-white rounded transition duration-200 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Discount Code"}
          </button>
        </form>
      </div>

      {/* بخش مدیریت کدها */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Discount Codes</h2>
          <div className="space-x-2">
            <button
              onClick={fetchAllCodes}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
              disabled={loading}
            >
              {loading ? "Loading..." : "Show All Codes"}
            </button>

            {codes.length > 0 && (
              <button
                onClick={handleDeleteAllCodes}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
                disabled={loading}
              >
                Delete All
              </button>
            )}
          </div>
        </div>

        {/* نمایش پیام‌ها */}
        {message && <MessageAlert message={message} type="success" />}
        {error && <MessageAlert message={error} type="error" />}

        {/* لیست کدها */}
        {showAllCodes && (
          <div className="mt-4">
            {codes.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No discount codes found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border text-left">Code</th>
                      <th className="px-4 py-2 border text-left">Type</th>
                      <th className="px-4 py-2 border text-left">Value</th>
                      <th className="px-4 py-2 border text-left">Max Uses</th>
                      <th className="px-4 py-2 border text-left">Valid From</th>
                      <th className="px-4 py-2 border text-left">
                        Valid Until
                      </th>
                      <th className="px-4 py-2 border text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((code, index) => (
                      <tr key={code.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border font-mono font-bold">
                          {code.code}
                        </td>
                        <td className="px-4 py-2 border">
                          {code.discount_type === "percentage" ? "%" : "Fixed"}
                        </td>
                        <td className="px-4 py-2 border">
                          {code.discount_type === "percentage"
                            ? `${code.discount_value}%`
                            : `${code.discount_value} $`}
                        </td>
                        <td className="px-4 py-2 border">
                          {code.max_uses || "Unlimited"}
                        </td>
                        <td className="px-4 py-2 border">
                          {formatDate(code.valid_from)}
                        </td>
                        <td className="px-4 py-2 border">
                          {formatDate(code.valid_until)}
                        </td>
                        <td className="px-4 py-2 border">
                          <button
                            onClick={() => handleDeleteCode(code.code)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition duration-200"
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountCodeManager;
