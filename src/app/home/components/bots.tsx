import { useEffect, useRef } from "react";

const bots = [
  { title: "Tech News Bot", users: "45.2K users" },
  { title: "Shopping Assistant", users: "30.1K users" },
  { title: "Business Hub", users: "25.8K users" },
  { title: "Travel Planner", users: "12.4K users" },
  { title: "Crypto Signals", users: "18.9K users" },
  { title: "Job Finder", users: "22.7K users" },
];

const ConnectedBots = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollLeft = 0;
    const speed = 1;
    let rafId: number;

    const animate = () => {
      if (!isHovering.current) {
        scrollLeft += speed;

        if (scrollLeft >= container.scrollWidth / 2) {
          scrollLeft = 0;
        }

        container.scrollLeft = scrollLeft;
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section className="main-container my-28 overflow-hidden">
      {/* Title */}
      <div className="mb-12 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">
          Platformamizga ulangan botlar
        </h2>
        <p className="mt-2 text-sm text-white/50">
          Har kuni o‘sib borayotgan tarmoq
        </p>
      </div>

      {/* Slider */}
      <div
        ref={scrollRef}
        onMouseEnter={() => (isHovering.current = true)}
        onMouseLeave={() => (isHovering.current = false)}
        className="
          flex gap-6 overflow-hidden whitespace-nowrap
          mask-gradient
        "
      >
        {[...bots, ...bots].map((bot, index) => (
          <div
            key={index}
            className="
              relative min-w-[260px]
              rounded-2xl p-5
              border border-white/10
              bg-white/[0.02]
              transition-all duration-300
            "
          >
            <h3 className="text-base font-medium text-white">{bot.title}</h3>
            <p className="mt-2 text-xs text-white/50">{bot.users}</p>

            {/* glow */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-500/5 via-transparent to-transparent" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ConnectedBots;
