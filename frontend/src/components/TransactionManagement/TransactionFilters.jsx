// components/Admin/TransactionManagement/TransactionFilters.jsx
import React from "react";

const TransactionFilters = ({
  searchTerm,
  onSearchChange,
  transactionType,
}) => {
  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder={`Search by user name, email or username...`}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
      </div>
      {searchTerm && (
        <button
          onClick={() => onSearchChange("")}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default TransactionFilters;
