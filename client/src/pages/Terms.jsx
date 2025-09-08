import React from "react";

const Terms = () => {
  const acceptanceTerms = [
    { name: "Agreement", desc: "Binding terms and conditions" },
    { name: "Modifications", desc: "Terms may be updated periodically" },
    { name: "Termination", desc: "Rights to terminate service" },
    { name: "Governing Law", desc: "Applicable laws and jurisdiction" },
  ];

  const licenseItems = [
    { title: "Personal Use", desc: "Individual and non-commercial usage" },
    { title: "Commercial Use", desc: "Business and professional applications" },
    { title: "Restrictions", desc: "Prohibited activities and limitations" },
    { title: "Termination", desc: "Automatic termination on violation" },
  ];

  const responsibilitySections = [
    {
      title: "Prohibited Uses",
      desc: "You agree not to use the service for illegal, harmful, or inappropriate content, spam, or any activity that violates these terms.",
    },
    {
      title: "Account Security",
      desc: "Maintain the security of your account and report any unauthorized access or suspicious activity immediately.",
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
            Terms of Service
          </h1>
          <p className="text-lg text-[var(--clr-surface-a50)] max-w-2xl mx-auto">
            Please read these terms carefully before using our URL shortening
            service.
          </p>
          <div className="mt-6 text-sm text-[var(--clr-surface-a50)]">
            <span className="text-[var(--clr-primary-a0)]">Last updated:</span>{" "}
            December 2024
          </div>
        </div>

        <div className="space-y-12">
          {/* Acceptance of Terms */}
          <section
            className={`${sectionClass} bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border-2 border-[var(--clr-primary-a0)] dark:border-[var(--clr-primary-a10)]`}
          >
            <h2 className={headingClass}>1. Acceptance of Terms</h2>
            <p className={`${textClass} mb-6 leading-relaxed`}>
              By accessing and using URLzy, you accept and agree to be bound by
              the terms and provision of this agreement. If you do not agree,
              please do not use this service.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {acceptanceTerms.map((term, i) => (
                <div key={i} className={cardClass}>
                  <h3 className="font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-2">
                    {term.name}
                  </h3>
                  <p className={`text-sm ${textClass}`}>{term.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Use License */}
          <section
            className={`${sectionClass} bg-[var(--clr-surface-a0)]/80 dark:bg-[var(--clr-surface-a10)]/80 border-2 border-[var(--clr-primary-a0)] dark:border-[var(--clr-primary-a10)]`}
          >
            <h2 className={headingClass}>2. Use License</h2>
            <p className={`${textClass} mb-6 leading-relaxed`}>
              Permission is granted to temporarily use URLzy for personal and
              commercial purposes. This license shall automatically terminate if
              you violate any of these restrictions.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {licenseItems.map((item, i) => (
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

          {/* User Responsibilities */}
          <section
            className={`${sectionClass} bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a10)] border-2 border-[var(--clr-primary-a20)] dark:border-[var(--clr-primary-a10)]`}
          >
            <h2 className={headingClass}>3. User Responsibilities</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {responsibilitySections.map((section, i) => (
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
              Questions About Terms?
            </h2>
            <p className="text-[var(--clr-light-a0)]/90 mb-6">
              Our legal team is here to help clarify any questions about our
              terms of service.
            </p>
            <a
              href="mailto:legal@urlzy.com"
              className="inline-flex items-center px-6 py-3 font-semibold rounded-lg bg-[var(--clr-light-a0)] text-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-a10)] dark:hover:bg-[var(--clr-primary-a0)] hover:text-[var(--clr-light-a0)]"
            >
              Contact Legal Team
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
