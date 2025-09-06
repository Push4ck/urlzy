import React from "react";
import { Link } from "react-router-dom";
import { Zap, BarChart3, Palette, Lock, Smartphone, Rocket, Check, X } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description:
        "Shorten URLs instantly with our optimized algorithm and get redirects in milliseconds.",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Detailed Analytics",
      description:
        "Track clicks, geographic data, referrers, and more with our comprehensive analytics dashboard.",
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Custom Short Codes",
      description:
        "Create memorable, branded short links with custom codes that reflect your brand.",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Secure & Reliable",
      description:
        "Your links are safe with enterprise-grade security and 99.9% uptime guarantee.",
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile Optimized",
      description:
        "Perfect experience across all devices - desktop, tablet, and mobile.",
    },
    {
      icon: <Rocket className="w-8 h-8" />,
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
        "7-day link expiry",
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
        "Custom expiry dates (1 hour - 30 days)",
        "QR code generation",
        "API access",
        "Priority support",
        "Bulk upload",
      ],
      popular: true,
    },
  ];

  return (
    <div className="py-20 bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
            Powerful Features
          </h2>
          <p className="text-[var(--text-primary)] opacity-80 max-w-2xl mx-auto text-lg">
            Everything you need to manage, track, and optimize your links in one
            place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[var(--card-bg)] p-6 rounded-xl shadow-md border border-[var(--border-color)] hover-scale transition-transform duration-300"
            >
              <div className="text-4xl mb-4 text-[var(--text-secondary)]">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                {feature.title}
              </h3>
              <p className="text-[var(--text-primary)] opacity-80">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Pricing Tiers */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
            Choose Your Plan
          </h2>
          <p className="text-[var(--text-primary)] opacity-80 max-w-2xl mx-auto">
            Start free and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`bg-[var(--card-bg)] rounded-xl shadow-md border-2 p-8 relative ${
                tier.popular
                  ? "border-[var(--text-secondary)]"
                  : "border-[var(--border-color)]"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[var(--text-secondary)] text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  {tier.name}
                </h3>
                <div className="text-4xl font-bold text-[var(--text-secondary)] mb-2">
                  {tier.price}
                </div>
                {tier.price !== "Free" && (
                  <p className="text-[var(--text-primary)] opacity-60">billed monthly</p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-[var(--text-secondary)] mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-[var(--text-primary)] opacity-80">{feature}</span>
                  </li>
                ))}
                {tier.limitations &&
                  tier.limitations.map((limitation, limitIndex) => (
                    <li
                      key={`limit-${limitIndex}`}
                      className="flex items-start"
                    >
                      <X className="w-5 h-5 text-[var(--text-primary)] opacity-40 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-[var(--text-primary)] opacity-50 line-through">
                        {limitation}
                      </span>
                    </li>
                  ))}
              </ul>

              <div className="text-center">
                {tier.name === "Anonymous" ? (
                  <div className="text-sm text-[var(--text-primary)] opacity-60">
                    No registration required
                  </div>
                ) : tier.price === "Free" ? (
                  <Link
                    to="/register"
                    className="w-full bg-[var(--text-secondary)] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[var(--text-accent)] transition-colors block"
                  >
                    Get Started Free
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors block ${
                      tier.popular
                        ? "bg-[var(--text-secondary)] text-white hover:bg-[var(--text-accent)]"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--text-secondary)] hover:text-white"
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
        <div className="text-center mt-16 bg-[var(--text-secondary)] rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust URLzy for their link management
            needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-[var(--text-secondary)] px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Sign Up Free
            </Link>
            <Link
              to="/pricing"
              className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-[var(--text-secondary)] transition-colors"
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
