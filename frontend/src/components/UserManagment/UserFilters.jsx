// components/Admin/UserManagement/UserFilters.jsx
import React from "react";

const UserFilters = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: "all", label: "All Users", icon: "👥", color: "bg-gray-500" },
    { id: "admin", label: "Admins", icon: "👑", color: "bg-green-500" },
    { id: "user", label: "Regular Users", icon: "👤", color: "bg-purple-500" },
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              px-5 py-2 rounded-lg font-medium transition-all duration-200
              ${
                activeFilter === filter.id
                  ? `${filter.color} text-white shadow-md transform scale-105`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            <span className="mr-2">{filter.icon}</span>
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserFilters;
