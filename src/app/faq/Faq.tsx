// src/pages/Faq.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Send, CheckCircle, AlertCircle } from "lucide-react";
import apiClient from "../../api/api";

const faqData = [
  {
    section: "General",
    items: [
      {
        q: "How does AKHMAD NET work?",
        a: "Our platform acts as a bridge between advertisers and bot owners. Advertisements are distributed to the appropriate audience using AI.",
      },
      {
        q: "Is registration free?",
        a: "Yes, registration is completely free.",
      },
      { q: "In which countries do you operate?", a: "We operate globally." },
      { q: "In which currencies do you operate?", a: "USD, EUR and USDT." },
    ],
  },
  {
    section: "Advertisement",
    items: [
      {
        q: "When will the advertisement start showing?",
        a: "After moderation approval.",
      },
      {
        q: "What should the minimum budget be?",
        a: "The minimum budget is $10.",
      },
      {
        q: "Can the advertisement be stopped?",
        a: "Yes, anytime from your dashboard.",
      },
    ],
  },
  {
    section: "Bot",
    items: [
      {
        q: "What should I do if my bot is not approved?",
        a: "Check guidelines and resubmit.",
      },
      { q: "Can I add multiple bots?", a: "Yes, you can add unlimited bots." },
      {
        q: "How much do bot owners earn?",
        a: "Earnings depend on traffic and ads.",
      },
    ],
  },
  {
    section: "Payment",
    items: [
      {
        q: "How are payments processed?",
        a: "Payments are processed automatically.",
      },
      { q: "Can money be refunded?", a: "Refunds are reviewed case by case." },
      {
        q: "What payment methods do you accept?",
        a: "Visa, Mastercard, USDT.",
      },
    ],
  },
];

const AccordionItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-4 text-left text-sm text-white"
      >
        {q}
        {open ? <Minus size={18} /> : <Plus size={18} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-6 pb-4 text-sm text-white/70"
          >
            {a}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Faq = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.message.length < 20) {
      setError("Message must be at least 20 characters");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await apiClient.post("/contact", {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        subject: "General Inquiry",
      });

      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-26 text-white">
      <div className="mb-16 text-center">
        <h1 className="mb-2 text-4xl font-semibold">FAQ & Support</h1>
        <p className="text-white/60">
          Frequently Asked Questions and Help Center
        </p>
      </div>

      <div className="space-y-10">
        {faqData.map((group) => (
          <div key={group.section} className="space-y-4">
            <h2 className="text-lg font-medium text-white/80">
              {group.section}
            </h2>
            <div className="space-y-3">
              {group.items.map((item) => (
                <AccordionItem key={item.q} {...item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 text-center">
        <h2 className="mb-2 text-3xl font-semibold">Contact us</h2>
        <p className="mb-10 text-white/60">
          Couldn't find an answer? Send us a message.
        </p>

        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8">
          <h3 className="mb-6 text-left text-lg font-medium">Send Message</h3>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-sm text-green-400">
                Message sent successfully! We'll get back to you soon.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name"
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-purple-500 transition"
                required
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-purple-500 transition"
                required
              />
            </div>

            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Write your message..."
              className="mt-4 h-32 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-purple-500 transition resize-none"
              required
              minLength={20}
            />

            <p className="mt-2 text-left text-xs text-white/40">
              Minimum 20 characters ({formData.message.length}/20)
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-full bg-purple-600 py-3 text-sm font-medium transition hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Faq;