import { useCallback, useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useUserStore } from "../../store/userStore";
import { useTranslations } from "../../hooks/useTranslations";
import walletService from "../../services/wallet.service";

const languages = ["uz", "eng", "ru"] as const;
type Lang = (typeof languages)[number];

const Navbar = () => {
  const { lang: urlLang } = useParams<{ lang?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { profile, fetchProfile } = useUserStore();
  const t = useTranslations();

  const lang: Lang = languages.includes(urlLang as Lang)
    ? (urlLang as Lang)
    : "uz";

  const [desktopLangOpen, setDesktopLangOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Wallet balance state
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const desktopLangRef = useRef<HTMLDivElement>(null);
  const mobileLangRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Fetch profile when authenticated
  useEffect(() => {
    if (isAuthenticated && !profile) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  // ✅ Fetch wallet balance
  const fetchWallet = useCallback(async () => {
    if (!isAuthenticated) return;
    setWalletLoading(true);
    try {
      const res = await walletService.getWallet();
      setWalletBalance(res.data.wallet.available);
    } catch {
      // silent fail — wallet may not be accessible
    } finally {
      setWalletLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  /* 🔒 Tashqariga bosilganda yopish */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (desktopLangRef.current && !desktopLangRef.current.contains(e.target as Node)) {
        setDesktopLangOpen(false);
      }
      if (mobileLangRef.current && !mobileLangRef.current.contains(e.target as Node)) {
        setMobileLangOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* 🔁 Route o'zgarganda dropdown va mobile menu yopilsin */
  useEffect(() => {
    setDesktopLangOpen(false);
    setMobileLangOpen(false);
    setProfileOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  /* 🔒 Mobile menu ochiq bo'lsa scroll blok */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* 🌍 Tilni almashtirish */
  const changeLang = (newLang: Lang) => {
    const { pathname, search, hash } = location;
    const segments = pathname.split("/").filter(Boolean);

    if (languages.includes(segments[0] as Lang)) {
      segments[0] = newLang;
    } else {
      segments.unshift(newLang);
    }

    navigate(`/${segments.join("/")}${search}${hash}`);
  };

  /* 🚪 Logout handler */
  const handleLogout = async () => {
    await logout();
    navigate(`/${lang}/login`);
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 lg:px-2.5 xl:px-4 py-1.5 lg:py-2 rounded-[30px] transition-all duration-300 whitespace-nowrap ${isActive ? "bg-white/15 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)]" : "text-white/70 hover:text-white hover:bg-white/5"
    }`;

  const isLoginPage = location.pathname.includes("/login");

  // ✅ Avatar URL - Priority: profile > user > fallback
  const getAvatarUrl = () => {
    const avatarUrl = profile?.avatarUrl || user?.avatarUrl;
    if (avatarUrl) {
      return avatarUrl;
    }

    const name = profile?.firstName || user?.firstName || "U";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=8b5cf6&color=fff&size=128&bold=true`;
  };

  const avatarUrl = getAvatarUrl();
  const nav = t.navbar;

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50">
        <div className="h-[70px] sm:h-[80px] w-full bg-black/20 backdrop-blur-[16px]">
          <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">

            {/* 🔹 Logo */}
            <Link
              to={`/${lang}`}
              className="flex items-center gap-3 hover:opacity-90 transition shrink-0"
            >
              {/* Logo — matches public/index.html */}
              <div
                className="relative w-11 h-11 rounded-full flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle at center, #0f0f2a 40%, #070715 100%)",
                  boxShadow: "0 0 18px rgba(120,0,255,0.35), inset 0 0 24px rgba(100,0,255,0.3)",
                }}
              >
                {/* Outer rotating ring */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: "2px solid transparent",
                    borderTopColor: "#8f2fff",
                    borderBottomColor: "#4b00ff",
                    animation: "spin 6s linear infinite",
                  }}
                />
                {/* Inner rotating ring (reverse) */}
                <div
                  className="absolute inset-[4px] rounded-full"
                  style={{
                    border: "2px solid transparent",
                    borderTopColor: "#4b00ff",
                    borderBottomColor: "#8f2fff",
                    animation: "spin 6s linear infinite reverse",
                  }}
                />
                {/* X mark */}
                <svg className="w-5 h-5 relative z-10" viewBox="0 0 20 20" fill="none">
                  <line x1="4" y1="4" x2="16" y2="16" stroke="url(#xg)" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="16" y1="4" x2="4" y2="16" stroke="url(#xg)" strokeWidth="2.5" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="xg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6a00ff" />
                      <stop offset="100%" stopColor="#b84dff" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              {/* Text */}
              <div
                className="flex flex-col leading-tight"
                style={{ animation: "logoFadeIn 3s ease forwards", opacity: 0 }}
              >
                <span className="text-sm font-bold text-white tracking-widest uppercase">Akhmads</span>
                <span className="text-[9px] text-purple-400 tracking-[0.15em] uppercase">◆ Digital Advertising</span>
              </div>
            </Link>



            {/* 🔹 Center links — desktop only */}
            <div className="hidden lg:flex bg-white/[0.03] border border-white/10 px-1.5 py-1 rounded-[40px] items-center gap-0.5 text-[12.5px] xl:text-sm backdrop-blur-md">
              <NavLink to={`/${lang}`} end className={navItemClass}>
                {nav?.home ?? "Home"}
              </NavLink>
              {(!isAuthenticated || user?.roles?.includes('ADVERTISER') || user?.role === 'ADVERTISER') && (
                <NavLink to={isAuthenticated ? `/${lang}/my-ads` : `/${lang}/login`} className={navItemClass}>
                  {nav?.myAds ?? "My Ads"}
                </NavLink>
              )}
              {(!isAuthenticated || user?.roles?.includes('BOT_OWNER') || user?.role === 'BOT_OWNER') && (
                <NavLink to={isAuthenticated ? `/${lang}/add-bot` : `/${lang}/login`} className={navItemClass}>
                  {nav?.addBot ?? "Add bot"}
                </NavLink>
              )}
              <NavLink to={`/${lang}/wallet`} className={navItemClass}>
                {nav?.wallet ?? "Wallet"}
              </NavLink>
              <NavLink to={`/${lang}/faq`} className={navItemClass}>
                {nav?.faq ?? "FAQ"}
              </NavLink>
            </div>

            {/* 🔹 Right side — desktop */}
            <div className="hidden md:flex items-center gap-1.5 xl:gap-4 shrink-0">
              {/* 🌍 Language switcher */}
              <div ref={desktopLangRef} className="relative">
                <button
                  onClick={() => setDesktopLangOpen((p) => !p)}
                  aria-haspopup="listbox"
                  aria-expanded={desktopLangOpen}
                  className="text-sm border border-white/10 rounded-full px-4 py-2 bg-white/5 text-white/70 hover:text-white transition"
                >
                  {lang.toUpperCase()}
                </button>

                {desktopLangOpen && (
                  <div
                    role="listbox"
                    className="absolute right-0 mt-2 min-w-[80px] rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg z-50"
                  >
                    {languages
                      .filter((l) => l !== lang)
                      .map((l) => (
                        <button
                          key={l}
                          role="option"
                          onClick={() => { changeLang(l); setDesktopLangOpen(false); }}
                          className="block w-full px-4 py-2 text-left text-sm text-white/70 hover:text-white hover:bg-white/10 transition"
                        >
                          {l.toUpperCase()}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* 🔐 Conditional Buttons */}
              {!isLoginPage && (
                <>
                  {!isAuthenticated ? (
                    <button
                      onClick={() => navigate(`/${lang}/login`)}
                      className="flex items-center gap-1.5 xl:gap-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white px-4 xl:px-6 py-2 text-[12.5px] xl:text-sm font-medium transition active:scale-95 shadow-[0_4px_15px_rgba(147,51,234,0.3)]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>{nav?.logIn ?? "Log In"}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* ✅ Wallet Balance Badge */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/${lang}/wallet`)}
                          className="flex items-center gap-1 xl:gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 xl:px-4 py-2 text-[12.5px] xl:text-sm text-white/80 hover:text-white transition active:scale-95"
                        >
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          {walletLoading ? (
                            <span className="w-12 h-3 bg-white/10 rounded animate-pulse inline-block" />
                          ) : (
                            <span className="font-medium">
                              ${walletBalance !== null ? parseFloat(walletBalance).toFixed(2) : "0.00"}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={fetchWallet}
                          disabled={walletLoading}
                          title="Reload balance"
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition disabled:opacity-40"
                        >
                          <svg
                            className={`w-3.5 h-3.5 ${walletLoading ? "animate-spin" : ""}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>

                      {/* ✅ Launch Ad Button */}
                      {(user?.roles?.includes('ADVERTISER') || user?.role === 'ADVERTISER') && (
                        <button
                          onClick={() => navigate(`/${lang}/launch-ad`)}
                          className="flex items-center gap-1.5 xl:gap-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white px-4 xl:px-6 py-2 text-[12.5px] xl:text-sm font-medium transition active:scale-95 shadow-[0_4px_15px_rgba(147,51,234,0.3)]"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span>{nav?.launchAd ?? "Launch Ad"}</span>
                        </button>
                      )}

                      {/* ✅ User Avatar Dropdown */}
                      <div ref={profileDropdownRef} className="relative">
                        <button
                          onClick={() => setProfileOpen((p) => !p)}
                          className="w-10 h-10 rounded-full overflow-hidden border border-white/10 hover:border-white/30 transition"
                          title={nav?.profile ?? "Profile"}
                        >
                          <img
                            src={avatarUrl}
                            alt={profile?.firstName || user?.firstName || "User"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const name = profile?.firstName || user?.firstName || "U";
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=128&bold=true`;
                            }}
                          />
                        </button>

                        {profileOpen && (
                          <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl py-2">
                            <div className="px-4 py-2 border-b border-white/10">
                              <div className="flex items-center gap-2 mb-1">
                                <img
                                  src={avatarUrl}
                                  alt={profile?.firstName || user?.firstName}
                                  className="w-8 h-8 rounded-full"
                                  onError={(e) => {
                                    const name = profile?.firstName || user?.firstName || "U";
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=64&bold=true`;
                                  }}
                                />
                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    {profile?.firstName || user?.firstName}{" "}
                                    {profile?.lastName || user?.lastName}
                                  </p>
                                  <p className="text-xs text-white/50">
                                    @{profile?.username || user?.username || user?.email}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <button onClick={() => navigate(`/${lang}/profile`)} className="w-full px-4 py-2 text-left text-sm text-white/70 hover:text-white hover:bg-white/10 transition flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                              {nav?.profile ?? "Profile"}
                            </button>

                            {(user?.roles?.includes('ADVERTISER') || user?.role === 'ADVERTISER') && (
                              <button onClick={() => navigate(`/${lang}/my-ads`)} className="w-full px-4 py-2 text-left text-sm text-white/70 hover:text-white hover:bg-white/10 transition flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                {nav?.myAds ?? "My Ads"}
                              </button>
                            )}

                            <button onClick={() => navigate(`/${lang}/wallet`)} className="w-full px-4 py-2 text-left text-sm text-white/70 hover:text-white hover:bg-white/10 transition flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                              {nav?.wallet ?? "Wallet"}
                            </button>

                            <div className="border-t border-white/10 mt-2 pt-2">
                              <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                {nav?.logout ?? "Logout"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 🍔 Mobile right side — lang + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              {/* 🌍 Language switcher - mobile */}
              <div ref={mobileLangRef} className="relative">
                <button
                  onClick={() => setMobileLangOpen((p) => !p)}
                  className="text-xs border border-white/10 rounded-full px-3 py-1.5 bg-white/5 text-white/70 hover:text-white transition"
                >
                  {lang.toUpperCase()}
                </button>
                {mobileLangOpen && (
                  <div className="absolute right-0 mt-2 min-w-[70px] rounded-xl bg-[#1a1a1a] border border-white/10 shadow-lg z-50">
                    {languages.filter((l) => l !== lang).map((l) => (
                      <button
                        key={l}
                        onClick={() => { changeLang(l); setMobileLangOpen(false); }}
                        className="block w-full px-3 py-2 text-left text-xs text-white/70 hover:text-white hover:bg-white/10 transition"
                      >
                        {l.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 🍔 Hamburger button */}
              <button
                onClick={() => setMobileOpen((p) => !p)}
                aria-label="Toggle menu"
                className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* 📱 Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 📱 Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 max-w-[85vw] z-50 bg-[#0f0f0f] border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 h-[70px]">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <div
              className="relative w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "radial-gradient(circle at center, #0f0f2a 40%, #070715 100%)",
                boxShadow: "0 0 14px rgba(120,0,255,0.35), inset 0 0 18px rgba(100,0,255,0.3)",
              }}
            >
              <div className="absolute inset-0 rounded-full" style={{ border: "2px solid transparent", borderTopColor: "#8f2fff", borderBottomColor: "#4b00ff", animation: "spin 6s linear infinite" }} />
              <div className="absolute inset-[3px] rounded-full" style={{ border: "2px solid transparent", borderTopColor: "#4b00ff", borderBottomColor: "#8f2fff", animation: "spin 6s linear infinite reverse" }} />
              <svg className="w-4 h-4 relative z-10" viewBox="0 0 20 20" fill="none">
                <line x1="4" y1="4" x2="16" y2="16" stroke="url(#dxg)" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="16" y1="4" x2="4" y2="16" stroke="url(#dxg)" strokeWidth="2.5" strokeLinecap="round" />
                <defs><linearGradient id="dxg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6a00ff" /><stop offset="100%" stopColor="#b84dff" /></linearGradient></defs>
              </svg>
            </div>
            <div
              className="flex flex-col leading-tight"
              style={{ animation: "logoFadeIn 3s ease forwards", opacity: 0 }}
            >
              <span className="text-white font-bold text-sm tracking-widest uppercase">Akhmads</span>
              <span className="text-[9px] text-purple-400 tracking-[0.12em] uppercase">◆ Digital Advertising</span>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition text-white/60 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer content */}
        <div className="overflow-y-auto h-[calc(100%-70px)]">
          {/* User info if authenticated */}
          {isAuthenticated && (
            <div className="px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={avatarUrl}
                  alt={profile?.firstName || user?.firstName || "User"}
                  className="w-10 h-10 rounded-full ring-2 ring-purple-500/40"
                  onError={(e) => {
                    const name = profile?.firstName || user?.firstName || "U";
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=128&bold=true`;
                  }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {profile?.firstName || user?.firstName} {profile?.lastName || user?.lastName}
                  </p>
                  <p className="text-xs text-white/50 truncate">
                    @{profile?.username || user?.username || user?.email}
                  </p>
                </div>
              </div>
              {/* Wallet balance — mobile */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => { navigate(`/${lang}/wallet`); setMobileOpen(false); }}
                  className="flex-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-sm text-white/80 hover:text-white transition"
                >
                  <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  {walletLoading ? (
                    <span className="w-14 h-3 bg-white/10 rounded animate-pulse inline-block" />
                  ) : (
                    <span className="font-medium">
                      ${walletBalance !== null ? parseFloat(walletBalance).toFixed(2) : "0.00"}
                    </span>
                  )}
                </button>
                <button
                  onClick={fetchWallet}
                  disabled={walletLoading}
                  title="Reload balance"
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition disabled:opacity-40"
                >
                  <svg
                    className={`w-4 h-4 ${walletLoading ? "animate-spin" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Nav links */}
          <nav className="px-3 py-4 space-y-1">
            <NavLink
              to={`/${lang}`}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`
              }
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              {nav?.home ?? "Home"}
            </NavLink>

            {(!isAuthenticated || user?.roles?.includes('ADVERTISER') || user?.role === 'ADVERTISER') && (
              <NavLink
                to={isAuthenticated ? `/${lang}/my-ads` : `/${lang}/login`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`
                }
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                {nav?.myAds ?? "My Ads"}
              </NavLink>
            )}

            {(!isAuthenticated || user?.roles?.includes('BOT_OWNER') || user?.role === 'BOT_OWNER') && (
              <NavLink
                to={isAuthenticated ? `/${lang}/add-bot` : `/${lang}/login`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`
                }
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                {nav?.addBot ?? "Add bot"}
              </NavLink>
            )}

            <NavLink
              to={`/${lang}/wallet`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`
              }
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              {nav?.wallet ?? "Wallet"}
            </NavLink>

            <NavLink
              to={`/${lang}/faq`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`
              }
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {nav?.faq ?? "FAQ"}
            </NavLink>
          </nav>

          {/* Bottom actions */}
          <div className="px-3 py-4 border-t border-white/10 space-y-2">
            {!isLoginPage && (
              <>
                {!isAuthenticated ? (
                  <button
                    onClick={() => navigate(`/${lang}/login`)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 text-sm font-medium transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                    {nav?.logIn ?? "Log In"}
                  </button>
                ) : (
                  <>
                    {(user?.roles?.includes('ADVERTISER') || user?.role === 'ADVERTISER') && (
                      <button
                        onClick={() => navigate(`/${lang}/launch-ad`)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 text-sm font-medium transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        {nav?.launchAd ?? "Launch Ad"}
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/${lang}/profile`)}
                      className="w-full flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-4 py-3 text-sm transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {nav?.profile ?? "Profile"}
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-4 py-3 text-sm transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      {nav?.logout ?? "Logout"}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;