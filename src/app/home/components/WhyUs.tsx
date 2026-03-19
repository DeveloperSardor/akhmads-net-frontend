import { Megaphone, Layers, Sparkles } from "lucide-react";
import { useTranslations } from "../../../hooks/useTranslations";

const icons = [Megaphone, Layers, Sparkles];

const WhyUs = () => {
  const t = useTranslations();
  const features: { title: string; description: string }[] =
    t.homeWhyUs?.features ?? [];

  return (
    <section className="main-container my-24">
      {/* Title */}
      <div className="text-center mb-14">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
          {t.homeWhyUs?.title}
        </h2>
        <p className="mt-2 text-sm text-foreground/60">
          {t.homeWhyUs?.subtitle}
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map(
          (item: { title: string; description: string }, index: number) => {
            const Icon = icons[index] ?? Sparkles;
            return (
              <div
                key={index}
                className="
                relative overflow-hidden rounded-2xl p-6
                border border-border/60
                transition-all duration-300
                hover:-translate-y-1 hover:border-primary/20
                bg-card/30 backdrop-blur-sm shadow-sm
              "
              >
                {/* Icon */}
                <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
                  <Icon className="h-5 w-5 text-purple-400" />
                </div>

                {/* Content */}
                <h3 className="text-foreground text-lg font-medium mb-10">
                  {item.title}
                </h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  {item.description}
                </p>

                {/* subtle glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-500/5 via-transparent to-transparent" />
              </div>
            );
          },
        )}
      </div>
    </section>
  );
};

export default WhyUs;
