import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  Loader,
  ArrowRight,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(formData.email, formData.password, rememberMe);
      if (result?.success && result?.twoFactorRequired && result?.loginToken) {
        navigate(
          `/login-verify?token=${encodeURIComponent(
            result.loginToken
          )}&email=${encodeURIComponent(formData.email)}`
        );
        toast.success("Enter the code sent to your email");
        return;
      }
      if (result?.success) {
        toast.success("Logged in successfully");
        navigate("/dashboard");
        return;
      }
      if (result?.requiresVerification) {
        toast.error("Email not verified. Check your inbox for the code.");
        navigate(
          `/verify-email?email=${encodeURIComponent(
            formData.email
          )}&skipRequest=1`
        );
        return;
      }
      setError(result?.message || "An error occurred during login");
      toast.error(result?.message || "Login failed");
    } catch (err) {
      const message =
        err.response?.data?.message || "An error occurred during login";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a0)] transition-colors duration-300">
      <div className="w-full max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 space-y-4">
          <h2 className="text-5xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
            Welcome back
          </h2>
          <p className="text-xl text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a50)]">
            Sign in to your account
          </p>
          <p className="text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a50)]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] dark:text-[var(--clr-primary-a10)] dark:hover:text-[var(--clr-primary-a0)] font-semibold transition-colors duration-300"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--clr-surface-a0)]/80 dark:bg-[var(--clr-surface-a10)]/80 backdrop-blur-xl p-8 border border-[var(--clr-primary-a0)] dark:border-[var(--clr-primary-a10)] rounded-xl shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-3"
              >
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-14 pr-4 py-4 text-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] border-2 border-[var(--clr-surface-a30)] dark:border-[var(--clr-surface-a20)] rounded-xl text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] placeholder-[var(--clr-surface-a50)] dark:placeholder-[var(--clr-surface-a40)] focus:border-[var(--clr-primary-a0)] focus:outline-none transition-colors duration-300"
                  placeholder="you@example.com"
                />
                <Mail className="absolute left-4 top-4 w-6 h-6 text-[var(--clr-primary-a0)] dark:text-[var(--clr-primary-a10)]" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-3"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-14 pr-14 py-4 text-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] border-2 border-[var(--clr-surface-a30)] dark:border-[var(--clr-surface-a20)] rounded-xl text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] placeholder-[var(--clr-surface-a50)] dark:placeholder-[var(--clr-surface-a40)] focus:border-[var(--clr-primary-a0)] focus:outline-none transition-colors duration-300"
                  placeholder="Enter your password"
                />
                <Lock className="absolute left-4 top-4 w-6 h-6 text-[var(--clr-primary-a0)] dark:text-[var(--clr-primary-a10)]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 w-6 h-6 text-[var(--clr-primary-a0)] dark:text-[var(--clr-primary-a10)] hover:text-[var(--clr-primary-dark)] dark:hover:text-[var(--clr-primary-a0)] cursor-pointer transition-colors duration-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <label
                htmlFor="remember-me"
                className="flex items-center gap-3 text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] cursor-pointer"
              >
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-[var(--clr-primary-a0)] text-[var(--clr-primary-a0)] focus:ring-[var(--clr-primary-a0)] focus:ring-2"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] dark:text-[var(--clr-primary-a10)] dark:hover:text-[var(--clr-primary-a0)] font-semibold transition-colors duration-300"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/50">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-red-700 dark:text-red-300 font-medium">
                    {error}
                  </span>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] dark:bg-[var(--clr-primary-a10)] dark:hover:bg-[var(--clr-primary-a0)] text-[var(--clr-light-a0)] w-full py-4 text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              {loading ? (
                <span className="inline-flex items-center gap-3">
                  <Loader className="animate-spin w-6 h-6" />
                  Signing in...
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-3">
                  Sign in
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
