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
    <div className="min-h-screen flex items-center justify-center bg-[var(--clr-surface-a0)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--clr-surface-a50)]">
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
                className="block text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-[var(--clr-surface-a30)] placeholder-[var(--clr-surface-a50)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] bg-[var(--clr-surface-a10)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent sm:text-sm transition-colors"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-[var(--clr-light-a0)] bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--clr-primary-a0)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {loading ? "Sending..." : "Send Code"}
              </button>
            </div>
            <div className="text-center text-sm">
              <Link
                to="/login"
                className="text-[var(--clr-surface-a50)] hover:text-[var(--clr-primary-a0)] transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="mt-8 space-y-6" noValidate onSubmit={verifyCode}>
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
              >
                6-digit Code
              </label>
              <input
                id="otp"
                name="otp"
                type="tel"
                inputMode="numeric"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-[var(--clr-surface-a30)] placeholder-[var(--clr-surface-a50)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] bg-[var(--clr-surface-a10)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-transparent sm:text-sm transition-colors"
                placeholder="Enter 6-digit code"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className="group inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[var(--clr-light-a0)] bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--clr-primary-a0)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
              <button
                type="button"
                onClick={requestCode}
                disabled={loading}
                className="text-sm text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] disabled:opacity-50 transition-colors cursor-pointer"
              >
                Resend Code
              </button>
            </div>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[var(--clr-surface-a50)] hover:text-[var(--clr-primary-a0)] transition-colors cursor-pointer"
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
