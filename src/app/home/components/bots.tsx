import { useEffect, useState } from "react";
import { useTranslations } from "../../../hooks/useTranslations";
import Marquee from "react-fast-marquee";
import { motion } from "motion/react";
import botService from "../../../services/bot.service";
import { getBotAvatarUrl } from "../../../api/api";
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
        if (
          response.success &&
          response.data.bots &&
          response.data.bots.length > 0
        ) {
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
    return getBotAvatarUrl(bot.username || "");
  };

  // Split bots into two rows for a more dynamic "cloud" effect
  // If we don't have enough bots, we double them to ensure the marquee is full
  const displayBots =
    bots.length > 0
      ? bots.length < 10
        ? [...bots, ...bots, ...bots]
        : bots
      : FEATURED_BOTS;

  const midPoint = Math.ceil(displayBots.length / 2);
  const row1 = displayBots.slice(0, midPoint);
  const row2 = displayBots.slice(midPoint);

  return (
    <section className="my-28 overflow-hidden relative">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Title Area */}
      <div className="main-container mb-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent border border-border mb-6 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {t.homeBots?.badge || "Live Network"}
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight mb-6 italic">
            {t.homeBots?.title}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
            {t.homeBots?.subtitle}
          </p>
        </motion.div>
      </div>

      {/* Marquee Container */}
      <div className="relative space-y-8 z-10">
        {/* Gradient Overlays */}
        <div className="absolute inset-y-0 left-0 w-48 z-20 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-48 z-20 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none" />

        {/* First Row - Left to Right */}
        <Marquee
          gradient={false}
          speed={40}
          pauseOnHover={true}
          autoFill={true}
          className="py-4"
        >
          {row1.map((bot: Partial<Bot>, index: number) => (
            <BotCard key={`row1-${index}`} bot={bot} getAvatar={getAvatar} />
          ))}
        </Marquee>

        {/* Second Row - Left to Right but offset by 50% */}
        <Marquee
          gradient={false}
          speed={40}
          pauseOnHover={true}
          autoFill={true}
          direction="left"
          className="py-4"
        >
          {/* Spacer to create the stagger effect (half card width + gap) */}
          <div className="w-[186px] flex-shrink-0" />
          {row2.map((bot: Partial<Bot>, index: number) => (
            <BotCard key={`row2-${index}`} bot={bot} getAvatar={getAvatar} />
          ))}
        </Marquee>
      </div>
    </section>
  );
};

const BotCard = ({ bot, getAvatar }: { bot: Partial<Bot>; getAvatar: any }) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.05 }}
    className="
      mx-6 flex items-center gap-5
      w-[360px] p-6
      rounded-3xl border border-border
      bg-card/50
      backdrop-blur-xl shadow-xl shadow-black/5
      relative group
      transition-all duration-500
      hover:border-primary/40
      hover:bg-card
    "
  >
    <div className="relative h-16 w-16 flex-shrink-0">
      <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
      <img
        src={getAvatar(bot)}
        alt={bot.firstName}
        className="h-full w-full rounded-full object-cover border-2 border-border relative z-10 shadow-lg"
        onError={(e: any) => {
          e.target.src = `https://ui-avatars.com/api/?name=${bot.username || bot.firstName}&background=random&color=fff&size=128`;
        }}
      />
    </div>

    <div className="flex flex-col overflow-hidden min-w-0 flex-grow">
      <h3 className="text-xl font-black text-foreground truncate group-hover:text-primary transition-colors italic tracking-tight">
        {bot.firstName}
      </h3>
      <div className="flex items-center gap-3 mt-1">
        <span className="text-sm font-bold text-muted-foreground truncate opacity-70">
          @{bot.username}
        </span>
        {bot.totalMembers && (
          <span className="flex items-center text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-black border border-green-500/20 shadow-sm">
            {Math.floor(bot.totalMembers / 1000)}k+
          </span>
        )}
      </div>
    </div>

    {/* Glow effect */}
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  </motion.div>
);

export default ConnectedBots;
