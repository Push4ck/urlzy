import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader, ArrowRight } from "lucide-react";

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
        // redirect to 2FA verify step
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in-up">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-[var(--text-secondary)] mb-4">
            Welcome Back
          </h2>
          <p className="text-lg text-[var(--text-primary)] opacity-80">
            Sign in to your account to continue
          </p>
          <p className="mt-2 text-sm text-[var(--text-primary)] opacity-60">
            Or{" "}
            <Link
              to="/register"
              className="font-semibold text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors duration-200"
            >
              create a new account
            </Link>
          </p>
        </div>

        <div className="bg-[var(--card-bg)] p-8 rounded-2xl shadow-xl border border-[var(--border-color)]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-[var(--text-primary)] mb-2"
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
                    className="appearance-none relative block w-full px-4 py-3 pl-12 border border-[var(--border-color)] placeholder-[var(--text-primary)] opacity-60 text-[var(--text-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--text-secondary)] focus:border-[var(--text-secondary)] transition-all duration-200 bg-[var(--bg-secondary)]"
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-[var(--text-primary)] opacity-50" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[var(--text-primary)] mb-2"
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
                    className="appearance-none relative block w-full px-4 py-3 pl-12 pr-12 border border-[var(--border-color)] placeholder-[var(--text-primary)] opacity-60 text-[var(--text-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--text-secondary)] focus:border-[var(--text-secondary)] transition-all duration-200 bg-[var(--bg-secondary)]"
                    placeholder="Enter your password"
                  />
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-[var(--text-primary)] opacity-50" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-3.5 w-5 h-5 text-[var(--text-primary)] opacity-50 hover:opacity-70 focus:outline-none transition-colors"
                  >
                    {showPassword ? <Eye /> : <EyeOff />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[var(--text-secondary)] focus:ring-[var(--text-secondary)] border-[var(--border-color)] rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-3 block text-sm text-[var(--text-primary)] font-medium"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-semibold text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
                <AlertCircle className="w-5 h-5 mr-3 text-red-500" />
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-6 border border-transparent text-sm font-bold rounded-xl text-white bg-[var(--text-secondary)] hover:bg-[var(--text-accent)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Sign in
                    <ArrowRight className="ml-2 -mr-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
