import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Facebook, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <span className="text-3xl font-bold text-[var(--text-secondary)]">
                URLzy
              </span>
            </div>
            <p className="text-[var(--text-primary)] opacity-80 mb-8 max-w-md leading-relaxed">
              The most powerful URL shortener with advanced analytics, custom
              domains, and enterprise-grade reliability. Join thousands of users
              who trust us.
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center text-[var(--text-primary)] opacity-70 hover:opacity-100 transition-opacity"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center text-[var(--text-primary)] opacity-70 hover:opacity-100 transition-opacity"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center text-[var(--text-primary)] opacity-70 hover:opacity-100 transition-opacity"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-[var(--text-secondary)]">
              Product
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/pricing"
                  className="text-[var(--text-primary)] opacity-80 hover:opacity-100 transition-opacity"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[var(--text-primary)] opacity-80 hover:opacity-100 transition-opacity"
                >
                  API Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[var(--text-primary)] opacity-80 hover:opacity-100 transition-opacity"
                >
                  Integrations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[var(--text-primary)] opacity-80 hover:opacity-100 transition-opacity"
                >
                  Browser Extension
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-[var(--text-secondary)]">
              Support
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-[var(--text-primary)] opacity-80 hover:opacity-100 transition-opacity"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[var(--text-primary)] opacity-80 hover:opacity-100 transition-opacity"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[var(--text-primary)] opacity-80 hover:opacity-100 transition-opacity"
                >
                  Status Page
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[var(--text-primary)] opacity-80 hover:opacity-100 transition-opacity"
                >
                  Feature Request
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[var(--text-primary)] opacity-60 text-sm mb-4 md:mb-0">
            © 2024 URLzy. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
            <a
              href="#"
              className="text-[var(--text-primary)] opacity-60 hover:opacity-100 transition-opacity"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-[var(--text-primary)] opacity-60 hover:opacity-100 transition-opacity"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-[var(--text-primary)] opacity-60 hover:opacity-100 transition-opacity"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
