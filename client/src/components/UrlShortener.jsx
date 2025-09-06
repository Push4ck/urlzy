import React, { useState } from "react";
import axios from "axios";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import { useAuth } from "../contexts/useAuth";
import { Link, Lock, Loader, ArrowRight, AlertTriangle, CheckCircle, Copy, ExternalLink, Clock, Calendar } from "lucide-react";

const UrlShortener = () => {
  const { user } = useAuth();
  const [originalUrl, setOriginalUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [urlData, setUrlData] = useState(null);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShortUrl("");
    setUrlData(null);

    try {
      const payload = { originalUrl };

      // Include customCode for logged in users
      if (user && customCode && customCode.trim()) {
        payload.customCode = customCode.trim();
      }

      // Include password for premium users and admins
      if (user && (user.premium || user.role === 'admin') && password && password.trim()) {
        payload.password = password.trim();
      }

      // Include custom expiry for premium users and admins
      if (user && (user.premium || user.role === 'admin') && expiresAt) {
        payload.expiresAt = expiresAt;
      }

      const response = await axios.post(getApiUrl(API_ENDPOINTS.SHORTEN), payload);

      if (response.data.success) {
        setShortUrl(response.data.data.shortUrl);
        setUrlData(response.data.data);
        setOriginalUrl("");
        setCustomCode("");
        setPassword("");
        setExpiresAt("");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const testRedirect = () => {
    if (shortUrl) {
      window.open(shortUrl, "_blank");
    }
  };

  return (
    <section
      id="shortener"
      className="py-20 bg-[var(--bg-primary)]"
    >

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-secondary)] mb-4">
            Shorten Your URL
          </h2>
          <p className="text-base md:text-lg text-[var(--text-primary)] opacity-80 max-w-2xl mx-auto leading-relaxed">
            Paste your long URL below and get a shortened version instantly.
            {!user ? "Anonymous users get 3 days expiry." :
             !user.premium && user.role !== 'admin' ? "Free users get 7 days expiry with custom codes." :
             "Premium users get up to 30 days expiry with all features."}
          </p>
        </div>

        {/* URL Shortener Form */}
        <div className="bg-[var(--card-bg)] rounded-3xl p-8 mb-8 shadow-md border border-[var(--border-color)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="originalUrl"
                className="block text-sm font-semibold text-[var(--text-primary)] mb-3"
              >
                Long URL *
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="originalUrl"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://example.com/very/long/url/that/needs/shortening"
                  required
                  className="w-full px-4 py-4 pl-12 border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--text-secondary)] focus:border-[var(--text-secondary)] transition-all duration-200 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-primary)] opacity-60"
                />
                <Link className="absolute left-4 top-4 w-5 h-5 text-[var(--text-primary)] opacity-50" />
              </div>
            </div>

            {/* Custom Code - Available for logged in users */}
            {user && (
              <div>
                <label
                  htmlFor="customCode"
                  className="block text-sm font-semibold text-gray-700 mb-3"
                >
                  Custom Short Code (Optional)
                </label>
                <div className="flex flex-col sm:flex-row">
                  <span className="inline-flex items-center px-3 sm:px-4 lg:rounded-t-xl sm:rounded-l-xl sm:rounded-t-none border border-b-0 sm:border-b sm:border-r-0 border-gray-300 bg-gray-100 text-gray-600 text-sm font-medium min-w-0 truncate">
                    {import.meta.env.VITE_SHORT_BASE_URL ||
                      window.location?.host ||
                      "urlzy.netlify.app"}
                    /
                  </span>
                  <input
                    type="text"
                    id="customCode"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="custom path segment (e.g., 123, my.link, promo-2025)"
                    className="flex-1 px-4 py-4 border border-gray-300 rounded-b-xl sm:rounded-r-xl sm:rounded-b-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  3–20 characters. Allowed: letters, numbers, underscores, hyphens
                </p>
              </div>
            )}

            {/* Custom Code Notice for Anonymous Users */}
            {!user && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                  <div className="w-5 h-5 text-blue-600 mr-3 mt-0.5">ℹ️</div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800 mb-1">
                      Custom Short Codes
                    </h4>
                    <p className="text-xs text-blue-700">
                      Log in to create custom short codes for your URLs.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Password Protection - Premium Feature */}
            {user && (user.premium || user.role === 'admin') && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-3"
                >
                  Password Protection (Premium Feature)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set a password to protect this short link"
                    className="w-full px-4 py-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50"
                  />
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  If set, visitors must enter this password to open the link.
                </p>
              </div>
            )}

            {/* Password Feature Notice for Free Users */}
            {user && !user.premium && user.role !== 'admin' && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start">
                  <Lock className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-800 mb-1">
                      Premium Feature: Password Protection
                    </h4>
                    <p className="text-xs text-amber-700">
                      Upgrade to premium to protect your links with passwords.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Expiry - Premium Feature */}
            {user && (user.premium || user.role === 'admin') && (
              <div>
                <label
                  htmlFor="expiresAt"
                  className="block text-sm font-semibold text-gray-300 mb-3"
                >
                  Custom Expiry Date (Premium Feature)
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    id="expiresAt"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    min={new Date(Date.now() + 1 * 60 * 1000).toISOString().slice(0, 16)}
                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Set custom expiry up to 30 days. Leave empty for default expiry.
                </p>
              </div>
            )}

            {/* Custom Expiry Notice for Free Users */}
            {user && !user.premium && user.role !== 'admin' && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start">
                  <div className="w-5 h-5 text-purple-600 mr-3 mt-0.5">⏰</div>
                  <div>
                    <h4 className="text-sm font-semibold text-purple-800 mb-1">
                      Premium Feature: Custom Expiry
                    </h4>
                    <p className="text-xs text-purple-700">
                      Upgrade to premium to set custom expiry dates up to 30 days.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !originalUrl}
              className="w-full bg-[var(--text-secondary)] text-white py-4 px-6 rounded-xl font-bold disabled:bg-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:bg-[var(--text-accent)] transition-all duration-300"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Shortening...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Shorten URL
                  <ArrowRight className="ml-2 -mr-1 w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl animate-fade-in-up">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-3 text-red-500" />
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        {shortUrl && (
          <div className="bg-[var(--card-bg)] border border-[var(--text-secondary)] rounded-3xl p-8 shadow-md">
            <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-secondary)] mb-6 flex items-center">
              <div className="p-3 bg-[var(--text-secondary)] rounded-xl mr-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              Your URL has been shortened!
            </h3>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Short URL:
                  </p>
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 font-mono break-all text-lg"
                    >
                      {shortUrl}
                    </a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={copyToClipboard}
                    className={`${
                      copied
                        ? "bg-[var(--text-accent)]"
                        : "bg-[var(--text-secondary)]"
                    } text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md hover:bg-[var(--text-accent)] transition-all duration-300`}
                  >
                    <Copy className="w-4 h-4 mr-2 inline" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={testRedirect}
                    className="bg-[var(--text-primary)] opacity-70 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-md hover:opacity-80 transition-all duration-300"
                  >
                    <ExternalLink className="w-4 h-4 mr-2 inline" />
                    Test
                  </button>
                </div>
              </div>

              {urlData && (
                <div className="text-sm bg-white p-6 rounded-xl border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      <div>
                        <span className="font-semibold text-gray-700">
                          Created:
                        </span>
                        <div className="text-gray-600">
                          {new Date(urlData.createdAt).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            timeZoneName: 'short'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <div>
                        <span className="font-semibold text-gray-700">
                          Expires:
                        </span>
                        <div className="text-gray-600">
                          {urlData.expiresAt
                            ? new Date(urlData.expiresAt).toLocaleString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                timeZoneName: 'short'
                              })
                            : "Never"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-start">
                      <Link className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                      <div className="flex-1">
                        <span className="font-semibold text-gray-700">
                          Original URL:
                        </span>
                        <div className="break-all text-sm mt-1 text-gray-600 bg-gray-50 p-2 rounded-lg">
                          {urlData.originalUrl}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default UrlShortener;

