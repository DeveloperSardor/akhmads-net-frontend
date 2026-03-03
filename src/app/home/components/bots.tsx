import { useEffect, useState } from "react";
import { useTranslations } from "../../../hooks/useTranslations";
import Marquee from "react-fast-marquee";
import { motion } from "motion/react";
import botService from "../../../services/bot.service";
import { API_BASE_URL, getBotAvatarUrl } from "../../../api/api";
import type { Bot } from "../../../types/bot.types";

const FEATURED_BOTS: Partial<Bot>[] = [
  { username: "PremiumNewsBot", firstName: "News Bot", totalMembers: 45200 },
  {
    username: "ShopSmartBot",
    firstName: "Shopping Assistant",
    totalMembers: 30100,
  },
  { username: "BizHubBot", firstName: "Business Hub", totalMembers: 25800 },
  {
    username: "TravelProBot",
    firstName: "Travel Planner",
    totalMembers: 12400,
  },
  {
    username: "CryptoSignalsBot",
    firstName: "Crypto Signals",
    totalMembers: 18900,
  },
  { username: "JobSearchBot", firstName: "Job Finder", totalMembers: 22700 },
];

const ConnectedBots = () => {
  const t = useTranslations();
  const [bots, setBots] = useState<Partial<Bot>[]>([]);

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const response = await botService.getPublicBots();
        if (response.success && response.data.bots.length > 0) {
          setBots(response.data.bots);
        } else {
          setBots(FEATURED_BOTS);
        }
      } catch (error) {
        console.error("Failed to fetch bots:", error);
        setBots(FEATURED_BOTS);
      }
    };

    fetchBots();
  }, []);

  const getAvatar = (bot: Partial<Bot>) => {
    if (bot.avatarUrl) {
      return bot.avatarUrl.startsWith("http")
        ? bot.avatarUrl
        : `${API_BASE_URL.replace("/api/v1", "")}${bot.avatarUrl}`;
    }
    return getBotAvatarUrl(bot.username || "");
  };

  return (
    <section className="my-28 overflow-hidden">
      {/* Title Area */}
      <div className="main-container mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            {t.homeBots?.title}
          </h2>
          <p className="mt-4 text-base md:text-lg text-white/50 max-w-2xl mx-auto">
            {t.homeBots?.subtitle}
          </p>
        </motion.div>
      </div>

      {/* Marquee Slider */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute inset-y-0 left-0 w-32 z-10 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 z-10 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />

        <Marquee
          gradient={false}
          speed={40}
          pauseOnHover={true}
          autoFill={true}
          className="py-10"
        >
          {bots.map((bot: Partial<Bot>, index: number) => (
            <motion.div
              key={index}
              whileHover={{ y: -5, scale: 1.02 }}
              className="
                mx-3 flex items-center gap-4
                w-[320px] p-4
                rounded-2xl border border-white/10
                bg-gradient-to-br from-white/[0.05] to-transparent
                backdrop-blur-sm shadow-xl
                transition-shadow duration-300 hover:shadow-purple-500/10
              "
            >
              <div className="relative h-14 w-14 flex-shrink-0">
                <img
                  src={getAvatar(bot)}
                  alt={bot.firstName}
                  className="h-full w-full rounded-full object-cover border-2 border-white/10"
                  onError={(e: any) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${bot.username}&background=random&color=fff`;
                  }}
                />
              </div>

              <div className="flex flex-col overflow-hidden min-w-0">
                <h3 className="text-lg font-semibold text-white truncate">
                  {bot.firstName}
                </h3>
                <div className="mt-0.5">
                  <span className="text-sm font-medium text-white/40">
                    @{bot.username}
                  </span>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-500/10 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default ConnectedBots;
