import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Facebook, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <span className="text-3xl font-bold text-indigo-400">
                URLzy
              </span>
            </div>
            <p className="text-gray-300 mb-8 max-w-md leading-relaxed">
              The most powerful URL shortener with advanced analytics, custom
              domains, and enterprise-grade reliability. Join thousands of users
              who trust us.
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-300"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-indigo-400">
              Product
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/pricing"
                  className="text-gray-300"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300"
                >
                  API Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300"
                >
                  Integrations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300"
                >
                  Browser Extension
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-indigo-400">
              Support
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-gray-300"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300"
                >
                  Status Page
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300"
                >
                  Feature Request
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 URLzy. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
            <a
              href="#"
              className="text-gray-400"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-400"
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
