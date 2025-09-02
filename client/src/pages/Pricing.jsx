import React from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/useAuth";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for personal use",
      features: [
        "100 URLs per month",
        "Basic analytics",
        "Custom short codes",
        "URL management",
        "Email support",
      ],
      limitations: [
        "No custom domains",
        "Basic analytics only",
        "Limited API calls",
      ],
      buttonText: "Get Started Free",
      buttonVariant: "outline",
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "per month",
      description: "Best for professionals and small teams",
      features: [
        "Unlimited URLs",
        "Advanced analytics",
        "Custom domains",
        "Password-protected links",
        "QR code generation",
        "API access",
        "Priority support",
        "Bulk upload",
        "Team collaboration",
      ],
      buttonText: "Start Premium Trial",
      buttonVariant: "primary",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large organizations with custom needs",
      features: [
        "Everything in Premium",
        "White-label solution",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee",
        "Advanced security",
        "Custom analytics",
        "Multi-region hosting",
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your needs. Start free and upgrade
            anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-sm border-2 p-8 relative ${
                plan.popular
                  ? "border-indigo-500 transform scale-105"
                  : "border-gray-100"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {plan.price}
                </div>
                <div className="text-gray-500">{plan.period}</div>
                <p className="text-gray-600 mt-4">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
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
                {plan.limitations &&
                  plan.limitations.map((limitation, limitIndex) => (
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

              <button
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.buttonVariant === "primary"
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
                onClick={async () => {
                  const token = localStorage.getItem("token");
                  if (!user && !token) {
                    toast("Please log in to upgrade", { icon: "🔐" });
                    navigate("/login");
                    return;
                  }
                  try {
                    // Create Razorpay order
                    const planSlug = plan.name.toLowerCase();
                    const orderRes = await axios.post(
                      `${API_BASE_URL}/api/billing/razorpay/order`,
                      { plan: planSlug },
                      { headers: { Authorization: `Bearer ${token || ""}` } }
                    );
                    const order = orderRes.data?.data?.order;
                    if (!order) {
                      toast.error("Failed to create order");
                      return;
                    }

                    // Load Razorpay script if not present
                    if (!window.Razorpay) {
                      await new Promise((resolve, reject) => {
                        const script = document.createElement("script");
                        script.src =
                          "https://checkout.razorpay.com/v1/checkout.js";
                        script.onload = resolve;
                        script.onerror = reject;
                        document.body.appendChild(script);
                      });
                    }

                    const options = {
                      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
                      amount: order.amount,
                      currency: order.currency,
                      name: "URLzy",
                      description: `${plan.name} Subscription`,
                      order_id: order.id,
                      handler: async function (response) {
                        try {
                          const verifyRes = await axios.post(
                            `${API_BASE_URL}/api/billing/razorpay/verify`,
                            response,
                            {
                              headers: {
                                Authorization: `Bearer ${token || ""}`,
                              },
                            }
                          );
                          if (verifyRes.data?.success) {
                            toast.success(
                              "Payment successful! Premium activated"
                            );
                          } else {
                            toast.error("Verification failed");
                          }
                        } catch (err) {
                          toast.error("Verification error");
                        }
                      },
                      theme: { color: "#4f46e5" },
                    };

                    const rzp = new window.Razorpay(options);
                    rzp.open();
                  } catch (err) {
                    toast.error(
                      err.response?.data?.message || "Failed to start checkout"
                    );
                  }
                }}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-2">
                Can I change plans anytime?
              </h4>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee for all paid plans, no
                questions asked.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">
                What happens to my URLs if I downgrade?
              </h4>
              <p className="text-gray-600">
                Your existing URLs continue to work. You'll just have reduced
                features and limits going forward.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Is there an API available?</h4>
              <p className="text-gray-600">
                Yes, Premium and Enterprise plans include full API access with
                comprehensive documentation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
