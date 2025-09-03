import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { API_ENDPOINTS, getApiUrl } from "../config/api";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: request, 2: verify
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Pre-fill and skip request if coming from register/login where backend already sent a code
  useEffect(() => {
    const emailParam = params.get("email");
    const skip = params.get("skipRequest");
    if (emailParam) setEmail(emailParam);
    if (emailParam && skip === "1") {
      setStep(2);
    }
  }, [params]);

  const requestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        getApiUrl(`${API_ENDPOINTS.AUTH}/verify-email/request`),
        { email }
      );
      toast.success("If the email exists, a code was sent.");
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send code";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(getApiUrl(`${API_ENDPOINTS.AUTH}/verify-email/verify`), {
        email,
        otp,
      });
      toast.success("Email verified. You can now sign in.");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid or expired code";
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
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 1
              ? "Enter your email to receive a verification code."
              : "Enter the 6-digit code sent to your email."}
          </p>
        </div>

        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={requestCode}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Code"}
              </button>
            </div>
            <div className="text-center text-sm">
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-500"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={verifyCode}>
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                6-digit Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter 6-digit code"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className="group inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
              <button
                type="button"
                onClick={requestCode}
                disabled={loading}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Resend Code
              </button>
            </div>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-gray-600 hover:text-gray-800"
              >
                Change email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
