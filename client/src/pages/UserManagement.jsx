import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  Search,
  Trash2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

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
      <div className="min-h-screen bg-[var(--clr-surface-a10)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--clr-primary-a0)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-dark-a0)]">
      <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 py-4 xs:py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 xs:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 xs:gap-6">
            <div className="flex xs:flex-col lg:flex-row xs:items-left lg:items-center gap-2 xs:gap-4">
              <Link
                to="/dashboard"
                className="w-fit p-2 rounded-lg bg-[var(--clr-surface-a10)] hover:bg-[var(--clr-surface-a20)] transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 xs:w-5 xs:h-5 text-[var(--clr-surface-a50)]" />
              </Link>
              <div>
                <h1 className="text-3xl xs:text-4xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2">
                  User Management
                </h1>
                <p className="text-base xs:text-lg text-[var(--clr-surface-a50)]">
                  Manage users, roles, and account statuses
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-fit self-end px-6 py-3 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg inline-flex items-center gap-2 disabled:opacity-50 transition-colors duration-200 cursor-pointer"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--clr-surface-a40)] w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              <div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-2 border border-[var(--clr-surface-a30)] rounded-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent transition-colors"
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
        <div className="bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border border-[var(--clr-surface-a30)] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--clr-surface-a30)]">
            <h2 className="text-xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              Users ({filteredUsers.length})
            </h2>
            <p className="text-[var(--clr-surface-a50)] text-sm mt-1">
              Manage user accounts and permissions
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--clr-surface-a30)]">
              <thead className="bg-[var(--clr-surface-a10)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--clr-surface-a50)] uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--clr-surface-a50)] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--clr-surface-a50)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--clr-surface-a50)] uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--clr-surface-a50)] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] divide-y divide-[var(--clr-surface-a30)]">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-[var(--clr-surface-a10)] transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg bg-[var(--clr-primary-a0)]">
                            <Users className="w-5 h-5 text-[var(--clr-light-a0)]" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                              {user.username}
                            </div>
                            <div className="text-sm text-[var(--clr-surface-a50)]">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user._id, e.target.value)
                            }
                            className="px-3 py-1 border border-[var(--clr-surface-a30)] rounded-lg text-sm bg-[var(--clr-surface-a0)] text-[var(--clr-surface-a50)] focus:border-[var(--clr-primary-a0)] focus:outline-none transition-colors"
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
                              className="mr-2 accent-[var(--clr-primary-a0)] cursor-pointer"
                            />
                            <label
                              htmlFor={`premium-${user._id}`}
                              className="text-xs text-[var(--clr-surface-a50)]"
                            >
                              Premium
                            </label>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            user.verified
                              ? "bg-[var(--clr-surface-tonal-a10)] text-[var(--clr-primary-dark)]"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--clr-surface-a50)]">
                        {new Date(user.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleStatusChange(user._id, !user.verified)
                            }
                            className={`inline-flex items-center px-3 py-1 rounded-lg font-medium transition-colors duration-200 cursor-pointer ${
                              user.verified
                                ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                : "bg-[var(--clr-surface-tonal-a10)] text-[var(--clr-primary-dark)] hover:bg-[var(--clr-surface-tonal-a20)]"
                            }`}
                          >
                            {user.verified ? "Suspend" : "Verify"}
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteUser(user._id, user.username)
                            }
                            disabled={user.role === "admin"}
                            className="inline-flex items-center px-3 py-1 rounded-lg font-medium transition-colors duration-200 bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 cursor-pointer"
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
                      className="px-8 py-6 text-center text-[var(--clr-surface-a40)]"
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
          <div className="fixed inset-0 bg-[var(--clr-dark-a0)]/50 flex items-center justify-center z-50">
            <div className="bg-[var(--clr-surface-a0)] rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-[var(--clr-surface-a30)]">
              <h3 className="text-lg font-semibold text-[var(--clr-surface-a50)] dark:text-[var(--clr-light-a0)] mb-4">
                Confirm{" "}
                {confirmData.action === "delete"
                  ? "Delete"
                  : confirmData.action === "verify"
                  ? "Verify"
                  : "Suspend"}
              </h3>
              <p className="text-[var(--clr-surface-a50)] mb-6">
                {confirmData.action === "delete"
                  ? `Are you sure you want to delete user "${confirmData.username}"? This action cannot be undone.`
                  : `Are you sure you want to ${confirmData.action} this user?`}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelAction}
                  className="px-4 py-2 bg-[var(--clr-surface-a20)] text-[var(--clr-surface-a50)] rounded-lg hover:bg-[var(--clr-surface-a30)] transition-colors duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer ${
                    confirmData.action === "delete"
                      ? "bg-red-600 text-[var(--clr-light-a0)] hover:bg-red-700"
                      : confirmData.verified
                      ? "bg-[var(--clr-primary-a0)] text-[var(--clr-light-a0)] hover:bg-[var(--clr-primary-dark)]"
                      : "bg-yellow-600 text-[var(--clr-light-a0)] hover:bg-yellow-700"
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
