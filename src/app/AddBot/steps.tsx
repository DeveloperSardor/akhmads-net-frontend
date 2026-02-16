const Steps = () => {
  const steps = [
    {
      number: 1,
      title: "Create Bot",
      description: "Open @BotFather on Telegram and create a new bot using /newbot command",
    },
    {
      number: 2,
      title: "Get Token",
      description: "Copy the bot token provided by BotFather",
    },
    {
      number: 3,
      title: "Verify",
      description: "Paste the token here and click 'Verify Bot'",
    },
    {
      number: 4,
      title: "Configure",
      description: "Fill in bot details and enable monetization if desired",
    },
    {
      number: 5,
      title: "Register",
      description: "Click 'Register Bot' to complete the setup",
    },
  ];

  return (
    <div>
      <h3 className="mb-4 text-base font-semibold">How to add a bot</h3>
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.number} className="flex gap-3">
            {/* Number circle */}
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 text-sm font-bold text-purple-400">
              {step.number}
            </div>

            {/* Content */}
            <div>
              <h4 className="text-sm font-medium text-white">{step.title}</h4>
              <p className="mt-1 text-xs leading-relaxed text-white/50">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Helpful Links */}
      <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <h4 className="mb-2 text-sm font-medium">Helpful Links</h4>
        <div className="space-y-2">
          <a
            href="https://t.me/BotFather"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-purple-400 hover:text-purple-300 hover:underline"
          >
            → Open @BotFather
          </a>
          <a
            href="https://core.telegram.org/bots"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-purple-400 hover:text-purple-300 hover:underline"
          >
            → Telegram Bot API Docs
          </a>
        </div>
      </div>
    </div>
  );
};

export default Steps;