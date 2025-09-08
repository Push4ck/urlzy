import { useEffect, useState, useContext } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import AuthContext, { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import DashboardRouter from "./components/DashboardRouter";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import UserSettings from "./pages/UserSettings";
import UserManagement from "./pages/UserManagement";
import AdminAnalytics from "./pages/AdminAnalytics";
import SystemHealth from "./pages/SystemHealth";
import ActivityMonitor from "./pages/ActivityMonitor";
import LinkManagement from "./pages/LinkManagement";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/Register";
import Analytics from "./pages/Analytics";
import Pricing from "./pages/Pricing";
import VerifyEmail from "./pages/VerifyEmail";
import LoginVerify from "./pages/LoginVerify";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Maintenance from "./pages/Maintenance";
import AdminMaintenanceLogin from "./pages/AdminMaintenanceLogin";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { isMaintenanceMode as checkMaintenanceMode, getMaintenanceMessage, checkMaintenanceStatus } from "./config/axios";

function AppContent() {
  const location = useLocation();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(null); // null = checking, true = maintenance, false = normal
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  // Check if current user is admin
  const isAdmin = user && user.role === 'admin';

  // Define all valid routes
  const validRoutes = [
    "/",
    "/login",
    "/admin-login",
    "/forgot-password",
    "/verify-email",
    "/register",
    "/pricing",
    "/login-verify",
    "/privacy",
    "/terms",
    "/cookies",
    "/contact",
    "/about",
    "/dashboard",
    "/settings",
    "/admin/settings",
    "/admin/users",
    "/admin/analytics",
    "/admin/health",
    "/admin/activity",
    "/admin/links",
  ];

  // Check if current path matches any valid route or analytics pattern
  const isValidRoute =
    validRoutes.includes(location.pathname) ||
    /^\/analytics\/[^/]+$/.test(location.pathname) ||
    location.pathname.startsWith("/dashboard");

  const isNotFoundPage = !isValidRoute;

  useEffect(() => {
    if (!isNotFoundPage) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, isNotFoundPage]);

  // Listen for maintenance mode events
  useEffect(() => {
    const handleMaintenanceMode = (event) => {
      setIsMaintenanceMode(true);
      setMaintenanceMessage(event.detail.message);
    };

    window.addEventListener('maintenance-mode', handleMaintenanceMode);

    return () => {
      window.removeEventListener('maintenance-mode', handleMaintenanceMode);
    };
  }, []);

  // Also check maintenance mode directly from axios state
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        console.log('App: Starting maintenance check...');
        // First check proactively via API
        await checkMaintenanceStatus();
        console.log('App: Maintenance status checked');

        // Then check local state
        if (checkMaintenanceMode()) {
          console.log('App: Maintenance mode detected, setting state');
          setIsMaintenanceMode(true);
          setMaintenanceMessage(getMaintenanceMessage());
        } else {
          console.log('App: No maintenance mode detected');
          setIsMaintenanceMode(false);
        }
      } catch (error) {
        console.warn('App: Failed to check maintenance status:', error);
        setIsMaintenanceMode(false); // Assume no maintenance if check fails
      }
    };

    console.log('App: Setting up maintenance check');
    // Check immediately on app load
    checkMaintenance();

    // Also check periodically in case we missed an event
    const interval = setInterval(() => {
      console.log('App: Periodic maintenance check');
      checkMaintenance();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Show maintenance page if in maintenance mode, but allow admin login
  // If isMaintenanceMode is null (still checking), show loading
  // If user is admin, bypass maintenance mode completely
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a0)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[var(--clr-primary-a0)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is admin, bypass maintenance mode completely
  if (isAdmin) {
    // Admin users see normal app
  } else if (isMaintenanceMode === null) {
    return (
      <div className="min-h-screen bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a0)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[var(--clr-primary-a0)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">Checking system status...</p>
        </div>
      </div>
    );
  } else if (isMaintenanceMode === true && location.pathname !== "/admin-login") {
    return (
      <div className="min-h-screen bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a0)] flex flex-col transition-colors duration-300">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--clr-surface-a0)",
              color: "var(--clr-dark-a0)",
              border: "1px solid var(--clr-surface-a30)",
              backdropFilter: "blur(10px)",
            },
            className:
              "dark:!bg-[var(--clr-surface-a10)] dark:!text-[var(--clr-light-a0)] dark:!border-[var(--clr-surface-a20)]",
          }}
        />
        <Routes>
          <Route path="/admin-login" element={<AdminMaintenanceLogin />} />
          <Route path="*" element={<Maintenance message={maintenanceMessage} />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a0)] flex flex-col transition-colors duration-300">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--clr-surface-a0)",
            color: "var(--clr-dark-a0)",
            border: "1px solid var(--clr-surface-a30)",
            backdropFilter: "blur(10px)",
          },
          className:
            "dark:!bg-[var(--clr-surface-a10)] dark:!text-[var(--clr-light-a0)] dark:!border-[var(--clr-surface-a20)]",
        }}
      />

      {!isNotFoundPage && <Navbar />}

      <main className={`flex-1 ${!isNotFoundPage ? "mt-12" : ""}`}>
        {!isNotFoundPage && <ScrollToTop />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminMaintenanceLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login-verify" element={<LoginVerify />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <UserSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/health"
            element={
              <ProtectedRoute>
                <SystemHealth />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/activity"
            element={
              <ProtectedRoute>
                <ActivityMonitor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/links"
            element={
              <ProtectedRoute>
                <LinkManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/:shortCode"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isNotFoundPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
