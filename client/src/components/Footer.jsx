import { Link } from "react-router-dom";
import { Twitter, Facebook, Linkedin, Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[var(--clr-surface-a0)] text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] shadow-sm transition-colors border-t border-[var(--clr-surface-a20)]">
      <div className="container mx-auto px-2 xs:px-4 sm:px-6 xs:py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 xs:gap-12 sm:gap-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-[var(--clr-primary-a0)]">
                <Zap className="w-7 h-7 text-[var(--clr-light-a0)]" />
              </div>
              <span className="text-3xl font-bold tracking-tight text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)]">
                URLzy
              </span>
            </div>
            <p className="text-md text-[var(--clr-surface-a50)] mb-10 max-w-md leading-relaxed font-medium">
              Simplify your links with our powerful URL shortener. Fast,
              reliable, secure, and trusted by thousands worldwide.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter, label: "Twitter" },
                { icon: Facebook, label: "Facebook" },
                { icon: Linkedin, label: "LinkedIn" },
              ].map((item) => {
                const { icon: Icon, label } = item;
                return (
                  <a
                    key={label}
                    href="#"
                    className="group p-4 rounded-xl bg-[var(--clr-primary-lighter)] hover:bg-[var(--clr-primary-light)] dark:bg-[var(--clr-primary-darker)] dark:hover:bg-[var(--clr-primary-dark)]"
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5 text-[var(--clr-dark-a0)] dark:text-[var(--clr-primary-dark0)] group-hover:text-[var(--clr-primary-a0)]" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-8 tracking-tight">
              Product
            </h3>
            <ul className="space-y-5">
              {[
                { to: "/pricing", label: "Pricing" },
                { to: "/about", label: "About" },
                { to: "/features", label: "Features" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 font-medium hover:translate-x-1 inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xl font-bold text-[var(--clr-dark-a0)] dark:text-[var(--clr-light-a0)] mb-8 tracking-tight">
              Support
            </h3>
            <ul className="space-y-5">
              {[
                { to: "/contact", label: "Contact" },
                { to: "/help", label: "Help Center" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 font-medium hover:translate-x-1 inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-gray-700 mt-16 pt-10 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
            &copy; {new Date().getFullYear()} URLzy.
          </div>
          <div className="flex lg:flex-row xs:flex-col md:justify-end gap-8 text-sm">
            {[
              { to: "/privacy", label: "Privacy Policy" },
              { to: "/terms", label: "Terms of Service" },
              { to: "/cookies", label: "Cookie Policy" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 font-medium hover:underline decoration-emerald-500 underline-offset-4"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
