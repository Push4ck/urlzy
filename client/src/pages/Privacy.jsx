import React from "react";

const Privacy = () => {
  const informationTypes = [
    { name: "Account Data", desc: "Email, username, and profile information" },
    { name: "Usage Data", desc: "URL shortening activity and analytics" },
    { name: "Technical Data", desc: "Device and browser information" },
    { name: "Communication", desc: "Messages and support interactions" },
  ];

  const usageItems = [
    {
      title: "Service Delivery",
      desc: "Provide and maintain URL shortening services",
    },
    {
      title: "Communication",
      desc: "Send important updates and notifications",
    },
    { title: "Improvement", desc: "Analyze usage and improve our platform" },
    { title: "Security", desc: "Protect against fraud and abuse" },
  ];

  const securitySections = [
    {
      title: "We Don't Share",
      desc: "We do not sell, trade, or rent your personal information to third parties. Your data remains private and secure with us.",
    },
    {
      title: "We Protect",
      desc: "We implement industry-standard security measures to protect your data against unauthorized access and breaches.",
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
            Privacy Policy
          </h1>
          <p className="text-lg text-[var(--clr-surface-a50)] max-w-2xl mx-auto">
            We are committed to protecting your privacy and ensuring
            transparency in how we handle your data.
          </p>
          <div className="mt-6 text-sm text-[var(--clr-surface-a50)]">
            <span className="text-[var(--clr-primary-a0)]">Last updated:</span>{" "}
            December 2024
          </div>
        </div>

        <div className="space-y-12">
          {/* Information We Collect */}
          <section
            className={`${sectionClass} bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border-2 border-[var(--clr-primary-a0)] dark:border-[var(--clr-primary-a10)]`}
          >
            <h2 className={headingClass}>1. Information We Collect</h2>
            <p className={`${textClass} mb-6 leading-relaxed`}>
              We collect information you provide directly to us, such as when
              you create an account, use our services, or contact us for
              support.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {informationTypes.map((type, i) => (
                <div key={i} className={cardClass}>
                  <h3 className="font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2">
                    {type.name}
                  </h3>
                  <p className={`text-sm ${textClass}`}>{type.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How We Use Information */}
          <section
            className={`${sectionClass} bg-[var(--clr-surface-a0)]/80 dark:bg-[var(--clr-surface-a10)]/80 border-2 border-[var(--clr-primary-a0)] dark:border-[var(--clr-primary-a10)]`}
          >
            <h2 className={headingClass}>2. How We Use Your Information</h2>
            <p className={`${textClass} mb-6 leading-relaxed`}>
              We use the information we collect to provide, maintain, and
              improve our services:
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

          {/* Information Sharing & Security */}
          <section
            className={`${sectionClass} bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border-2 border-[var(--clr-primary-a20)] dark:border-[var(--clr-primary-a10)]`}
          >
            <h2 className={headingClass}>3. Information Sharing & Security</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {securitySections.map((section, i) => (
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
              Questions About Privacy?
            </h2>
            <p className="text-[var(--clr-light-a0)]/90 mb-6">
              We're here to help. Contact our privacy team with any questions or
              concerns.
            </p>
            <a
              href="mailto:privacy@urlzy.com"
              className="inline-flex items-center px-6 py-3 font-semibold rounded-lg bg-[var(--clr-light-a0)] text-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] dark:hover:bg-[var(--clr-primary-a0)] hover:text-[var(--clr-light-a0)]"
            >
              Contact Privacy Team
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
