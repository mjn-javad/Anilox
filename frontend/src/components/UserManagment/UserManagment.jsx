// components/Admin/UserManagement/UserManagement.jsx
import React, { useState, useEffect } from "react";
import apiClientUsers from "../../services/api-client_auth";
import UserCard from "./UserCard";
import UserFilters from "./UserFilters";
import LoadingSpinner from "../Shared/LoadingSpinner";
import MessageAlert from "../Shared/MessageAlert";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // all, admin, user

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [activeFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClientUsers.get("/users");
      setUsers(response.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (activeFilter === "all") {
      setFilteredUsers(users);
    } else if (activeFilter === "admin") {
      setFilteredUsers(users.filter((user) => user.role === "admin"));
    } else if (activeFilter === "user") {
      setFilteredUsers(users.filter((user) => user.role === "user"));
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 3000);
  };

  const promoteToAdmin = async (userId, userName) => {
    if (
      !window.confirm(`Are you sure you want to promote ${userName} to admin?`)
    ) {
      return;
    }

    try {
      setUpdating(true);
      await apiClientUsers.put(`/${userId}/admin`);

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: "admin" } : user,
        ),
      );

      showSuccess(`${userName} is now an admin`);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to promote user");
    } finally {
      setUpdating(false);
    }
  };

  const demoteToUser = async (userId, userName) => {
    if (
      !window.confirm(
        `Are you sure you want to demote ${userName} to regular user?`,
      )
    ) {
      return;
    }

    try {
      setUpdating(true);
      await apiClientUsers.put(`/${userId}/user`);

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: "user" } : user,
        ),
      );

      showSuccess(`${userName} is now a regular user`);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to demote user");
    } finally {
      setUpdating(false);
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    users: users.filter((u) => u.role === "user").length,
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          User Management
        </h1>
        <p className="text-gray-600">Manage user roles and permissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-600">Admins</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.admins}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="text-sm text-gray-600">Regular Users</div>
          <div className="text-2xl font-bold text-purple-600">
            {stats.users}
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageAlert message={error} type="error" />
      <MessageAlert message={successMessage} type="success" />

      {/* Filters */}
      <UserFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onPromoteToAdmin={promoteToAdmin}
            onDemoteToUser={demoteToUser}
            updating={updating}
          />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No users found</p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
