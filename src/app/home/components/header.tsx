"use client";

import { brandIcons } from "@/data/brandicons";
import { useNavigate } from "react-router-dom";

const GAP = "w-24"; // bo'sh joy (xohlasangiz w-16, w-32)

const Header = () => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/uz/profile");
  };

  return (
    <header className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/src/assets/images/herobg.png')" }}
      />
      <div className="absolute inset-0 bg-black/70" />

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
          onClick={handleProfileClick}
          className="mt-8 px-7 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition cursor-pointer"
        >
          Reklama berish
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