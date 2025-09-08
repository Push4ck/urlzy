import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  MessageCircle,
  Clock,
  HelpCircle,
  Zap,
  BarChart3,
} from "lucide-react";

const Contact = () => {
  const sectionClass =
    "backdrop-blur-xl rounded-2xl p-4 xs:p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300";
  const headingClass =
    "text-xl xs:text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6";
  const textClass =
    "text-[var(--clr-primary-darker)] dark:text-[var(--clr-primary-lighter)]";
  const cardClass =
    "bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] rounded-xl p-4 xs:p-6 border-2 border-[var(--clr-surface-a30)] dark:border-[var(--clr-surface-a20)] shadow-lg hover:shadow-xl transition-all duration-300";

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      type: "email",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      type: "chat",
    },
  ];

  const responseTimeData = [
    { label: "Email Support", time: "Within 24 hours" },
    { label: "Live Chat", time: "Instant (Premium)" },
  ];

  const quickAnswers = [
    {
      icon: HelpCircle,
      question: "How to shorten URLs?",
      answer: 'Paste your long URL and click "Shorten". That\'s it!',
    },
    {
      icon: BarChart3,
      question: "Link analytics?",
      answer: "Sign up for detailed click tracking and insights.",
    },
    {
      icon: Zap,
      question: "Is it free?",
      answer: "Basic shortening is free. Premium features available.",
    },
    {
      icon: MessageCircle,
      question: "Need more help?",
      answer: "Check our comprehensive help center.",
    },
  ];

  const sidebarCards = [
    {
      type: "premium",
      title: "Premium Support",
      description:
        "Get priority support with faster response times and dedicated assistance.",
      buttonText: "View Plans",
      buttonLink: "/pricing",
    },
    {
      type: "help",
      title: "Help Center",
      description: "Browse our comprehensive guides, tutorials, and FAQs.",
      buttonText: "Visit Help Center →",
      buttonLink: "/help",
    },
  ];

  const renderContactContent = (method) => {
    if (method.type === "email") {
      return (
        <div className="space-y-2">
          <p className={textClass}>
            <span className="font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              General:
            </span>{" "}
            support@urlzy.com
          </p>
          <p className={textClass}>
            <span className="font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              Business:
            </span>{" "}
            business@urlzy.com
          </p>
        </div>
      );
    } else if (method.type === "chat") {
      return (
        <div>
          <p className={`${textClass} mb-3`}>
            Available 24/7 for premium users
          </p>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--clr-primary-lighter)] text-[var(--clr-primary-darker)] dark:bg-[var(--clr-primary-a0)] dark:text-[var(--clr-light-a0)] border border-[var(--clr-primary-a20)] dark:border-[var(--clr-primary-a10)]">
            Online Now
          </span>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a0)] py-8 xs:py-12 sm:py-16 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 xs:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 xs:mb-12 sm:mb-16">
          <h1 className="text-3xl xs:text-4xl lg:text-5xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
            Contact Us
          </h1>
          <p className="text-base xs:text-lg text-[var(--clr-surface-a50)] max-w-2xl mx-auto">
            We're here to help! Get in touch with our team for support,
            questions, or feedback.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xs:gap-8 mb-8 xs:mb-12 sm:mb-16">
          {/* Contact Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Get in Touch Section */}
            <section
              className={`${sectionClass} bg-[var(--clr-surface-a0)]/80 dark:bg-[var(--clr-surface-a10)]/80 border-2 border-[var(--clr-surface-a30)]/50 dark:border-[var(--clr-surface-a20)]/50`}
            >
              <h2 className={headingClass}>Get in Touch</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6">
                {contactMethods.map((method, i) => (
                  <div key={i} className={cardClass}>
                    <div className="flex mb-4 lg:items-center lg:flex-row xs:flex-col xs:items-left xs:gap-2 lg:gap-0">
                      <div className="w-10 h-10 bg-[var(--clr-primary-a0)] rounded-lg flex items-center justify-center mr-3 shadow-lg">
                        <method.icon className="w-5 h-5 text-[var(--clr-light-a0)]" />
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                        {method.title}
                      </h3>
                    </div>
                    {renderContactContent(method)}
                  </div>
                ))}

                {/* Response Times Card */}
                <div className={`${cardClass} lg:col-span-2`}>
                  <div className="flex mb-4 lg:items-center lg:flex-row xs:flex-col xs:items-left xs:gap-2 lg:gap-0">
                    <div className="w-10 h-10 bg-[var(--clr-primary-a0)] rounded-lg flex items-center justify-center mr-3 shadow-lg">
                      <Clock className="w-5 h-5 text-[var(--clr-light-a0)]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                      Response Times
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {responseTimeData.map((item, i) => (
                      <div key={i}>
                        <p className="text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                          {item.label}
                        </p>
                        <p className={`text-sm ${textClass}`}>{item.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Answers Section */}
            <section
              className={`${sectionClass} bg-[var(--clr-surface-a0)]/80 dark:bg-[var(--clr-surface-a10)]/80 border-2 border-[var(--clr-surface-a30)]/50 dark:border-[var(--clr-surface-a20)]/50`}
            >
              <h2 className={headingClass}>Quick Answers</h2>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xs:gap-6">
                {quickAnswers.map((item, i) => (
                  <div
                    key={i}
                    className="flex mb-4 lg:flex-row xs:flex-col xs:items-left xs:gap-2 lg:gap-0 group"
                  >
                    <div className="w-8 h-8 bg-[var(--clr-primary-a0)] rounded-lg flex items-center justify-center mt-0.5 mr-3 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-4 h-4 text-[var(--clr-light-a0)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-1">
                        {item.question}
                      </h3>
                      <p className={`text-sm ${textClass}`}>{item.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {sidebarCards.map((card, i) => (
              <div
                key={i}
                className={`${sectionClass} ${
                  card.type === "premium"
                    ? "bg-[var(--clr-primary-a0)] dark:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)]"
                    : "bg-[var(--clr-surface-a0)]/80 dark:bg-[var(--clr-surface-a10)]/80 border-2 border-[var(--clr-surface-a30)]/50 dark:border-[var(--clr-surface-a20)]/50"
                }`}
              >
                <h3
                  className={`text-xl font-bold mb-4 ${
                    card.type === "premium"
                      ? "text-[var(--clr-light-a0)]"
                      : "text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]"
                  }`}
                >
                  {card.title}
                </h3>
                <p
                  className={`mb-6 ${
                    card.type === "premium"
                      ? "opacity-90 text-[var(--clr-light-a0)]"
                      : textClass
                  }`}
                >
                  {card.description}
                </p>
                <Link
                  to={card.buttonLink}
                  className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg transition-all duration-300 ${
                    card.type === "premium"
                      ? "bg-[var(--clr-light-a0)] text-[var(--clr-primary-a0)] shadow-lg hover:shadow-xl hover:scale-105"
                      : "text-[var(--clr-primary-a0)] hover:text-[var(--clr-primary-dark)] dark:text-[var(--clr-primary-a10)] dark:hover:text-[var(--clr-primary-a0)]"
                  }`}
                >
                  {card.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <section
          className={`${sectionClass} bg-[var(--clr-primary-a0)] dark:bg-[var(--clr-primary-dark)] text-center text-[var(--clr-light-a0)]`}
        >
          <h2 className="text-xl xs:text-2xl lg:text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-[var(--clr-light-a0)]/90 mb-6 xs:mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust URLzy for their link shortening
            needs.
          </p>
          <div className="flex xs:flex-col lg:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 xs:px-8 py-3 xs:py-4 bg-[var(--clr-light-a0)] text-[var(--clr-primary-a0)] font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Start Free Trial
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center px-6 xs:px-8 py-3 xs:py-4 bg-[var(--clr-light-a0)]/10 text-[var(--clr-light-a0)] font-semibold rounded-lg border border-[var(--clr-light-a0)]/20 hover:bg-[var(--clr-light-a0)]/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              View Pricing
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
