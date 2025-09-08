import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, TrendingUp } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-[var(--clr-surface-a0)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] transition-colors">
      {/* Main Content */}
      <div className="container mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 py-12 xs:py-16 sm:py-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[var(--clr-surface-tonal-a10)] px-3 xs:px-4 sm:px-5 py-1 xs:py-2 mb-6 xs:mb-8 sm:mb-10 rounded-full shadow-sm border border-[var(--clr-surface-a30)] transition-colors">
            <Sparkles className="w-3 h-3 xs:w-4 xs:h-4 text-[var(--clr-primary-a0)]" />
            <span className="text-xs xs:text-sm font-medium text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
              Trusted by 50K+ users worldwide
            </span>
          </div>

          {/* Headline */}
          <h1 className="flex flex-col text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-6 xs:mb-8">
            Shorten Your URLs
            <span className="text-[var(--clr-primary-a0)] dark:text-[var(--clr-primary-a20)]">
              Expand Your Reach
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-14 text-lg sm:text-xl lg:text-2xl text-[var(--clr-surface-a50)] max-w-3xl mx-auto leading-relaxed">
            Transform long, complicated URLs into short, shareable links. Track
            clicks, analyze traffic, and boost your online presence with
            powerful analytics and insights.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-20">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-[var(--clr-primary-a0)] text-[var(--clr-light-a0)] rounded-xl shadow-lg hover:bg-[var(--clr-primary-a10)] dark:hover:bg-[var(--clr-primary-darker)] hover:shadow-xl active:scale-95 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </span>
            </Link>
            <a
              href="#shortener"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] bg-transparent border-2 border-[var(--clr-surface-a30)] dark:border-[var(--clr-surface-a40)] rounded-xl shadow-sm hover:bg-[var(--clr-surface-a10)] hover:border-[var(--clr-primary-a0)] dark:hover:border-[var(--clr-primary-a20)] hover:shadow-md transition-all duration-300"
            >
              Try It Now
            </a>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Zap, value: "5M+", label: "Links Shortened" },
              { icon: TrendingUp, value: "1M+", label: "Monthly Clicks" },
              { icon: Sparkles, value: "50K+", label: "Happy Users" },
            ].map((item) => {
              const { icon: Icon, value, label } = item;
              return (
                <div
                  key={label}
                  className="bg-[var(--clr-surface-a0)] p-8 rounded-xl border border-[var(--clr-surface-a20)] shadow-md hover:shadow-lg hover:-translate-y-1 hover:border-[var(--clr-surface-tonal-a20)] transition-all duration-300 group"
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 rounded-lg bg-[var(--clr-primary-a0)] group-hover:bg-[var(--clr-primary-a10)] transition-colors duration-300">
                      <Icon className="w-8 h-8 text-[var(--clr-light-a0)]" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-[var(--clr-primary-a0)] mb-2 group-hover:text-[var(--clr-primary-a10)] dark:group-hover:text-[var(--clr-primary-a20)] transition-colors duration-300">
                    {value}
                  </div>
                  <div className="text-[var(--clr-surface-a50)] font-medium">
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
