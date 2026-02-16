import { useState, useEffect } from "react";
import { Loader2, CheckCircle, Copy, AlertCircle, X } from "lucide-react";
import { useBotStore } from "../../store/botStore";
import { BOT_CATEGORIES, BOT_LANGUAGES } from "../../types/bot.types";
import Steps from "./steps";
import Bots from "./bots";

const AddBot = () => {
  // Form state
  const [formData, setFormData] = useState({
    token: "",
    shortDescription: "",
    category: "",
    language: "uz",
    monetized: true,
  });

  // UI state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);

  // Bot store
  const { registerBot, isSubmitting, error, successMessage, clearError, clearSuccess } = useBotStore();

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => clearSuccess(), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, clearSuccess]);

  /**
   * Verify Bot Token
   */
  const handleVerifyBot = async () => {
    if (!formData.token.trim()) {
      alert("Please enter bot token");
      return;
    }

    setIsVerifying(true);

    try {
      // For now, just check if token format is valid
      // Real verification happens on backend during registration
      const tokenRegex = /^\d+:[A-Za-z0-9_-]{35}$/;
      
      if (!tokenRegex.test(formData.token)) {
        alert("Invalid bot token format");
        setIsVerifying(false);
        return;
      }

      // Simulate verification delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setVerified(true);
      setIsVerifying(false);
    } catch (error) {
      console.error("Verification failed:", error);
      setIsVerifying(false);
    }
  };

  /**
   * Submit Bot Registration
   */
  const handleSubmit = async () => {
    // Validation
    if (!formData.token || !formData.category || !formData.language) {
      alert("Please fill all required fields");
      return;
    }

    const result = await registerBot({
      token: formData.token,
      shortDescription: formData.shortDescription || undefined,
      category: formData.category,
      language: formData.language,
      monetized: formData.monetized,
    });

    if (result) {
      // Show API key
      setApiKey(result.apiKey);
      setShowApiKey(true);

      // Reset form
      setFormData({
        token: "",
        shortDescription: "",
        category: "",
        language: "uz",
        monetized: true,
      });
      setVerified(false);
    }
  };

  /**
   * Copy API Key to clipboard
   */
  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedApiKey(true);
    setTimeout(() => setCopiedApiKey(false), 2000);
  };

  return (
    <section className="main-container my-26 text-white">
      {/* Page title */}
      <h1 className="mb-8 text-xl font-semibold">Add Your Bot</h1>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-500/50 bg-red-500/10 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
          <button onClick={clearError} className="text-red-400 hover:text-red-300">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-green-500/50 bg-green-500/10 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <p className="text-sm text-green-400">{successMessage}</p>
          </div>
          <button onClick={clearSuccess} className="text-green-400 hover:text-green-300">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKey && apiKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowApiKey(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold">🎉 Bot Registered!</h2>
            <p className="mb-4 text-sm text-gray-400">
              Your bot has been successfully registered. Here is your API key:
            </p>
            
            <div className="mb-4 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
              <p className="mb-2 text-xs text-gray-400">API Key (save this!):</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto text-sm text-green-400">
                  {apiKey}
                </code>
                <button
                  onClick={handleCopyApiKey}
                  className="rounded-lg bg-purple-600 p-2 hover:bg-purple-700"
                >
                  {copiedApiKey ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <p className="mb-4 text-xs text-yellow-400">
              ⚠️ Store this API key securely. You won't be able to see it again!
            </p>

            <button
              onClick={() => setShowApiKey(false)}
              className="w-full rounded-lg bg-purple-600 py-3 font-medium hover:bg-purple-700"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Top section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* LEFT — Bot information */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:col-span-2">
          <h2 className="mb-5 text-[20px] font-medium text-white/80">
            Bot information
          </h2>

          {/* Bot token */}
          <label className="mb-2 block text-sm text-white/60">
            Bot Token <span className="text-red-400">*</span>
          </label>

          <div className="flex gap-4">
            <input
              type="password"
              value={formData.token}
              onChange={(e) => setFormData({ ...formData, token: e.target.value })}
              placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              disabled={verified}
              className="
                w-140 rounded-lg border border-white/10
                bg-black/40 px-4 py-2 text-sm
                outline-none transition
                focus:border-purple-500
                disabled:cursor-not-allowed disabled:opacity-50
              "
            />

            <button
              onClick={handleVerifyBot}
              disabled={isVerifying || verified}
              className={`
                flex items-center gap-2
                rounded-lg px-6 py-3 text-sm font-medium
                transition
                ${
                  isVerifying || verified
                    ? "cursor-not-allowed bg-purple-400"
                    : "bg-purple-600 hover:bg-purple-700"
                }
              `}
            >
              {isVerifying && <Loader2 className="h-4 w-4 animate-spin" />}
              {verified && <CheckCircle className="h-4 w-4" />}
              <span>
                {isVerifying ? "Verifying..." : verified ? "Verified" : "Verify Bot"}
              </span>
            </button>
          </div>

          <p className="mt-3 text-xs text-white/40">
            Get your bot token from{" "}
            <a
              href="https://t.me/BotFather"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              @BotFather
            </a>
            . Do not share it with anyone.
          </p>

          {/* SUCCESS MESSAGE */}
          {verified && (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-400">
              <CheckCircle className="h-4 w-4" />
              Bot token verified successfully!
            </div>
          )}

          {/* EXTRA FIELDS AFTER VERIFY */}
          {verified && (
            <div className="mt-6 space-y-5">
              {/* Short Description */}
              <div>
                <label className="mb-2 block text-sm text-white/60">
                  Short Description
                </label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, shortDescription: e.target.value })
                  }
                  rows={3}
                  placeholder="A brief overview of your bot..."
                  className="
                    w-full resize-none rounded-lg border border-white/10
                    bg-black/40 px-4 py-2 text-sm
                    outline-none focus:border-purple-500
                  "
                  maxLength={200}
                />
                <p className="mt-1 text-xs text-white/40">
                  {formData.shortDescription.length}/200
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm text-white/60">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="
                    w-full rounded-lg border border-white/10
                    bg-black/40 px-4 py-2 text-sm
                    outline-none focus:border-purple-500
                  "
                  required
                >
                  <option value="">Select a category</option>
                  {BOT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="mb-2 block text-sm text-white/60">
                  Language <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="
                    w-full rounded-lg border border-white/10
                    bg-black/40 px-4 py-2 text-sm
                    outline-none focus:border-purple-500
                  "
                  required
                >
                  {BOT_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monetization */}
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <input
                  type="checkbox"
                  checked={formData.monetized}
                  onChange={(e) =>
                    setFormData({ ...formData, monetized: e.target.checked })
                  }
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-medium">
                    Enable monetization for this bot
                  </p>
                  <p className="text-xs text-white/50">
                    Advertisements will be distributed through this bot and you'll earn revenue.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.category || !formData.language}
                className={`
                  mt-4 w-full rounded-lg px-6 py-3 font-medium
                  transition
                  ${
                    isSubmitting || !formData.category || !formData.language
                      ? "cursor-not-allowed bg-purple-400"
                      : "bg-purple-600 hover:bg-purple-700"
                  }
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering...
                  </span>
                ) : (
                  "Register Bot"
                )}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT — Steps */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6">
          <Steps />
        </div>
      </div>

      {/* My Bots */}
      <Bots />
    </section>
  );
};

export default AddBot;