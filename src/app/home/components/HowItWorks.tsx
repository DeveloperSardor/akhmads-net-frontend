const steps = [
  {
    step: "01",
    title: "Reklama yarating",
    description:
      "Matn, media va CTA tugmani kiriting, o‘z reklamangizni qisqa muddatda tayyorlang",
  },
  {
    step: "02",
    title: "AI tahlil qiladi",
    description:
      "Matn, media va CTA tugmani kiritgach darhol AI sizning postingizni tahlil qiladi",
  },
  {
    step: "03",
    title: "Botlar orqali tarqatiladi",
    description:
      "Matn, media va CTA tugmani kiritgach darhol AI sizning postingizni tahlil qiladi",
  },
];

const HowItWorks = () => {
  return (
    <section className="main-container my-24">
      {/* Title */}
      <div className="mb-14 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">
          Qanday ishlaydi?
        </h2>
        <p className="mt-2 text-sm text-white/50">
          3 oddiy qadam bilan reklama boshlang
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((item, index) => (
          <div
            key={index}
            className="
              relative overflow-hidden rounded-2xl p-6
              border border-white/10
              transition-all duration-300
              hover:-translate-y-1 hover:border-white/20
            "
          >
            {/* Step badge */}
            <div className="mb-6 inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs text-purple-400">
              {item.step}
            </div>

            {/* Content */}
            <h3 className="mb-2 text-lg font-medium text-white">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-white/60">
              {item.description}
            </p>

            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-500/5 via-transparent to-transparent" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
