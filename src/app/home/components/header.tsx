// src/app/home/components/Header.tsx
"use client";

import { brandIcons } from "@/data/brandicons";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { useUserStore } from "../../../store/userStore";
import { useEffect } from "react";
import { useTranslations } from "../../../hooks/useTranslations";

const GAP = "w-24";

const Header = () => {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang?: string }>();
  const { isAuthenticated, user } = useAuthStore();
  const { profile, fetchProfile } = useUserStore();
  const t = useTranslations();

  // ✅ Fetch profile once on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && !profile) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const handleCTAClick = () => {
    if (isAuthenticated) {
      navigate(`/${lang}/launch-ad`);
    } else {
      navigate(`/${lang}/login`);
    }
  };

  return (
    <header className="relative min-h-screen overflow-hidden flex items-center justify-center bg-black">
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full">
        <h1 className="text-[42px] md:text-[52px] leading-tight font-medium text-white">
          {t.homeHeader?.title}
        </h1>

        <p className="mt-4 max-w-xl text-sm md:text-base text-white/70">
          {t.homeHeader?.subtitle}
        </p>

        <button
          onClick={handleCTAClick}
          className="mt-8 px-7 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition cursor-pointer"
        >
          {isAuthenticated ? t.homeHeader?.ctaLaunch : t.homeHeader?.ctaStart}
        </button>

        {/* === SEAMLESS MARQUEE WITH GAP === */}
        <div className="mt-20 w-full">
          <p className="text-xs uppercase tracking-widest text-white/30 mb-6">
            Trusted by
          </p>
          <div className="relative w-full overflow-hidden">
            {/* Left fade */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10 bg-gradient-to-r from-black to-transparent" />
            {/* Right fade */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10 bg-gradient-to-l from-black to-transparent" />

            <div className="relative flex w-max animate-marquee">
              {/* Track A */}
              <div className="flex items-center gap-6">
                {brandIcons.map((icon, i) => (
                  <div
                    key={`a-${i}`}
                    className="flex items-center justify-center px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-default"
                  >
                    <img
                      src={icon.src}
                      alt={icon.alt}
                      className="h-7 md:h-8 opacity-70 hover:opacity-100 transition-opacity duration-300 select-none"
                      draggable={false}
                    />
                  </div>
                ))}
                <div className={GAP} />
              </div>

              {/* Track B (clone) */}
              <div className="flex items-center gap-6">
                {brandIcons.map((icon, i) => (
                  <div
                    key={`b-${i}`}
                    className="flex items-center justify-center px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-default"
                  >
                    <img
                      src={icon.src}
                      alt={icon.alt}
                      className="h-7 md:h-8 opacity-70 hover:opacity-100 transition-opacity duration-300 select-none"
                      draggable={false}
                    />
                  </div>
                ))}
                <div className={GAP} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 32s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </header>
  );
};

export default Header;