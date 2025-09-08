import React, { useMemo, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";

const LoginVerify = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const loginToken = useMemo(() => params.get("token") || "", [params]);
  const email = useMemo(() => params.get("email") || "", [params]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        getApiUrl(`${API_ENDPOINTS.AUTH}/login/verify-otp`),
        {
          loginToken,
          otp,
        }
      );
      const data = res?.data?.data;
      if (data?.token && data?.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        toast.success("Logged in successfully");
        navigate("/dashboard");
        return;
      }
      toast.error("Verification failed");
    } catch (err) {
      const msg = err?.response?.data?.message || "Invalid or expired code";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[var(--text-secondary)]/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[var(--text-accent)]/20 blur-3xl" />
      </div>

      <div className="relative max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--text-primary)]">
            Two-factor verification
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
            Enter the 6-digit code we sent to {email || "your email"}.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={submit}>
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-[var(--text-primary)]"
            >
              6-digit code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="\\d{6}"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-[var(--border-color)] placeholder-[color:var(--text-primary)]/50 text-[var(--text-primary)] bg-[var(--bg-secondary)] rounded-md sm:text-sm"
              placeholder="Enter code"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="retro-btn group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
          <div className="text-center text-sm">
            <Link to="/login" className="text-[var(--text-secondary)] hover:text-[var(--text-accent)]">
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginVerify;
