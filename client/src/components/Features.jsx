import React from "react";
import { Link } from "react-router-dom";

const Features = () => {
  const features = [
    {
      icon: "⚡",
      title: "Lightning Fast",
      description:
        "Shorten URLs instantly with our optimized algorithm and get redirects in milliseconds.",
    },
    {
      icon: "📊",
      title: "Detailed Analytics",
      description:
        "Track clicks, geographic data, referrers, and more with our comprehensive analytics dashboard.",
    },
    {
      icon: "🎨",
      title: "Custom Short Codes",
      description:
        "Create memorable, branded short links with custom codes that reflect your brand.",
    },
    {
      icon: "🔒",
      title: "Secure & Reliable",
      description:
        "Your links are safe with enterprise-grade security and 99.9% uptime guarantee.",
    },
    {
      icon: "📱",
      title: "Mobile Optimized",
      description:
        "Perfect experience across all devices - desktop, tablet, and mobile.",
    },
    {
      icon: "🚀",
      title: "API Access",
      description:
        "Integrate URL shortening into your applications with our powerful REST API.",
    },
  ];

  const tiers = [
    {
      name: "Anonymous",
      price: "Free",
      features: [
        "5 URLs per day",
        "Basic redirects",
        "30-day link expiry",
        "No registration required",
      ],
      limitations: ["No analytics", "No custom codes", "Limited support"],
    },
    {
      name: "Free Account",
      price: "Free",
      features: [
        "100 total URLs",
        "50 URLs per day",
        "Custom short codes",
        "Basic analytics",
        "No expiration",
        "URL management",
      ],
      popular: false,
    },
    {
      name: "Premium",
      price: "$9.99/month",
      features: [
        "Unlimited URLs",
        "Advanced analytics",
        "Custom domains",
        "Password-protected links",
        "QR code generation",
        "API access",
        "Priority support",
        "Bulk upload",
      ],
      popular: true,
    },
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage, track, and optimize your links in one
            place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Pricing Tiers */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Start free and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-sm border-2 p-8 relative ${
                tier.popular
                  ? "border-indigo-500 transform scale-105"
                  : "border-gray-100"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  {tier.price}
                </div>
                {tier.price !== "Free" && (
                  <p className="text-gray-500">billed monthly</p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
                {tier.limitations &&
                  tier.limitations.map((limitation, limitIndex) => (
                    <li
                      key={`limit-${limitIndex}`}
                      className="flex items-start"
                    >
                      <svg
                        className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-500 line-through">
                        {limitation}
                      </span>
                    </li>
                  ))}
              </ul>

              <div className="text-center">
                {tier.name === "Anonymous" ? (
                  <div className="text-sm text-gray-500">
                    No registration required
                  </div>
                ) : tier.price === "Free" ? (
                  <Link
                    to="/register"
                    className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors block"
                  >
                    Get Started Free
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors block ${
                      tier.popular
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                    }`}
                  >
                    Upgrade to Premium
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 bg-indigo-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust URLzy for their link management
            needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Sign Up Free
            </Link>
            <Link
              to="/pricing"
              className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
