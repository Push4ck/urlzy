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

      // Only include customCode if user is logged in and has entered something
      if (user && customCode && customCode.trim()) {
        payload.customCode = customCode.trim();
      }

      // Only include password if user is logged in and has entered something
      if (user && password && password.trim()) {
        payload.password = password.trim();
      }

      // Only include expiresAt if user is admin and has selected something
      if (user && user.role === 'admin' && expiresAt) {
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
      className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500 rounded-full blur-xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Shorten Your URL
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Paste your long URL below and get a shortened version instantly.
            Anonymous users can create up to 5 URLs per day.
          </p>
        </div>

        {/* URL Shortener Form */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 mb-8 shadow-2xl border border-white/20 animate-fade-in-up animation-delay-200 hover:shadow-3xl transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="originalUrl"
                className="block text-sm font-semibold text-gray-700 mb-3"
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
                  className="w-full px-4 py-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 text-gray-900 placeholder-gray-400"
                />
                <Link className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label
                htmlFor="customCode"
                className="block text-sm font-semibold text-gray-700 mb-3"
              >
                Custom Short Code (Optional)
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 text-sm font-medium">
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
                  className={`flex-1 px-4 py-4 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 ${
                    !user ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  disabled={!user}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                3–20 characters. Allowed: letters, numbers, underscores, hyphens
                {!user ? " — log in to use custom codes" : ""}
              </p>
            </div>

            {/* Optional Password */}
            {/* Expiry Date Selection for Admin Users */}
            {user && user.role === 'admin' && (
              <div>
                <label
                  htmlFor="expiresAt"
                  className="block text-sm font-semibold text-gray-700 mb-3"
                >
                  Expiry Date (Optional)
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    id="expiresAt"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    min={new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                    max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Set when this link should expire (1 hour to 30 days from now). Leave empty for no expiration.
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-3"
              >
                Password (Optional)
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set a password to protect this short link"
                  className={`w-full px-4 py-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 ${
                    !user ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  disabled={!user}
                />
                <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                If set, visitors must enter this password to open the link.
                {!user ? " — log in to use password protection" : ""}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !originalUrl}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
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
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-3xl p-8 animate-fade-in-up shadow-2xl backdrop-blur-sm">
            <h3 className="text-2xl md:text-3xl font-bold text-green-800 mb-6 flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-4 shadow-lg animate-pulse">
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
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-sm">
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
                    className={`bg-gradient-to-r ${
                      copied
                        ? "from-green-600 to-green-600"
                        : "from-indigo-600 to-purple-600"
                    } text-white px-6 py-3 rounded-xl hover:opacity-95 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105`}
                  >
                    <Copy className="w-4 h-4 mr-2 inline" />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={testRedirect}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <ExternalLink className="w-4 h-4 mr-2 inline" />
                    Test
                  </button>
                </div>
              </div>

              {urlData && (
                <div className="text-sm bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-gray-200 shadow-sm">
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
