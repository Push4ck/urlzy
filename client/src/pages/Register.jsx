import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  AlertCircle,
  Loader,
  ArrowRight,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const result = await register(
        formData.username,
        formData.email,
        formData.password
      );
      if (result?.success) {
        toast.success("Account created. Check your email to verify.");
        navigate(
          `/verify-email?email=${encodeURIComponent(
            formData.email
          )}&skipRequest=1`
        );
        return;
      }
      setError(result?.message || "Registration failed");
      toast.error(result?.message || "Registration failed");
    } catch (err) {
      const message =
        err.response?.data?.message || "An error occurred during registration";
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
            Create your account
          </h2>
          <p className="text-xl text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a50)]">
            Join us and start shortening URLs
          </p>
          <p className="text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a50)]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] dark:text-[var(--clr-primary-a10)] dark:hover:text-[var(--clr-primary-a0)] font-semibold transition-colors duration-300"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--clr-surface-a0)]/80 dark:bg-[var(--clr-surface-a10)]/80 backdrop-blur-xl p-8 border border-[var(--clr-primary-a0)] dark:border-[var(--clr-primary-a10)] rounded-xl shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-3"
              >
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-14 pr-4 py-4 text-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] border-2 border-[var(--clr-surface-a30)] dark:border-[var(--clr-surface-a20)] rounded-xl text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] placeholder-[var(--clr-surface-a50)] dark:placeholder-[var(--clr-surface-a40)] focus:border-[var(--clr-primary-a0)] focus:outline-none transition-colors duration-300"
                  placeholder="Choose a username"
                />
                <User className="absolute left-4 top-4 w-6 h-6 text-[var(--clr-primary-a0)] dark:text-[var(--clr-primary-a10)]" />
              </div>
            </div>

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
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-14 pr-14 py-4 text-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] border-2 border-[var(--clr-surface-a30)] dark:border-[var(--clr-surface-a20)] rounded-xl text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] placeholder-[var(--clr-surface-a50)] dark:placeholder-[var(--clr-surface-a40)] focus:border-[var(--clr-primary-a0)] focus:outline-none transition-colors duration-300"
                  placeholder="Choose a strong password"
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-3"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-14 pr-14 py-4 text-lg bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] border-2 border-[var(--clr-surface-a30)] dark:border-[var(--clr-surface-a20)] rounded-xl text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] placeholder-[var(--clr-surface-a50)] dark:placeholder-[var(--clr-surface-a40)] focus:border-[var(--clr-primary-a0)] focus:outline-none transition-colors duration-300"
                  placeholder="Confirm your password"
                />
                <Lock className="absolute left-4 top-4 w-6 h-6 text-[var(--clr-primary-a0)] dark:text-[var(--clr-primary-a10)]" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4 w-6 h-6 text-[var(--clr-primary-a0)] dark:text-[var(--clr-primary-a10)] hover:text-[var(--clr-primary-dark)] dark:hover:text-[var(--clr-primary-a0)] cursor-pointer transition-colors duration-300"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? <Eye /> : <EyeOff />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <label
              htmlFor="agree-terms"
              className="flex items-start gap-3 text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] cursor-pointer"
            >
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="w-5 h-5 mt-1 rounded border-2 border-[var(--clr-primary-a0)] text-[var(--clr-primary-a0)] focus:ring-[var(--clr-primary-a0)] focus:ring-2"
              />
              <span>
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] dark:text-[var(--clr-primary-a10)] dark:hover:text-[var(--clr-primary-a0)] font-semibold transition-colors duration-300"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] dark:text-[var(--clr-primary-a10)] dark:hover:text-[var(--clr-primary-a0)] font-semibold transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>

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
                  Creating account...
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-3">
                  Create account
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

export default Register;
