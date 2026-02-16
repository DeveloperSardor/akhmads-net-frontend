import { Megaphone, Layers, Sparkles } from "lucide-react";

const features = [
  {
    icon: Megaphone,
    title: "Samarali Tarqatish",
    description: "AI yordamida eng mos auditoriyaga reklamani yetkazamiz",
  },
  {
    icon: Layers,
    title: "Keng Qamrov",
    description: "Minglab faol foydalanuvchilar va botlar tarmog‘i",
  },
  {
    icon: Sparkles,
    title: "AI Tavsiyalar",
    description: "Real vaqt rejimida CTR oshirish bo‘yicha maslahatlar",
  },
];

const WhyUs = () => {
  return (
    <section className="main-container my-24">
      {/* Title */}
      <div className="text-center mb-14">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">
          Biz sizning reklamangizni minglab <br />
          foydalanuvchilarga yetkazamiz
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Reklama beruvchilar uchun qulay platforma
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="
                relative overflow-hidden rounded-2xl p-6
                border border-white/10
                transition-all duration-300
                hover:-translate-y-1 hover:border-white/20
              "
            >
              {/* Icon */}
              <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
                <Icon className="h-5 w-5 text-purple-400" />
              </div>

              {/* Content */}
              <h3 className="text-white text-lg font-medium mb-10">
                {item.title}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                {item.description}
              </p>

              {/* subtle glow */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-500/5 via-transparent to-transparent" />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default WhyUs;
