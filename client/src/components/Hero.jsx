import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative bg-gray-50 text-gray-900">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-gray-900">
              Shorten Your URLs
              <span className="block text-indigo-600">
                Expand Your Reach
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-10 text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Transform long, complicated URLs into short, shareable links. Track
              clicks, analyze traffic, and boost your online presence with powerful analytics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <Link
              to="/register"
              className="bg-indigo-600 text-white px-10 py-4 rounded-xl text-lg font-bold shadow-md"
            >
              Get Started Free
              <ArrowRight className="inline-block ml-2" />
            </Link>
            <a
              href="#shortener"
              className="border-2 border-gray-300 text-gray-700 px-10 py-4 rounded-xl text-lg font-bold shadow-md"
            >
              Try It Now
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="text-4xl font-bold text-indigo-600 mb-2">5M+</div>
              <div className="text-gray-700 font-medium">Links Shortened</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="text-4xl font-bold text-indigo-600 mb-2">1M+</div>
              <div className="text-gray-700 font-medium">Monthly Clicks</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="text-4xl font-bold text-indigo-600 mb-2">50K+</div>
              <div className="text-gray-700 font-medium">Happy Users</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
