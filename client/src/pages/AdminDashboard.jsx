import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import {
  Users,
  Link as LinkIcon,
  MousePointer,
  TrendingUp,
  Shield,
  Activity,
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUrls: 0,
    totalClicks: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await axios.get(
          getApiUrl(`${API_ENDPOINTS.AUTH}/admin/stats`)
        );
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
        toast.error("Failed to load admin statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  const statCards = useMemo(
    () => [
      {
        title: "Total Users",
        value: stats.totalUsers,
        icon: Users,
        color: "from-blue-500 to-indigo-600",
      },
      {
        title: "Total URLs",
        value: stats.totalUrls,
        icon: LinkIcon,
        color: "from-green-500 to-emerald-600",
      },
      {
        title: "Total Clicks",
        value: stats.totalClicks,
        icon: MousePointer,
        color: "from-purple-500 to-pink-600",
      },
      {
        title: "Active Users",
        value: stats.activeUsers,
        icon: Activity,
        color: "from-yellow-500 to-orange-600",
      },
    ],
    [stats]
  );

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
          <h1 className="text-4xl font-extrabold text-indigo-600 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            System overview and management
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className="bg-white p-8 rounded-2xl shadow-md border border-gray-100"
            >
              <div className="flex items-center">
                <div className="p-4 bg-indigo-600 rounded-2xl">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Actions */}
        <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900">Admin Actions</h2>
            <p className="text-gray-600 mt-1">
              Manage system settings and users
            </p>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                to="/admin/users"
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 block"
              >
                <Shield className="w-12 h-12 text-indigo-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  User Management
                </h3>
                <p className="text-gray-600 text-sm">
                  View and manage all users
                </p>
              </Link>
              <Link
                to="/admin/analytics"
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 block"
              >
                <LinkIcon className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  URL Analytics
                </h3>
                <p className="text-gray-600 text-sm">
                  System-wide URL statistics
                </p>
              </Link>
              <Link
                to="/admin/settings"
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 block"
              >
                <Activity className="w-12 h-12 text-yellow-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  System Settings
                </h3>
                <p className="text-gray-600 text-sm">
                  Configure system preferences
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
