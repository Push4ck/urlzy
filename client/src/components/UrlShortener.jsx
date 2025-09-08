import React, { useState } from "react";
import axios from "axios";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import { useAuth } from "../contexts/useAuth";
import {
  Link,
  Lock,
  Loader,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  Clock,
  Calendar,
  Info,
} from "lucide-react";

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

      if (user && customCode?.trim()) payload.customCode = customCode.trim();

      if (user && (user.premium || user.role === "admin") && password?.trim()) {
        payload.password = password.trim();
      }

      if (user && (user.premium || user.role === "admin") && expiresAt) {
        payload.expiresAt = expiresAt;
      }

      const response = await axios.post(
        getApiUrl(API_ENDPOINTS.SHORTEN),
        payload
      );

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
      // Handle error silently
    }
  };

  const testRedirect = () => {
    if (shortUrl) window.open(shortUrl, "_blank");
  };

  return (
    <section
      id="shortener"
      className="py-12 xs:py-16 sm:py-20 bg-[var(--clr-surface-a0)] transition-colors"
    >
      <div className="container mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 xs:mb-12 sm:mb-16">
          <h2 className="text-3xl xs:text-4xl sm:text-5xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4 xs:mb-6">
            Shorten Your URL
          </h2>
          <p className="text-lg xs:text-xl text-[var(--clr-surface-a50)] max-w-3xl mx-auto leading-relaxed">
            Paste your long URL below and get a shortened version instantly.
            {!user
              ? " Anonymous users get 3 days expiry."
              : !user.premium && user.role !== "admin"
              ? " Free users get 7 days expiry with custom codes."
              : " Premium users get up to 30 days expiry with all features."}
          </p>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto mb-8 xs:mb-12 sm:mb-16">
          <div className="bg-[var(--clr-surface-a0)] p-8 shadow-lg rounded-xl border border-[var(--clr-surface-a20)] transition-colors">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label
                  htmlFor="originalUrl"
                  className="block mb-4 text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
                >
                  Long URL *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    id="originalUrl"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="https://example.com/very/long/url"
                    required
                    className="w-full pl-12 pr-4 py-4 text-lg border border-[var(--clr-surface-a30)] bg-[var(--clr-surface-a0)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] rounded-lg focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-[var(--clr-primary-a0)] transition-colors placeholder:text-[var(--clr-surface-a40)]"
                  />
                  <Link className="absolute left-4 top-4 w-6 h-6 text-[var(--clr-primary-a0)]" />
                </div>
              </div>

              {/* Custom Code */}
              {user ? (
                <div>
                  <label
                    htmlFor="customCode"
                    className="block text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4"
                  >
                    Custom Short Code (Optional)
                  </label>
                  <div className="flex flex-col sm:flex-row rounded-lg overflow-hidden border border-[var(--clr-surface-a30)]">
                    <span className="inline-flex items-center px-6 py-4 bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-medium border-b sm:border-b-0 sm:border-r border-[var(--clr-surface-a30)]">
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
                      placeholder="custom-path"
                      className="flex-1 px-4 py-4 bg-[var(--clr-surface-a0)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-[var(--clr-primary-a0)] transition-colors placeholder:text-[var(--clr-surface-a40)]"
                    />
                  </div>
                  <p className="text-sm text-[var(--clr-surface-a50)] mt-3">
                    3–20 characters. Allowed: letters, numbers, underscores,
                    hyphens
                  </p>
                </div>
              ) : (
                <div className="bg-[var(--clr-surface-tonal-a10)] p-6 border border-[var(--clr-surface-tonal-a20)] rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-[var(--clr-primary-a0)]">
                      <Info className="w-5 h-5 text-[var(--clr-light-a0)]" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2 text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                        Custom Short Codes
                      </h4>
                      <p className="text-[var(--clr-surface-a50)]">
                        Log in to create custom short codes for your URLs.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Premium Password */}
              {user && (user.premium || user.role === "admin") && (
                <div>
                  <label
                    htmlFor="password"
                    className="block text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4"
                  >
                    Password Protection (Premium Feature)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Set a password to protect this link"
                      className="w-full pl-12 pr-4 py-4 border border-[var(--clr-surface-a30)] bg-[var(--clr-surface-a0)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] rounded-lg focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-[var(--clr-primary-a0)] transition-colors placeholder:text-[var(--clr-surface-a40)]"
                    />
                    <Lock className="absolute left-4 top-4 w-6 h-6 text-[var(--clr-primary-a0)]" />
                  </div>
                  <p className="text-sm text-[var(--clr-surface-a50)] mt-3">
                    Visitors must enter this password to open the link.
                  </p>
                </div>
              )}

              {/* Premium Expiry */}
              {user && (user.premium || user.role === "admin") && (
                <div>
                  <label
                    htmlFor="expiresAt"
                    className="block text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4"
                  >
                    Custom Expiry Date (Premium Feature)
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      id="expiresAt"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      min={new Date(Date.now() + 1 * 60 * 1000)
                        .toISOString()
                        .slice(0, 16)}
                      max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .slice(0, 16)}
                      className="w-full pl-12 pr-4 py-4 border border-[var(--clr-surface-a30)] bg-[var(--clr-surface-a0)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] rounded-lg focus:ring-2 focus:ring-[var(--clr-primary-a0)] focus:border-[var(--clr-primary-a0)] transition-colors"
                    />
                    <Calendar className="absolute left-4 top-4 w-6 h-6 text-[var(--clr-primary-a0)]" />
                  </div>
                  <p className="text-sm text-[var(--clr-surface-a50)] mt-3">
                    Set custom expiry up to 30 days. Leave empty for default.
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !originalUrl}
                className="bg-[var(--clr-primary-a0)] text-[var(--clr-light-a0)] w-full py-4 text-lg font-semibold rounded-lg hover:bg-[var(--clr-primary-a10)] dark:hover:bg-[var(--clr-primary-darker)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <Loader className="animate-spin w-6 h-6" />
                    Shortening...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    Shorten URL
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </button>
            </form>

            {/* Error */}
            {error && (
              <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-800">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-red-700 dark:text-red-300 font-medium">
                    {error}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        {shortUrl && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-[var(--clr-surface-a0)] p-8 shadow-lg rounded-xl border border-[var(--clr-surface-tonal-a20)] transition-colors">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-lg bg-[var(--clr-primary-a0)]">
                  <CheckCircle className="w-8 h-8 text-[var(--clr-light-a0)]" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                  Your URL has been shortened!
                </h3>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
                      Short URL:
                    </p>
                    <div className="bg-[var(--clr-surface-a10)] p-6 rounded-lg border border-[var(--clr-surface-a20)]">
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono break-all text-xl text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-a10)] dark:hover:text-[var(--clr-primary-a20)] transition-colors"
                      >
                        {shortUrl}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={copyToClipboard}
                      className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                        copied
                          ? "bg-[var(--clr-surface-a20)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] hover:bg-[var(--clr-surface-a30)]"
                          : "bg-[var(--clr-primary-a0)] text-[var(--clr-light-a0)] hover:bg-[var(--clr-primary-a10)] dark:hover:bg-[var(--clr-primary-darker)] shadow-md hover:shadow-lg"
                      }`}
                    >
                      <Copy className="w-5 h-5 mr-2" />
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={testRedirect}
                      className="flex items-center bg-[var(--clr-surface-a20)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] px-6 py-3 rounded-lg hover:bg-[var(--clr-surface-a30)] transition-colors shadow-md hover:shadow-lg cursor-pointer"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Test
                    </button>
                  </div>
                </div>

                {urlData && (
                  <div className="bg-[var(--clr-surface-a10)] p-6 rounded-lg border border-[var(--clr-surface-a20)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-[var(--clr-primary-a0)]" />
                        <div>
                          <span className="font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                            Created:
                          </span>
                          <div className="text-[var(--clr-surface-a50)]">
                            {new Date(urlData.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-[var(--clr-primary-a0)]" />
                        <div>
                          <span className="font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                            Expires:
                          </span>
                          <div className="text-[var(--clr-surface-a50)]">
                            {urlData.expiresAt
                              ? new Date(urlData.expiresAt).toLocaleString()
                              : "Never"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-[var(--clr-surface-a30)]">
                      <div className="flex items-start gap-3">
                        <Link className="w-5 h-5 mt-1 text-[var(--clr-primary-a0)]" />
                        <div className="flex-1">
                          <span className="font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                            Original URL:
                          </span>
                          <div className="break-all mt-2 text-[var(--clr-surface-a50)] bg-[var(--clr-surface-a0)] p-4 rounded-lg border border-[var(--clr-surface-a20)]">
                            {urlData.originalUrl}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default UrlShortener;
