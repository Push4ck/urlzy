import React from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Shield,
  BarChart3,
  Users,
  Target,
  Heart,
  Award,
} from "lucide-react";

const About = () => {
  return (
    <div className="relative min-h-screen bg-[var(--clr-surface-a10)] dark:bg-[var(--clr-surface-a0)] py-8 xs:py-12 sm:py-16 transition-colors duration-300">
      <div className="relative max-w-6xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12 xs:mb-16 sm:mb-20">
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4 xs:mb-6">
            About URLzy
          </h1>
          <p className="text-lg xs:text-xl text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a40)] max-w-3xl mx-auto leading-relaxed font-medium">
            Making the web simpler, one link at a time. We're on a mission to
            revolutionize how people share and track their digital content.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-[var(--clr-surface-a0)]/80 dark:bg-[var(--clr-surface-a10)]/80 backdrop-blur-xl rounded-3xl p-8 lg:p-12 mb-16 border border-[var(--clr-surface-a30)]/50 dark:border-[var(--clr-surface-a20)]/50 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-[var(--clr-primary-a0)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
              <Target className="w-10 h-10 text-[var(--clr-light-a0)]" />
            </div>
            <h2 className="text-4xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a40)] max-w-3xl mx-auto leading-relaxed">
              We believe that every great idea deserves a short, memorable URL
              that people can easily share and remember. Since our launch, we've
              helped millions of users shorten their URLs, track their
              performance, and share their content more effectively across the
              web.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10M+", label: "Links Shortened" },
              { value: "500K+", label: "Active Users" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Support" },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl lg:text-4xl font-bold text-[var(--clr-primary-a0)] dark:text-[var(--clr-primary-a10)] mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a40)] font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[
            {
              icon: Zap,
              title: "Lightning Fast",
              description:
                "Our service is optimized for speed, ensuring your links are shortened instantly and redirect quickly. No waiting, no delays - just fast, reliable performance.",
            },
            {
              icon: Shield,
              title: "Secure & Reliable",
              description:
                "We prioritize security and uptime, ensuring your links are always accessible and protected. Your data and privacy are our top priorities.",
            },
            {
              icon: BarChart3,
              title: "Detailed Analytics",
              description:
                "Track your link performance with comprehensive analytics and insights to optimize your sharing strategy and understand your audience better.",
            },
            {
              icon: Users,
              title: "Trusted by Millions",
              description:
                "Join millions of users who trust URLzy for their link shortening needs, from individuals to large enterprises. We're here to serve you.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group bg-[var(--clr-surface-a0)]/80 dark:bg-[var(--clr-surface-a10)]/80 backdrop-blur-xl rounded-2xl p-8 hover:bg-[var(--clr-surface-a0)] dark:hover:bg-[var(--clr-surface-a10)] transition-all duration-500 border border-[var(--clr-surface-a30)]/50 dark:border-[var(--clr-surface-a20)]/50 shadow-xl hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <feature.icon className="w-7 h-7 text-[var(--clr-light-a0)]" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                  {feature.title}
                </h3>
              </div>
              <p className="text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a40)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Story Section */}
        <div className="bg-[var(--clr-primary-a0)] dark:bg-[var(--clr-primary-dark)] rounded-3xl p-8 lg:p-12 text-[var(--clr-light-a0)] mb-16 shadow-2xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 mr-3 text-red-300 animate-pulse" />
              <h2 className="text-4xl font-bold">Our Story</h2>
            </div>
            <p className="text-xl mb-8 leading-relaxed opacity-95">
              Founded in {new Date().getFullYear()}, URLzy started as a simple
              idea: make URL shortening accessible to everyone. What began as a
              weekend project has grown into a trusted platform used by
              individuals, businesses, and organizations worldwide.
            </p>
            <p className="text-xl leading-relaxed opacity-95">
              We're committed to maintaining the simplicity that made us
              successful while continuously improving our service with new
              features and better performance.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-[var(--clr-surface-a0)]/80 dark:bg-[var(--clr-surface-a10)]/80 backdrop-blur-xl rounded-2xl p-8 lg:p-12 mb-16 border border-[var(--clr-surface-a30)]/50 dark:border-[var(--clr-surface-a20)]/50 shadow-2xl">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-[var(--clr-primary-a10)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
              <Award className="w-10 h-10 text-[var(--clr-light-a0)]" />
            </div>
            <h2 className="text-4xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
              Our Values
            </h2>
            <p className="text-lg text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a40)] max-w-2xl mx-auto">
              These principles guide everything we do and shape our company
              culture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Simplicity",
                description: "Making complex technology accessible to everyone",
              },
              {
                title: "Reliability",
                description:
                  "Delivering consistent, dependable service you can trust",
              },
              {
                title: "Innovation",
                description: "Continuously improving and evolving our platform",
              },
            ].map((value, index) => (
              <div key={index} className="text-center group">
                <h3 className="text-xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-3 group-hover:text-[var(--clr-primary-a0)] dark:group-hover:text-[var(--clr-primary-a10)] transition-colors duration-300">
                  {value.title}
                </h3>
                <p className="text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a40)]">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-4">
            Ready to Join Us?
          </h2>
          <p className="text-lg text-[var(--clr-surface-a50)] dark:text-[var(--clr-surface-a40)] mb-8 max-w-2xl mx-auto">
            Start shortening your links today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-[var(--clr-primary-a0)] hover:bg-[var(--clr-primary-dark)] text-[var(--clr-light-a0)] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-[var(--clr-surface-a0)] dark:bg-[var(--clr-surface-a10)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] font-semibold rounded-xl border border-[var(--clr-surface-a30)] dark:border-[var(--clr-surface-a20)] hover:bg-[var(--clr-surface-tonal-a0)] dark:hover:bg-[var(--clr-surface-a20)] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
