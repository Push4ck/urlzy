import { useEffect, useState, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Zap, Sun, Moon } from "lucide-react";
import AuthContext from "../contexts/AuthContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // Load dark mode preference - BACK TO ORIGINAL APPROACH
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleMobileMenu = () => setMobileOpen(!mobileOpen);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  // Navigation items (dynamic with auth)
  const navItems = user
    ? [
        { name: "Dashboard", path: "/dashboard" },
        {
          name: "Settings",
          path: user?.role === "admin" ? "/admin/settings" : "/settings",
        },
        { name: "Logout", action: handleLogout },
      ]
    : [
        { name: "Pricing", path: "/pricing" },
        { name: "Login", path: "/login" },
        { name: "Sign Up", path: "/register", special: true },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--clr-surface-a0)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] shadow-sm transition-colors border-b border-[var(--clr-surface-a20)]">
      <div className="container mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12 xs:h-14 sm:h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
          >
            <Zap className="w-6 h-6 text-[var(--clr-primary-a0)]" />
            <span>URLzy</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map(({ name, path, action, special }) =>
              action ? (
                <button
                  key={name}
                  onClick={action}
                  className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] hover:text-[var(--clr-primary-a0)] dark:hover:text-[var(--clr-primary-a20)] transition-colors cursor-pointer"
                >
                  {name}
                </button>
              ) : (
                <NavLink
                  key={name}
                  to={path}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      special
                        ? "bg-[var(--clr-primary-a0)] text-[var(--clr-light-a0)] px-6 py-2 rounded-lg hover:bg-[var(--clr-primary-a10)]"
                        : isActive
                        ? "text-[var(--clr-primary-a0)] dark:text-[var(--clr-primary-a20)]"
                        : "text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] hover:text-[var(--clr-primary-a0)] dark:hover:text-[var(--clr-primary-a20)]"
                    }`
                  }
                >
                  {name}
                </NavLink>
              )
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] hover:text-[var(--clr-primary-a0)] dark:hover:text-[var(--clr-primary-a20)] transition-colors cursor-pointer"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Nav Buttons */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] hover:text-[var(--clr-primary-a0)] dark:hover:text-[var(--clr-primary-a20)] transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] hover:text-[var(--clr-primary-a0)] dark:hover:text-[var(--clr-primary-a20)] transition-colors"
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[var(--clr-surface-a20)] bg-[var(--clr-surface-a0)]">
            <div className="py-4 space-y-2">
              {navItems.map(({ name, path, action, special }) =>
                action ? (
                  <button
                    key={name}
                    onClick={action}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] hover:text-[var(--clr-primary-a0)] dark:hover:text-[var(--clr-primary-a20)] hover:bg-[var(--clr-surface-a10)] transition-colors rounded-lg"
                  >
                    {name}
                  </button>
                ) : (
                  <NavLink
                    key={name}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-2 text-base font-medium rounded-lg transition-colors ${
                        special
                          ? "bg-[var(--clr-primary-a0)] text-[var(--clr-light-a0)] text-center hover:bg-[var(--clr-primary-a10)]"
                          : isActive
                          ? "text-[var(--clr-primary-a0)] dark:text-[var(--clr-primary-a20)] bg-[var(--clr-surface-tonal-a10)]"
                          : "text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] hover:bg-[var(--clr-surface-a10)] hover:text-[var(--clr-primary-a0)] dark:hover:text-[var(--clr-primary-a20)]"
                      }`
                    }
                  >
                    {name}
                  </NavLink>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
