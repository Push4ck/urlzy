import React from "react";

const Cookies = () => {
  const cookieTypes = [
    {
      name: "Essential Cookies",
      desc: "Required for basic website functionality",
    },
    {
      name: "Analytics Cookies",
      desc: "Help us understand how you use our site",
    },
    {
      name: "Functional Cookies",
      desc: "Remember your preferences and settings",
    },
    {
      name: "Marketing Cookies",
      desc: "Used to deliver relevant advertisements",
    },
  ];

  const usageItems = [
    { title: "Authentication", desc: "Keep you logged in across sessions" },
    { title: "Preferences", desc: "Remember your theme and language settings" },
    { title: "Analytics", desc: "Track usage patterns to improve our service" },
    {
      title: "Security",
      desc: "Protect against fraud and unauthorized access",
    },
  ];

  const managementSections = [
    {
      title: "Browser Settings",
      desc: "You can control cookies through your browser settings. Most browsers allow you to block or delete cookies, though this may affect website functionality.",
    },
    {
      title: "Our Cookie Preferences",
      desc: "You can manage non-essential cookies through our cookie preference center, accessible from the footer of our website.",
    },
  ];

  const sectionClass = "backdrop-blur-lg rounded-2xl p-8 lg:p-10 shadow-2xl";
  const headingClass =
    "text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6";
  const textClass =
    "text-[var(--clr-primary-darker)] dark:text-[var(--clr-primary-lighter)]";
  const cardClass =
    "bg-[var(--clr-surface-tonal-a0)] dark:bg-[var(--clr-surface-a0)] rounded-lg p-4 border-2 border-[var(--clr-primary-a20)] dark:border-[var(--clr-primary-a10)]";

  return (
    <div className="relative min-h-screen bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a0)] transition-colors duration-300 py-16">
      <div className="relative max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
            Cookie Policy
          </h1>
          <p className="text-lg text-[var(--clr-surface-a50)] max-w-2xl mx-auto">
            Learn how we use cookies to improve your experience and provide our
            services.
          </p>
          <div className="mt-6 text-sm text-[var(--clr-surface-a50)]">
            <span className="text-[var(--clr-primary-a0)]">Last updated:</span>{" "}
            September 2025
          </div>
        </div>

        <div className="space-y-12">
          {/* What Are Cookies */}
          <section
            className={`${sectionClass} bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border-2 border-[var(--clr-primary-a0)] dark:border-[var(--clr-primary-a10)]`}
          >
            <h2 className={headingClass}>1. What Are Cookies</h2>
            <p className={`${textClass} mb-6 leading-relaxed`}>
              Cookies are small text files that are stored on your device when
              you visit our website. They help us provide you with a better
              browsing experience by remembering your preferences and settings.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {cookieTypes.map((type, i) => (
                <div
                  key={i}
                  className={`${cardClass} ${i === 0 ? "border-2" : ""}`}
                >
                  <h3 className="font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2">
                    {type.name}
                  </h3>
                  <p className={`text-sm ${textClass}`}>{type.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How We Use Cookies */}
          <section
            className={`${sectionClass} bg-[var(--clr-surface-a0)]/80 dark:bg-[var(--clr-surface-a10)]/80 border-2 border-[var(--clr-primary-a0)] dark:border-[var(--clr-primary-a10)]`}
          >
            <h2 className={headingClass}>2. How We Use Cookies</h2>
            <p className={`${textClass} mb-6 leading-relaxed`}>
              We use cookies for various purposes to enhance your experience and
              provide our services:
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {usageItems.map((item, i) => (
                <div key={i} className="flex items-start">
                  <div className="w-2 h-2 bg-[var(--clr-primary-a0)] dark:bg-[var(--clr-primary-a10)] rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-1">
                      {item.title}
                    </h3>
                    <p className={`text-sm ${textClass}`}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Managing Cookies */}
          <section
            className={`${sectionClass} bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border-2 border-[var(--clr-primary-a20)] dark:border-[var(--clr-primary-a10)]`}
          >
            <h2 className={headingClass}>3. Managing Your Cookies</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {managementSections.map((section, i) => (
                <div key={i}>
                  <h3 className="text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-3">
                    {section.title}
                  </h3>
                  <p className={`${textClass} text-sm leading-relaxed`}>
                    {section.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section
            className={`${sectionClass} bg-[var(--clr-primary-a0)] dark:bg-[var(--clr-primary-dark)] text-center`}
          >
            <h2 className="text-2xl font-bold text-[var(--clr-light-a0)] mb-4">
              Questions About Cookies?
            </h2>
            <p className="text-[var(--clr-light-a0)]/90 mb-6">
              Have questions about our cookie policy or need help managing your
              preferences? Contact our support team for assistance.
            </p>
            <a
              href="mailto:privacy@urlzy.com"
              className="inline-flex items-center px-6 py-3 font-semibold rounded-lg bg-[var(--clr-light-a0)] text-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] dark:hover:bg-[var(--clr-primary-a0)] hover:text-[var(--clr-light-a0)]"
            >
              Contact Support
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Cookies;
