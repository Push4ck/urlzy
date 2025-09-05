import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 opacity-20 animate-pulse" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
                         radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px)`,
        backgroundSize: '60px 60px'
      }}></div>
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/30 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Shorten Your URLs
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Expand Your Reach
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-10 text-indigo-100 max-w-4xl mx-auto leading-relaxed">
              Transform long, complicated URLs into short, shareable links. Track
              clicks, analyze traffic, and boost your online presence with powerful analytics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16 animate-fade-in-up animation-delay-200">
            <Link
              to="/register"
              className="group bg-white text-indigo-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started Free
              <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#shortener"
              className="group border-2 border-white/80 text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-white hover:text-indigo-600 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
            >
              Try It Now
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center animate-fade-in-up animation-delay-400">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-bold text-yellow-300 mb-2">5M+</div>
              <div className="text-indigo-200 font-medium">Links Shortened</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-bold text-yellow-300 mb-2">1M+</div>
              <div className="text-indigo-200 font-medium">Monthly Clicks</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl font-bold text-yellow-300 mb-2">50K+</div>
              <div className="text-indigo-200 font-medium">Happy Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Wave separator */}
      <div className="relative">
        <svg
          className="absolute bottom-0 w-full h-8 -mb-1 text-white"
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
