import { useTranslations } from "../../hooks/useTranslations";

const Steps = () => {
  const t = useTranslations();
  const ab = t.addBot;
  const steps = ab?.steps.items ?? [];

  return (
    <div>
      <h3 className="mb-4 text-base font-semibold">{ab?.steps.title}</h3>
      <div className="space-y-4">
        {steps.map(
          (step: { title: string; description: string }, index: number) => (
            <div key={index} className="flex gap-3">
              {/* Number circle */}
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 text-sm font-bold text-purple-400">
                {index + 1}
              </div>

              {/* Content */}
              <div>
                <h4 className="text-sm font-medium text-foreground">
                  {step.title}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-foreground/50">
                  {step.description}
                </p>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Helpful Links */}
      <div className="mt-6 rounded-lg border border-border bg-accent/20 p-4">
        <h4 className="mb-2 text-sm font-medium">{ab?.steps.helpfulLinks}</h4>
        <div className="space-y-2">
          <a
            href="https://t.me/BotFather"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-primary hover:text-primary/80 hover:underline"
          >
            → Open @BotFather
          </a>
          <a
            href="https://core.telegram.org/bots"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-primary hover:text-primary/80 hover:underline"
          >
            → Telegram Bot API Docs
          </a>
        </div>
      </div>
    </div>
  );
};

export default Steps;
