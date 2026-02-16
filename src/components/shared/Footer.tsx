import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="  pb-6">
      {/* CARD */}
      <div className="rounded-2xl border-t border-white/10 px-40 pt-12">
        {/* TOP */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* BRAND */}
          <div>
            <h3 className="text-lg font-semibold text-white">Akhmads.net</h3>
            <p className="mt-3 max-w-xs text-sm text-white/60">
              Advertising and monetization platform for Telegram bots.
            </p>
          </div>

          {/* PLATFORM */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white/80">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <NavLink to="/" className="hover:text-white">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/launch-ad" className="hover:text-white">
                  Launch Ad
                </NavLink>
              </li>
              <li>
                <NavLink to="/add-bot" className="hover:text-white">
                  Add Bot
                </NavLink>
              </li>
              <li>
                <NavLink to="/wallet" className="hover:text-white">
                  Wallet
                </NavLink>
              </li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white/80">Yordam</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <NavLink to="/faq" className="hover:text-white">
                  FAQ
                </NavLink>
              </li>
              <li>
                <NavLink to="/support" className="hover:text-white">
                  Support
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-10 h-px w-full bg-white/10" />

        {/* BOTTOM */}
        <div className="pb-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} AKHMADS.NET — Bots. Ads. Automation.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
