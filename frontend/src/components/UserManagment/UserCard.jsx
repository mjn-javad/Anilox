// components/Admin/UserManagement/UserCard.jsx
import React from "react";

const UserCard = ({ user, onPromoteToAdmin, onDemoteToUser, updating }) => {
  const getRoleBadgeStyles = () => {
    if (user.role === "admin") {
      return "bg-green-100 text-green-800 border-green-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getAvatarColor = () => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-yellow-500",
    ];
    const index = (user.id?.toString().length || 0) % colors.length;
    return colors[index];
  };

  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.username?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        {/* Avatar and Role */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-16 h-16 rounded-full ${getAvatarColor()} flex items-center justify-center text-white font-bold text-xl`}
          >
            {getInitials()}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeStyles()}`}
          >
            {user.role === "admin" ? "Admin" : "User"}
          </span>
        </div>

        {/* User Info */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {user.name || user.username}
          </h3>
          <p className="text-gray-600 text-sm mb-1">@{user.username}</p>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {user.role === "user" ? (
            <button
              onClick={() =>
                onPromoteToAdmin(user.id, user.name || user.username)
              }
              disabled={updating}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
            >
              👑 Promote to Admin
            </button>
          ) : (
            <button
              onClick={() =>
                onDemoteToUser(user.id, user.name || user.username)
              }
              disabled={updating}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
            >
              👤 Demote to User
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
