import React from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/useAuth";
import { useNavigate } from "react-router-dom";
import { Lock, Check, X } from "lucide-react";
import pricingData from "../data/pricing.json";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { plans, faq } = pricingData;

  return (
    <div className="min-h-screen bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a0)] py-20 transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl sm:text-6xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-2xl text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a50)] max-w-4xl mx-auto leading-relaxed">
            Choose the perfect plan for your needs. Start free and upgrade
            anytime with no hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-[var(--clr-surface-a0)]/80 dark:bg-[var(--clr-surface-a10)]/80 backdrop-blur-xl rounded-2xl p-8 border shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ${
                plan.popular
                  ? "border-2 border-[var(--clr-primary-a0)] scale-105 shadow-2xl"
                  : "border-[var(--clr-surface-a30)]/50 dark:border-[var(--clr-surface-a20)]/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[var(--clr-primary-a0)] to-[var(--clr-primary-a10)] text-[var(--clr-light-a0)] px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    <Lock className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-6xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                    {plan.price}
                  </span>
                  {plan.price !== "Free" && plan.price !== "Custom" && (
                    <span className="text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a50)]">
                      /{plan.period.split(" ")[1]}
                    </span>
                  )}
                </div>
                <div className="text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a50)] mb-4">
                  {plan.period}
                </div>
                <p className="text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a50)] text-lg">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-gradient-to-br from-[var(--clr-primary-a10)] to-[var(--clr-primary-a0)] mt-1 shadow-sm">
                      <Check className="w-3 h-3 text-[var(--clr-light-a0)]" />
                    </div>
                    <span className="text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] flex-1">
                      {feature}
                    </span>
                  </li>
                ))}
                {plan.limitations &&
                  plan.limitations.map((limitation, limitIndex) => (
                    <li
                      key={`limit-${limitIndex}`}
                      className="flex items-start gap-3"
                    >
                      <div className="p-1 rounded-full bg-[var(--clr-surface-a40)] mt-1">
                        <X className="w-3 h-3 text-[var(--clr-surface-a50)]" />
                      </div>
                      <span className="text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a40)] line-through flex-1">
                        {limitation}
                      </span>
                    </li>
                  ))}
              </ul>

              <button
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer ${
                  plan.buttonVariant === "primary"
                    ? "bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)]"
                    : "bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] border border-[var(--clr-surface-a30)] dark:border-[var(--clr-surface-a20)] hover:bg-[var(--clr-surface-tonal-a0)] dark:hover:bg-[var(--clr-surface-a20)]"
                }`}
                onClick={async () => {
                  const planName = plan.name;

                  // Free: just take user to registration
                  if (planName === "Free") {
                    navigate("/register");
                    return;
                  }

                  // Enterprise: open mailto to contact sales
                  if (planName === "Enterprise") {
                    window.location.href =
                      "mailto:sales@urlzy.app?subject=Enterprise%20Plan%20Inquiry";
                    return;
                  }

                  // Premium: require login and start checkout
                  const token = localStorage.getItem("token");
                  if (!user && !token) {
                    toast("Please log in to upgrade", {
                      icon: <Lock className="w-4 h-4" />,
                    });
                    navigate("/login");
                    return;
                  }
                  try {
                    // Create Razorpay order
                    const planSlug = planName.toLowerCase();
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
                      description: `${planName} Subscription`,
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
                      theme: { color: "#10b981" },
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
        <div className="bg-[var(--clr-surface-a0)]/80 dark:bg-[var(--clr-surface-a10)]/80 backdrop-blur-xl rounded-2xl p-12 border border-[var(--clr-surface-a30)]/50 dark:border-[var(--clr-surface-a20)]/50 shadow-xl hover:shadow-2xl transition-all duration-500">
          <h2 className="text-4xl font-bold text-center text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faq.map((item, index) => (
              <div
                key={index}
                className="bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] p-6 rounded-xl border border-[var(--clr-surface-a30)] dark:border-[var(--clr-surface-a20)] shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h4 className="font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-3 text-lg">
                  {item.question}
                </h4>
                <p className="text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a50)] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
