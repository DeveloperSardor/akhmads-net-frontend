import { useTranslations } from "../../../hooks/useTranslations";

const HowItWorks = () => {
  const t = useTranslations();
  const steps: { step: string; title: string; description: string }[] =
    t.homeHowItWorks?.steps ?? [];

  return (
    <section className="main-container my-24">
      {/* Title */}
      <div className="mb-14 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
          {t.homeHowItWorks?.title}
        </h2>
        <p className="mt-2 text-sm text-foreground/50">
          {t.homeHowItWorks?.subtitle}
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map(
          (
            item: { step: string; title: string; description: string },
            index: number,
          ) => (
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
              {/* Step badge */}
              <div className="mb-6 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-400">
                {item.step}
              </div>

              {/* Content */}
              <h3 className="mb-2 text-lg font-medium text-foreground">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-foreground/60">
                {item.description}
              </p>

              {/* Glow */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-500/5 via-transparent to-transparent" />
            </div>
          ),
        )}
      </div>
    </section>
  );
};

export default HowItWorks;
