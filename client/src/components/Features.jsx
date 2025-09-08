import React from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  BarChart3,
  Palette,
  Lock,
  Smartphone,
  Rocket,
  Check,
  X,
  Star,
  ArrowRight,
} from "lucide-react";

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
      period: "forever",
      description: "Perfect for quick links",
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
      period: "forever",
      description: "Great for personal use",
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
      price: "$9.99",
      period: "per month",
      description: "Best for professionals and teams",
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
    <div className="py-12 xs:py-16 sm:py-20 bg-[var(--clr-surface-a0)] transition-colors">
      <div className="container mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
        {/* Features Section */}
        <div className="text-center mb-12 xs:mb-16 sm:mb-20">
          <h2 className="text-3xl xs:text-4xl sm:text-5xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4 xs:mb-6">
            Powerful Features
          </h2>
          <p className="text-lg xs:text-xl text-[var(--clr-surface-a50)] max-w-3xl mx-auto leading-relaxed">
            Everything you need to manage, track, and optimize your links in one
            powerful platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8 mb-16 xs:mb-24 sm:mb-32">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[var(--clr-surface-a0)] p-8 shadow-lg rounded-xl border border-[var(--clr-surface-a20)] hover:shadow-xl hover:-translate-y-1 hover:border-[var(--clr-surface-tonal-a20)] transition-all duration-300 group"
            >
              <div className="inline-flex p-4 rounded-xl bg-[var(--clr-primary-a0)] group-hover:bg-[var(--clr-primary-a10)] dark:group-hover:bg-[var(--clr-primary-darker)] mb-6 transition-colors duration-300">
                <div className="text-[var(--clr-light-a0)]">{feature.icon}</div>
              </div>
              <h3 className="text-2xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4 group-hover:text-[var(--clr-primary-a0)] dark:group-hover:text-[var(--clr-primary-a20)] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-[var(--clr-surface-a50)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing Tiers */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6">
            Choose Your Plan
          </h2>
          <p className="text-xl text-[var(--clr-surface-a50)] max-w-3xl mx-auto leading-relaxed">
            Start free and upgrade as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative bg-[var(--clr-surface-a0)] p-8 shadow-lg rounded-xl border transition-all duration-300 hover:shadow-xl ${
                tier.popular
                  ? "border-[var(--clr-primary-a0)] transform scale-105 shadow-xl"
                  : "border-[var(--clr-surface-a20)] hover:border-[var(--clr-surface-tonal-a20)]"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-2 bg-[var(--clr-primary-a0)] text-[var(--clr-light-a0)] px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                    {tier.price}
                  </span>
                  {tier.price !== "Free" && tier.price !== "Custom" && (
                    <span className="text-[var(--clr-surface-a50)]">
                      /{tier.period.split(" ")[1]}
                    </span>
                  )}
                </div>
                <div className="text-[var(--clr-surface-a50)]">
                  {tier.period}
                </div>
                <p className="text-[var(--clr-surface-a50)] mt-4">
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-[var(--clr-primary-a0)] mt-0.5 flex-shrink-0">
                      <Check className="w-3 h-3 text-[var(--clr-light-a0)]" />
                    </div>
                    <span className="text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] flex-1">
                      {feature}
                    </span>
                  </li>
                ))}
                {tier.limitations &&
                  tier.limitations.map((limitation, limitIndex) => (
                    <li
                      key={`limit-${limitIndex}`}
                      className="flex items-start gap-3"
                    >
                      <div className="p-1 rounded-full bg-[var(--clr-surface-a40)] mt-0.5 flex-shrink-0">
                        <X className="w-3 h-3 text-[var(--clr-surface-a50)]" />
                      </div>
                      <span className="text-[var(--clr-surface-a50)] line-through flex-1">
                        {limitation}
                      </span>
                    </li>
                  ))}
              </ul>

              <div className="text-center">
                {tier.name === "Anonymous" ? (
                  <div className="text-sm text-[var(--clr-surface-a50)] py-3 bg-[var(--clr-surface-a10)] rounded-lg border border-[var(--clr-surface-a20)]">
                    No registration required
                  </div>
                ) : tier.price === "Free" ? (
                  <Link
                    to="/register"
                    className="bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] w-full py-3 px-6 rounded-lg font-semibold inline-flex items-center justify-center gap-2 hover:bg-[var(--clr-surface-a20)] hover:text-[var(--clr-primary-a0)] border border-[var(--clr-surface-a30)] transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${
                      tier.popular
                        ? "bg-[var(--clr-primary-a0)] text-[var(--clr-light-a0)] hover:bg-[var(--clr-primary-a10)] dark:hover:bg-[var(--clr-primary-darker)]"
                        : "bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] hover:bg-[var(--clr-surface-a20)] hover:text-[var(--clr-primary-a0)] border border-[var(--clr-surface-a30)]"
                    }`}
                  >
                    {tier.price === "Custom"
                      ? "Contact Sales"
                      : "Upgrade to Premium"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-[var(--clr-surface-a10)] p-12 rounded-xl border border-[var(--clr-surface-a20)] shadow-lg">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-[var(--clr-surface-a50)] mb-8 leading-relaxed">
              Join thousands of users who trust URLzy for their link management
              needs. Start shortening URLs today!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="bg-[var(--clr-primary-a0)] text-[var(--clr-light-a0)] px-8 py-4 text-lg font-semibold rounded-lg hover:bg-[var(--clr-primary-a10)] dark:hover:bg-[var(--clr-primary-darker)] transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                Sign Up Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/pricing"
                className="bg-[var(--clr-surface-a0)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] border border-[var(--clr-surface-a30)] px-8 py-4 text-lg font-semibold rounded-lg hover:bg-[var(--clr-surface-a10)] hover:border-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-a0)] transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
