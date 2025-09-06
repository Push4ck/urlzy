import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import { Users, Shield, UserCheck, UserX, Search, Trash2, RefreshCw } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      const res = await axios.get(
        getApiUrl(`${API_ENDPOINTS.AUTH}/admin/users`)
      );
      if (res.data?.success) {
        setUsers(res.data.data);
        if (isRefresh) {
          toast.success("Users list refreshed");
        }
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchUsers(true);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await axios.put(
        getApiUrl(`${API_ENDPOINTS.AUTH}/admin/users/${userId}/role`),
        {
          role: newRole,
        }
      );
      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, role: newRole } : user
          )
        );
        toast.success("User role updated successfully");
      }
    } catch (err) {
      console.error("Failed to update user role", err);
      toast.error("Failed to update user role");
    }
  };

  const handleStatusChange = (userId, verified) => {
    const action = verified ? "verify" : "suspend";
    setConfirmAction(() => async () => {
      try {
        const res = await axios.put(
          getApiUrl(`${API_ENDPOINTS.AUTH}/admin/users/${userId}/status`),
          {
            verified,
          }
        );
        if (res.data?.success) {
          setUsers((prev) =>
            prev.map((user) =>
              user._id === userId ? { ...user, verified } : user
            )
          );
          toast.success("User status updated successfully");
        }
      } catch (err) {
        console.error("Failed to update user status", err);
        toast.error("Failed to update user status");
      }
    });
    setConfirmData({ action, userId, verified });
    setShowConfirmModal(true);
  };

  const handlePremiumChange = async (userId, premium) => {
    try {
      const res = await axios.put(
        getApiUrl(`${API_ENDPOINTS.AUTH}/admin/users/${userId}/premium`),
        {
          premium,
        }
      );
      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, premium } : user
          )
        );
        toast.success("User premium status updated successfully");
      }
    } catch (err) {
      console.error("Failed to update user premium status", err);
      toast.error("Failed to update user premium status");
    }
  };

  const handleConfirmAction = async () => {
    if (confirmAction) {
      await confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmData(null);
  };

  const handleCancelAction = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmData(null);
  };

  const handleDeleteUser = (userId, username) => {
    setConfirmAction(() => async () => {
      try {
        const res = await axios.delete(
          getApiUrl(`${API_ENDPOINTS.AUTH}/admin/users/${userId}`)
        );
        if (res.data?.success) {
          setUsers((prev) => prev.filter((user) => user._id !== userId));
          toast.success("User deleted successfully");
        }
      } catch (err) {
        console.error("Failed to delete user", err);
        toast.error("Failed to delete user");
      }
    });
    setConfirmData({ action: "delete", userId, username });
    setShowConfirmModal(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">
                User Management
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Manage users, roles, and account statuses
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 animate-fade-in-up animation-delay-200">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden border border-gray-100 animate-fade-in-up animation-delay-400">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-2xl font-bold text-gray-900">
              Users ({filteredUsers.length})
            </h2>
            <p className="text-gray-600 mt-1">
              Manage user accounts and permissions
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-white/80 transition-all duration-200"
                    >
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {user.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="space-y-2">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user._id, e.target.value)
                            }
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={user.role === "admin"} // Prevent modifying other admins
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`premium-${user._id}`}
                              checked={user.premium || false}
                              onChange={(e) =>
                                handlePremiumChange(user._id, e.target.checked)
                              }
                              className="mr-2"
                            />
                            <label
                              htmlFor={`premium-${user._id}`}
                              className="text-xs text-gray-600"
                            >
                              Premium
                            </label>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            user.verified
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.verified ? (
                            <>
                              <UserCheck className="w-4 h-4 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <UserX className="w-4 h-4 mr-1" />
                              Unverified
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleStatusChange(user._id, !user.verified)
                            }
                            className={`inline-flex items-center px-3 py-1 rounded-lg font-medium transition-colors ${
                              user.verified
                                ? "bg-red-50 text-red-700 hover:bg-red-100"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {user.verified ? "Suspend" : "Verify"}
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteUser(user._id, user.username)
                            }
                            disabled={user.role === "admin"}
                            className="inline-flex items-center px-3 py-1 rounded-lg font-medium transition-colors bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-8 py-6 text-center text-gray-500"
                    >
                      No users found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && confirmData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm{" "}
                {confirmData.action === "delete"
                  ? "Delete"
                  : confirmData.action === "verify"
                  ? "Verify"
                  : "Suspend"}
              </h3>
              <p className="text-gray-600 mb-6">
                {confirmData.action === "delete"
                  ? `Are you sure you want to delete user "${confirmData.username}"? This action cannot be undone.`
                  : `Are you sure you want to ${confirmData.action} this user?`}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelAction}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    confirmData.action === "delete"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : confirmData.verified
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-yellow-600 text-white hover:bg-yellow-700"
                  }`}
                >
                  {confirmData.action === "delete"
                    ? "Delete"
                    : confirmData.action === "verify"
                    ? "Verify"
                    : "Suspend"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
