 import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative bg-[var(--bg-primary)] text-[var(--text-primary)]">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-[var(--text-primary)]">
              Shorten Your URLs
              <span className="block text-[var(--text-secondary)]">
                Expand Your Reach
              </span>
            </h1>

            <p className="text-lg md:text-xl mb-10 text-[var(--text-primary)] opacity-80 max-w-4xl mx-auto leading-relaxed">
              Transform long, complicated URLs into short, shareable links. Track
              clicks, analyze traffic, and boost your online presence with powerful analytics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <Link
              to="/register"
              className="bg-[var(--text-secondary)] text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-[var(--text-accent)] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started Free
              <ArrowRight className="inline-block ml-2" />
            </Link>
            <a
              href="#shortener"
              className="border-2 border-[var(--text-secondary)] text-[var(--text-secondary)] px-10 py-4 rounded-xl text-lg font-bold hover:bg-[var(--text-secondary)] hover:text-white transition-all duration-300"
            >
              Try It Now
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="retro-card rounded-2xl p-6 hover-scale transition-transform duration-300">
              <div className="text-3xl md:text-4xl font-bold text-[var(--text-secondary)] mb-2">5M+</div>
              <div className="text-[var(--text-primary)] opacity-70 font-medium">Links Shortened</div>
            </div>
            <div className="retro-card rounded-2xl p-6 hover-scale transition-transform duration-300">
              <div className="text-3xl md:text-4xl font-bold text-[var(--text-secondary)] mb-2">1M+</div>
              <div className="text-[var(--text-primary)] opacity-70 font-medium">Monthly Clicks</div>
            </div>
            <div className="retro-card rounded-2xl p-6 hover-scale transition-transform duration-300">
              <div className="text-3xl md:text-4xl font-bold text-[var(--text-secondary)] mb-2">50K+</div>
              <div className="text-[var(--text-primary)] opacity-70 font-medium">Happy Users</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
