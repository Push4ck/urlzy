import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Shorten Your URLs
            <span className="block text-yellow-300">Expand Your Reach</span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-indigo-100 max-w-3xl mx-auto">
            Transform long, complicated URLs into short, shareable links. Track
            clicks, analyze traffic, and boost your online presence.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link
              to="/register"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </Link>
            <a
              href="#shortener"
              className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Try It Now
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-yellow-300">5M+</div>
              <div className="text-indigo-200">Links Shortened</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300">1M+</div>
              <div className="text-indigo-200">Monthly Clicks</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300">50K+</div>
              <div className="text-indigo-200">Happy Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="relative">
        <svg
          className="absolute bottom-0 w-full h-6 -mb-1 text-white"
          preserveAspectRatio="none"
          viewBox="0 0 1440 54"
        >
          <path
            fill="currentColor"
            d="M0 22L120 16.7C240 11 480 1 720 0C960 1 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z"
          />
        </svg>
      </div>
    </div>
  );
};

export default Hero;
