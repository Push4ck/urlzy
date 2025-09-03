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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Two-factor verification
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit code we sent to {email || "your email"}.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={submit}>
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700"
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
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Enter code"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
          <div className="text-center text-sm">
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginVerify;
