// src/app/home/components/Header.tsx
"use client";

import { brandIcons } from "@/data/brandicons";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { useUserStore } from "../../../store/userStore";
import { useEffect } from "react";

const GAP = "w-24";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { profile, fetchProfile } = useUserStore();

  // ✅ Fetch profile once on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && !profile) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const handleCTAClick = () => {
    if (isAuthenticated) {
      navigate("/launch-ad");
    } else {
      navigate("/login");
    }
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  // ✅ Avatar URL - Priority: profile > user > fallback
  const getAvatarUrl = () => {
    const avatarUrl = profile?.avatarUrl || user?.avatarUrl;
    if (avatarUrl) {
      return avatarUrl;
    }
    
    const name = profile?.firstName || user?.firstName || "U";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=8b5cf6&color=fff&size=80&bold=true`;
  };

  return (
    <header className="relative min-h-screen overflow-hidden flex items-center justify-center bg-black">
      {/* ✅ Background - NO PINK GRADIENT, reduced opacity */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('/src/assets/images/herobg.png')" }}
      />

      {/* ✅ Profile Avatar - Top Right (only if authenticated) */}
      {isAuthenticated && (
        <button
          onClick={handleProfileClick}
          className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-500/50 hover:ring-purple-500 transition bg-gradient-to-br from-purple-500 to-pink-500"
          title="Profile"
        >
          <img
            src={getAvatarUrl()}
            alt={profile?.firstName || user?.firstName || "User"}
            className="w-full h-full object-cover"
            onError={(e) => {
              const name = profile?.firstName || user?.firstName || "U";
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                name
              )}&background=8b5cf6&color=fff&size=80&bold=true`;
            }}
          />
        </button>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full">
        <h1 className="text-[42px] md:text-[52px] leading-tight font-medium text-white">
          Telegramda reklama berish <br /> yanada tez va oson
        </h1>

        <p className="mt-4 max-w-xl text-sm md:text-base text-white/70">
          Telegram — 13 mlrd aktiv foydalanuvchiga ega. Nega sizning reklamangiz
          ular ko'radigan joyda bo'lmasligi kerak?
        </p>

        <button
          onClick={handleCTAClick}
          className="mt-8 px-7 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition cursor-pointer"
        >
          {isAuthenticated ? "Reklama berish" : "Boshlash"}
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