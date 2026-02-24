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
        <div className="mt-20 w-full overflow-hidden">
          <div className="relative flex w-max animate-marquee">
            {/* Track A */}
            <div className="flex items-center gap-16">
              {brandIcons.map((icon, i) => (
                <img
                  key={`a-${i}`}
                  src={icon.src}
                  alt={icon.alt}
                  className="h-8 md:h-10 opacity-80 hover:opacity-100 transition select-none"
                  draggable={false}
                />
              ))}
              <div className={GAP} />
            </div>

            {/* Track B (clone) */}
            <div className="flex items-center gap-16">
              {brandIcons.map((icon, i) => (
                <img
                  key={`b-${i}`}
                  src={icon.src}
                  alt={icon.alt}
                  className="h-8 md:h-10 opacity-80 hover:opacity-100 transition select-none"
                  draggable={false}
                />
              ))}
              <div className={GAP} />
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
          animation: marquee 28s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </header>
  );
};

export default Header;