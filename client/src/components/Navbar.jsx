import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Menu, X, Sun, Moon } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[var(--navbar-bg)] shadow-lg sticky top-0 z-50 border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Logo + Navigation + Theme */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="text-2xl font-bold text-[var(--navbar-text)] hover:text-[var(--text-secondary)] transition-colors duration-200"
              >
                URLzy
              </Link>
            </div>

            {/* Desktop Menu */}
            <div>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-6">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        isActive("/dashboard")
                          ? "bg-[var(--text-secondary)] text-white"
                          : "text-[var(--navbar-text)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to={
                        user?.role === "admin" ? "/admin/settings" : "/settings"
                      }
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        isActive(
                          user?.role === "admin"
                            ? "/admin/settings"
                            : "/settings"
                        )
                          ? "bg-[var(--text-secondary)] text-white"
                          : "text-[var(--navbar-text)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                      }`}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 rounded-md text-sm font-medium text-[var(--navbar-text)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/pricing"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        isActive("/pricing")
                          ? "bg-[var(--text-secondary)] text-white"
                          : "text-[var(--navbar-text)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                      }`}
                    >
                      Pricing
                    </Link>
                    <Link
                      to="/login"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        isActive("/login")
                          ? "bg-[var(--text-secondary)] text-white"
                          : "text-[var(--navbar-text)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                      }`}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="retro-btn px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-[var(--navbar-text)] hover:text-[var(--text-secondary)] transition-all duration-200 hover:bg-[var(--bg-tertiary)]"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[var(--navbar-text)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all duration-200"
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[var(--navbar-bg)] border-t border-[var(--border-color)]">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all ${
                  isActive("/")
                    ? "bg-[var(--text-secondary)] text-white"
                    : "text-[var(--navbar-text)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-all ${
                      isActive("/dashboard")
                        ? "bg-[var(--text-secondary)] text-white"
                        : "text-[var(--navbar-text)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={
                      user?.role === "admin" ? "/admin/settings" : "/settings"
                    }
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-all ${
                      isActive(
                        user?.role === "admin" ? "/admin/settings" : "/settings"
                      )
                        ? "bg-[var(--text-secondary)] text-white"
                        : "text-[var(--navbar-text)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-[var(--navbar-text)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/pricing"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-all ${
                      isActive("/pricing")
                        ? "bg-[var(--text-secondary)] text-white"
                        : "text-[var(--navbar-text)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    to="/login"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-all ${
                      isActive("/login")
                        ? "bg-[var(--text-secondary)] text-white"
                        : "text-[var(--navbar-text)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium retro-btn"
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
