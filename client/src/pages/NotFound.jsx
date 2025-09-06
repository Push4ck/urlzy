import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search, AlertTriangle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-48 h-48 mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-10 animate-pulse"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-20 animate-pulse animation-delay-1000"></div>
              <div className="absolute inset-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-30 animate-pulse animation-delay-2000"></div>
              <div className="relative flex items-center justify-center w-full h-full">
                <AlertTriangle className="w-24 h-24 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            to="/"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Search Suggestion */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-gray-500 mr-2" />
            <span className="text-gray-700 font-medium">Looking for something specific?</span>
          </div>
          <p className="text-gray-600 text-sm">
            Try checking our{" "}
            <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
              homepage
            </Link>{" "}
            or use the navigation menu above.
          </p>
        </div>

        {/* Fun Element */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Lost in the digital wilderness? Don't worry, we've got you covered! 🗺️
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;