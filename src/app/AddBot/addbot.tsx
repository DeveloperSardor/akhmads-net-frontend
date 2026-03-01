import { useState, useEffect } from "react";
import { Loader2, CheckCircle, Copy, AlertCircle, X, ShieldCheck } from "lucide-react";
import { useBotStore } from "../../store/botStore";
import botService from "../../services/bot.service";
import { BOT_LANGUAGES } from "../../types/bot.types";
import axios from "axios";
import Steps from "./steps";
import Bots from "./bots";
import { useTranslations } from "../../hooks/useTranslations";
import { API_BASE_URL } from "../../api/api";

const AddBot = () => {
  const t = useTranslations();
  const ab = t.addBot;

  const [formData, setFormData] = useState({
    token: "",
    shortDescription: "",
    category: "",
    language: "uz",
    monetized: true,
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedBot, setVerifiedBot] = useState<any>(null);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [apiCategories, setApiCategories] = useState<any[]>([]);

  const getCatName = (cat: any) => {
    if (t.locale === "uz") return cat.nameUz;
    if (t.locale === "eng") return cat.nameEn;
    return cat.nameRu;
  };

  useEffect(() => {
    axios.get("https://api.akhmads.net/api/categories")
      .then((res: any) => setApiCategories(res.data.data || []))
      .catch(() => {});
  }, []);

  const { registerBot, isSubmitting, error, successMessage, clearError, clearSuccess } = useBotStore();

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

  const handleVerifyBot = async () => {
    if (!formData.token.trim()) {
      alert(ab?.tokenEmptyAlert ?? "Please enter bot token");
      return;
    }

    setIsVerifying(true);

    try {
      const tokenRegex = /^\d+:[A-Za-z0-9_-]{35}$/;

      if (!tokenRegex.test(formData.token)) {
        alert(ab?.tokenInvalidAlert ?? "Invalid bot token format");
        setIsVerifying(false);
        return;
      }

      const res = await botService.verifyBotToken(formData.token);
      if (res.success && res.data) {
        setVerifiedBot(res.data);
      } else {
        alert(ab?.tokenInvalidAlert ?? "Token verification failed");
      }
      setIsVerifying(false);
    } catch (error: any) {
      console.error("Verification failed:", error);
      alert(error.response?.data?.message || "Token verification failed");
      setIsVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.token || !formData.category || !formData.language || !verifiedBot) {
      alert(ab?.fillFieldsAlert ?? "Please fill all required fields");
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
      setApiKey(result.apiKey);
      setShowApiKey(true);
      setFormData({ token: "", shortDescription: "", category: "", language: "uz", monetized: true });
      setVerifiedBot(null);
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedApiKey(true);
    setTimeout(() => setCopiedApiKey(false), 2000);
  };

  return (
    <section className="main-container mt-32 mb-20 text-white">
      <h1 className="mb-8 text-xl font-semibold">{ab?.pageTitle}</h1>

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
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowApiKey(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold">{ab?.apiKeyModal.title}</h2>
            <p className="mb-4 text-sm text-gray-400">{ab?.apiKeyModal.subtitle}</p>

            <div className="mb-4 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
              <p className="mb-2 text-xs text-gray-400">{ab?.apiKeyModal.apiKeyLabel}</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 overflow-x-auto text-sm text-green-400">{apiKey}</code>
                <button onClick={handleCopyApiKey} className="rounded-lg bg-purple-600 p-2 hover:bg-purple-700">
                  {copiedApiKey ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <p className="mb-4 text-xs text-yellow-400">{ab?.apiKeyModal.warning}</p>

            <button
              onClick={() => setShowApiKey(false)}
              className="w-full rounded-lg bg-purple-600 py-3 font-medium hover:bg-purple-700"
            >
              {ab?.apiKeyModal.gotIt}
            </button>
          </div>
        </div>
      )}

      {/* Top section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* LEFT — Bot information */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:col-span-2">
          <h2 className="mb-5 text-[20px] font-medium text-white/80">{ab?.botInfo}</h2>

          {/* Bot token */}
          <label className="mb-2 block text-sm text-white/60">
            {ab?.botToken} <span className="text-red-400">*</span>
          </label>

          <div className="flex gap-4">
            <input
              type="password"
              value={formData.token}
              onChange={(e) => {
                setFormData({ ...formData, token: e.target.value });
                setVerifiedBot(null); // reset on change
              }}
              placeholder={ab?.tokenPlaceholder}
              disabled={!!verifiedBot}
              className="w-140 rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm outline-none transition focus:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <button
              onClick={handleVerifyBot}
              disabled={isVerifying || !!verifiedBot}
              className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition ${isVerifying || !!verifiedBot ? "cursor-not-allowed bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
                }`}
            >
              {isVerifying && <Loader2 className="h-4 w-4 animate-spin" />}
              {!!verifiedBot && <CheckCircle className="h-4 w-4" />}
              <span>
                {isVerifying ? ab?.verifying : !!verifiedBot ? ab?.verified : ab?.verifyBtn}
              </span>
            </button>
          </div>

          <p className="mt-3 text-xs text-white/40">
            {ab?.tokenHint}{" "}
            <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
              @BotFather
            </a>
            {ab?.tokenHintFrom}
          </p>

          {verifiedBot && (
            <div className="mt-6">
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 relative overflow-hidden">
                <img 
                  src={`${API_BASE_URL}/bots/avatar/${verifiedBot.username}`} 
                  alt={verifiedBot.username} 
                  className="w-16 h-16 rounded-full object-cover border border-white/10 z-10" 
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(verifiedBot.username || "B")}&background=random&color=fff&size=128`;
                  }}
                />
                <div className="z-10 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{verifiedBot.firstName}</h3>
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-sm text-white/60">@{verifiedBot.username}</p>
                </div>
                
                {/* Decorative glows */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mt-10 -mr-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl -mb-10 -ml-10"></div>
              </div>
            </div>
          )}

          {!!verifiedBot && (
            <div className="mt-6 space-y-5">
              {/* Short Description */}
              <div>
                <label className="mb-2 block text-sm text-white/60">{ab?.shortDesc}</label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  rows={3}
                  placeholder={ab?.shortDescPlaceholder}
                  className="w-full resize-none rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm outline-none focus:border-purple-500"
                  maxLength={200}
                />
                <p className="mt-1 text-xs text-white/40">{formData.shortDescription.length}/200</p>
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm text-white/60">
                  {ab?.category} <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm outline-none focus:border-purple-500"
                  required
                >
                  <option value="">{ab?.categoryPlaceholder}</option>
                  {apiCategories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.icon} {getCatName(cat)}</option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="mb-2 block text-sm text-white/60">
                  {ab?.language} <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm outline-none focus:border-purple-500"
                  required
                >
                  {BOT_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>

              {/* Monetization */}
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <input
                  type="checkbox"
                  checked={formData.monetized}
                  onChange={(e) => setFormData({ ...formData, monetized: e.target.checked })}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-medium">{ab?.monetization}</p>
                  <p className="text-xs text-white/50">{ab?.monetizationDesc}</p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.category || !formData.language}
                className={`mt-4 w-full rounded-lg px-6 py-3 font-medium transition ${isSubmitting || !formData.category || !formData.language
                    ? "cursor-not-allowed bg-purple-400"
                    : "bg-purple-600 hover:bg-purple-700"
                  }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {ab?.registering}
                  </span>
                ) : (
                  ab?.registerBtn
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