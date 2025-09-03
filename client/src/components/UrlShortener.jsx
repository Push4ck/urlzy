import React, { useState } from "react";
import axios from "axios";
import { getApiUrl, API_ENDPOINTS } from "../config/api";

const UrlShortener = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [urlData, setUrlData] = useState(null);
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShortUrl("");
    setUrlData(null);

    try {
      const response = await axios.post(getApiUrl(API_ENDPOINTS.SHORTEN), {
        originalUrl,
        customCode: customCode || undefined,
        password: password || undefined,
      });

      if (response.data.success) {
        setShortUrl(response.data.data.shortUrl);
        setUrlData(response.data.data);
        setOriginalUrl("");
        setCustomCode("");
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
      // Simple feedback
      const button = document.getElementById("copy-btn");
      const originalText = button.textContent;
      button.textContent = "Copied!";
      button.className = button.className.replace(
        "bg-indigo-600",
        "bg-green-600"
      );

      setTimeout(() => {
        button.textContent = originalText;
        button.className = button.className.replace(
          "bg-green-600",
          "bg-indigo-600"
        );
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy. Please select and copy manually.");
    }
  };

  const testRedirect = () => {
    if (shortUrl) {
      window.open(shortUrl, "_blank");
    }
  };

  return (
    <section id="shortener" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Shorten Your URL
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Paste your long URL below and get a shortened version instantly.
            Anonymous users can create up to 5 URLs per day.
          </p>
        </div>

        {/* URL Shortener Form */}
        <div className="bg-gray-50 rounded-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="originalUrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Long URL *
              </label>
              <input
                type="url"
                id="originalUrl"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/very/long/url/that/needs/shortening"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="customCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Custom Short Code (Optional)
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-sm">
                  urlzy.netlify.app/
                </span>
                <input
                  type="text"
                  id="customCode"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="my-link"
                  pattern="[a-zA-Z0-9]+"
                  title="Only letters and numbers allowed"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                3-20 characters, letters and numbers only
              </p>
            </div>

            {/* Optional Password */
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password (Optional)
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set a password to protect this short link"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                If set, visitors must enter this password to open the link.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !originalUrl}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Shortening...
                </span>
              ) : (
                "Shorten URL"
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        {shortUrl && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              🎉 Your URL has been shortened!
            </h3>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Short URL:</p>
                  <div className="bg-white p-3 rounded border flex-1">
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 font-mono break-all"
                    >
                      {shortUrl}
                    </a>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    id="copy-btn"
                    onClick={copyToClipboard}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Copy
                  </button>
                  <button
                    onClick={testRedirect}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    Test
                  </button>
                </div>
              </div>

              {urlData && (
                <div className="text-sm text-gray-600 bg-white p-4 rounded border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(urlData.createdAt).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Expires:</span>{" "}
                      {urlData.expiresAt
                        ? new Date(urlData.expiresAt).toLocaleDateString()
                        : "Never"}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="font-medium">Original URL:</span>
                    <div className="break-all text-xs mt-1 text-gray-500">
                      {urlData.originalUrl}
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
