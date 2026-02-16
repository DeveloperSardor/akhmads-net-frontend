import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const languages = ["uz", "eng", "ru"] as const;
type Lang = (typeof languages)[number];

const Navbar = () => {
  const { lang: urlLang } = useParams<{ lang?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();

  const lang: Lang = languages.includes(urlLang as Lang)
    ? (urlLang as Lang)
    : "uz";

  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  /* 🔒 Tashqariga bosilganda yopish */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(e.target as Node)
      ) {
        setLangOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* 🔁 Route o'zgarganda dropdown yopilsin */
  useEffect(() => {
    setLangOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

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
    `px-4 py-2 rounded-[30px] transition ${isActive ? "bg-white/20 text-white" : "text-white/70 hover:text-white"
    }`;

  const isLoginPage = location.pathname.includes('/login');

  return (
    <nav className="fixed top-0 left-0 w-full z-50">
      <div className="h-[80px] w-full bg-black/20 backdrop-blur-[16px]">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* 🔹 Logo */}
          <Link
            to={`/${lang}`}
            className="text-lg font-semibold text-white hover:opacity-90 transition"
          >
            Akhmads net
          </Link>

          {/* 🔹 Center links */}
          <div className="hidden md:flex border border-white/10 px-4 py-2 rounded-[40px] items-center gap-2 text-sm">
            <NavLink to={`/${lang}`} end className={navItemClass}>
              Home
            </NavLink>
            {/* ✅ NEW - My Ads Link */}
            {isAuthenticated && (
              <NavLink to={`/${lang}/my-ads`} className={navItemClass}>
                My Ads
              </NavLink>
            )}
            <NavLink to={`/${lang}/add-bot`} className={navItemClass}>
              Add bot
            </NavLink>
            <NavLink to={`/${lang}/wallet`} className={navItemClass}>
              Wallet
            </NavLink>
            <NavLink to={`/${lang}/faq`} className={navItemClass}>
              FAQ
            </NavLink>
          </div>

          {/* 🔹 Right side */}
          <div className="flex items-center gap-4">
            {/* 🌍 Language switcher */}
            <div ref={langDropdownRef} className="relative">
              <button
                onClick={() => setLangOpen((p) => !p)}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                className="text-sm border border-white/10 rounded-full px-4 py-2 bg-white/5 text-white/70 hover:text-white transition"
              >
                {lang.toUpperCase()}
              </button>

              {langOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 mt-2 min-w-[80px] rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg"
                >
                  {languages
                    .filter((l) => l !== lang)
                    .map((l) => (
                      <button
                        key={l}
                        role="option"
                        onClick={() => changeLang(l)}
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
                  // ❌ Agar login qilmagan bo'lsa - "Log in" button
                  <button
                    onClick={() => navigate(`/${lang}/login`)}
                    className="flex items-center gap-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 text-sm font-medium transition"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Log In</span>
                  </button>
                ) : (
                  // ✅ Agar login qilgan bo'lsa - "Launch Ad" + Avatar
                  <div className="flex items-center gap-3">
                    {/* ✅ Launch Ad Button */}
                    <button
                      onClick={() => navigate(`/${lang}/launch-ad`)}
                      className="flex items-center gap-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 text-sm font-medium transition"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>Launch Ad</span>
                    </button>

                    {/* ✅ User Avatar Dropdown */}
                    <div ref={profileDropdownRef} className="relative">
                      <button
                        onClick={() => setProfileOpen((p) => !p)}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold hover:opacity-90 transition"
                      >
                        {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                      </button>

                      {/* ✅ Dropdown Menu */}
                      {profileOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl py-2">
                          <div className="px-4 py-2 border-b border-white/10">
                            <p className="text-sm font-semibold text-white">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-white/50">
                              @{user?.username || user?.email}
                            </p>
                          </div>

                          <button
                            onClick={() => navigate(`/${lang}/profile`)}
                            className="w-full px-4 py-2 text-left text-sm text-white/70 hover:text-white hover:bg-white/10 transition flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile
                          </button>

                          <button
                            onClick={() => navigate(`/${lang}/my-ads`)}
                            className="w-full px-4 py-2 text-left text-sm text-white/70 hover:text-white hover:bg-white/10 transition flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            My Ads
                          </button>

                          <button
                            onClick={() => navigate(`/${lang}/wallet`)}
                            className="w-full px-4 py-2 text-left text-sm text-white/70 hover:text-white hover:bg-white/10 transition flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Wallet
                          </button>

                          <div className="border-t border-white/10 mt-2 pt-2">
                            <button
                              onClick={handleLogout}
                              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Logout
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;