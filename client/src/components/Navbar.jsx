import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              URLzy
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/")
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700"
                }`}
              >
                Home
              </Link>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/dashboard")
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-700"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={
                      user?.role === "admin" ? "/admin/settings" : "/settings"
                    }
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(
                        user?.role === "admin" ? "/admin/settings" : "/settings"
                      )
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-700"
                    }`}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/pricing"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/pricing")
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-700"
                    }`}
                  >
                    Pricing
                  </Link>
                  <Link
                    to="/login"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive("/login")
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-700"
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={
                      user?.role === "admin" ? "/admin/settings" : "/settings"
                    }
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/pricing"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-indigo-600 text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
