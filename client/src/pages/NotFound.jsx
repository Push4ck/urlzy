import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search, AlertTriangle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a0)] px-4 transition-colors duration-300">
      <div className="text-center max-w-2xl mx-auto">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-[var(--clr-primary-a0)]/10 dark:bg-[var(--clr-primary-a10)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-16 h-16 text-[var(--clr-primary-a0)] dark:text-[var(--clr-primary-a10)]" />
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-8xl lg:text-9xl font-bold text-[var(--clr-primary-a0)] dark:text-[var(--clr-primary-a10)] mb-4">
          404
        </h1>

        <h2 className="text-3xl lg:text-4xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
          Page Not Found
        </h2>

        <p className="text-lg text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a50)] mb-8 max-w-md mx-auto leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-semibold rounded-lg border border-[var(--clr-surface-a30)] dark:border-[var(--clr-surface-a20)] hover:bg-[var(--clr-surface-tonal-a0)] dark:hover:bg-[var(--clr-surface-a20)] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-[var(--clr-surface-a30)] dark:border-[var(--clr-surface-a20)]">
          <p className="text-sm text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a40)] mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link
              to="/about"
              className="text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] dark:text-[var(--clr-primary-a10)] dark:hover:text-[var(--clr-primary-a0)] font-medium transition-colors duration-300"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] dark:text-[var(--clr-primary-a10)] dark:hover:text-[var(--clr-primary-a0)] font-medium transition-colors duration-300"
            >
              Contact
            </Link>
            <Link
              to="/pricing"
              className="text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] dark:text-[var(--clr-primary-a10)] dark:hover:text-[var(--clr-primary-a0)] font-medium transition-colors duration-300"
            >
              Pricing
            </Link>
            <Link
              to="/help"
              className="text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] dark:text-[var(--clr-primary-a10)] dark:hover:text-[var(--clr-primary-a0)] font-medium transition-colors duration-300"
            >
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
