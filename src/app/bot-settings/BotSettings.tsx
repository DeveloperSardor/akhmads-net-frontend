import { useState, useEffect } from "react";
import { getBotAvatarUrl } from "../../api/api";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Copy,
  CheckCircle,
  Loader2,
  ChevronDown,
  X,
  Info,
  Radio,
  Users as UsersIcon,
} from "lucide-react";
import { useBotStore } from "../../store/botStore";
import { useTranslations } from "../../hooks/useTranslations";
import axios from "axios";
import AdSelector from "./components/AdSelector";
import adService from "../../services/ad.service";
import type { Ad } from "../../types/ad.types";

const BotSettings = () => {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const t = useTranslations();
  const bs = t.botSettings;

  const {
    currentBot,
    isLoading,
    isSubmitting,
    error,
    successMessage,
    fetchBotById,
    fetchBotHistory,
    updateBot,
    history,
    clearError,
    clearSuccess,
  } = useBotStore();

  const [settings, setSettings] = useState({
    frequencyMinutes: 5,
    postFilter: "all" as "all" | "not_mine" | "only_mine",
    allowedCategories: [] as string[],
    blockedAdIds: [] as string[],
    newToken: "",
    integrationMode: "MANUAL" as "MANUAL" | "AUTO",
    pdpEnabled: true,
    pokazEnabled: true,
    autoAcceptAds: false,
    pricePerClick: 0.01,
    pricePerPokaz: 0.001,
    category: "",
  });

  const [activeCodeTab, setActiveCodeTab] = useState("python");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "released" | "exceptions" | "audience"
  >("released");
  const { audience, audienceStats, fetchBotUsers } = useBotStore();
  const [apiCategories, setApiCategories] = useState<any[]>([]);
  const [blockedAdsDetails, setBlockedAdsDetails] = useState<Partial<Ad>[]>([]);
  const [isLoadingExceptions, setIsLoadingExceptions] = useState(false);
  const [freqBounds, setFreqBounds] = useState({ min: 0, max: 10080 });

  const getCatName = (cat: any) => {
    if (t.locale === "uz") return cat.nameUz;
    if (t.locale === "eng") return cat.nameEn;
    return cat.nameRu;
  };

  useEffect(() => {
    axios
      .get("https://api.akhmads.net/api/categories")
      .then((res: any) => setApiCategories(res.data.data || []))
      .catch(() => {});
    // ✅ Admin frequency limitlarini yuklash
    axios
      .get("https://api.akhmads.net/api/v1/bots/frequency-limits")
      .then((res: any) => {
        const { min, max } = res.data?.data || {};
        setFreqBounds({ min: min ?? 0, max: max ?? 10080 });
      })
      .catch(() => {});
  }, []);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    if (botId) {
      fetchBotById(botId);
      fetchBotHistory(botId);
    }
  }, [botId, fetchBotById, fetchBotHistory]);

  useEffect(() => {
    if (botId && activeTab === "audience") {
      fetchBotUsers(botId);
    }
  }, [botId, activeTab, fetchBotUsers]);

  useEffect(() => {
    if (currentBot) {
      setSettings({
        frequencyMinutes: currentBot.frequencyMinutes || 5,
        postFilter: (currentBot.postFilter as any) || "all",
        allowedCategories: currentBot.allowedCategories || [],
        blockedAdIds: currentBot.blockedAdIds || [],
        newToken: "",
        integrationMode: currentBot.integrationMode || "MANUAL",
        pdpEnabled: currentBot.pdpEnabled ?? true,
        pokazEnabled: currentBot.pokazEnabled ?? true,
        autoAcceptAds: currentBot.autoAcceptAds ?? false,
        pricePerClick: currentBot.pricePerClick || 0.01,
        pricePerPokaz: currentBot.pricePerPokaz || 0.001,
        category: currentBot.category || "",
      });
    }
  }, [currentBot]);

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

  useEffect(() => {
    if (settings.blockedAdIds.length > 0) {
      const fetchDetails = async () => {
        setIsLoadingExceptions(true);
        try {
          const details = await Promise.all(
            settings.blockedAdIds.map(async (id) => {
              try {
                const res = await adService.getAdById(id);
                return res.data.ad;
              } catch (err) {
                console.error(`Failed to fetch ad ${id}`, err);
                return null;
              }
            }),
          );
          setBlockedAdsDetails(details.filter((d): d is Ad => d !== null));
        } catch (err) {
          console.error("Failed to fetch blocked ads details", err);
        } finally {
          setIsLoadingExceptions(false);
        }
      };
      fetchDetails();
    } else {
      setBlockedAdsDetails([]);
    }
  }, [settings.blockedAdIds]);

  const handleCategoryToggle = (categoryId: string) => {
    setSettings((prev) => ({
      ...prev,
      allowedCategories: prev.allowedCategories.includes(categoryId)
        ? prev.allowedCategories.filter((c) => c !== categoryId)
        : [...prev.allowedCategories, categoryId],
    }));
  };

  const handleSaveSettings = async () => {
    if (!botId) return;
    await updateBot(botId, {
      frequencyMinutes: settings.frequencyMinutes,
      postFilter: settings.postFilter,
      allowedCategories: settings.allowedCategories,
      blockedAdIds: settings.blockedAdIds,
      integrationMode: settings.integrationMode,
      pdpEnabled: settings.pdpEnabled,
      pokazEnabled: settings.pokazEnabled,
      autoAcceptAds: settings.autoAcceptAds,
      pricePerClick: settings.pricePerClick,
      pricePerPokaz: settings.pricePerPokaz,
      category: settings.category,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !botId) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://api.akhmads.net/api/v1/bots/${botId}/upload-users`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      alert(bs?.uploadSuccess ?? "Foydalanuvchilar muvaffaqiyatli yuklandi!");
    } catch (err) {
      console.error("Upload failed", err);
      alert(bs?.uploadError ?? "Yuklashda xatolik yuz berdi.");
    }
  };

  const handleUpdateToken = async () => {
    if (!botId || !settings.newToken.trim()) {
      alert(bs?.invalidTokenAlert ?? "Please enter a valid token");
      return;
    }
    alert(bs?.tokenUpdateSoon ?? "Token update coming soon!");
  };

  const getIntegrationCode = (language: string) => {
    const apiKey = currentBot?.apiKey || "YOUR_API_KEY";

    const codes: Record<string, string> = {
      python: `import aiohttp

async def show_ad(chat_id: int):
    async with aiohttp.ClientSession() as session:
        async with session.post(
            'https://akhmads.net/api/v1/ad/SendPost',
            headers={'Authorization': 'Bearer ${apiKey}'},
            json={'SendToChatId': chat_id}
        ) as response:
            result = await response.json()
            return result.get('SendPostResult') == 1`,

      javascript: `const axios = require('axios');

async function showAd(chatId) {
  const response = await axios.post(
    'https://akhmads.net/api/v1/ad/SendPost',
    { SendToChatId: chatId },
    { headers: { 'Authorization': 'Bearer ${apiKey}' } }
  );
  return response.data.SendPostResult === 1;
}`,

      php: `<?php
function showAd($chatId) {
  $ch = curl_init('https://akhmads.net/api/v1/ad/SendPost');
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['SendToChatId' => $chatId]));
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ${apiKey}'
  ]);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $result = curl_exec($ch);
  return json_decode($result)->SendPostResult === 1;
}`,

      csharp: `using System.Net.Http;

async Task<bool> ShowAd(long chatId) {
  var client = new HttpClient();
  client.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", "${apiKey}");
  var content = new StringContent(
    JsonSerializer.Serialize(new { SendToChatId = chatId }),
    Encoding.UTF8, "application/json");
  var response = await client.PostAsync(
    "https://akhmads.net/api/v1/ad/SendPost", content);
  var result = await response.Content.ReadAsStringAsync();
  return JsonDocument.Parse(result).RootElement
    .GetProperty("SendPostResult").GetInt32() == 1;
}`,
    };

    return codes[language] || codes.python;
  };

  const handleCopyCode = () => {
    const code = getIntegrationCode(activeCodeTab);
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyToken = () => {
    if (currentBot?.apiKey) {
      navigator.clipboard.writeText(currentBot.apiKey);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const formatNumber = (num: number | undefined | null = 0) => {
    return Number(num || 0).toLocaleString();
  };

  const formatCurrency = (amount: number | undefined | null = 0) => {
    return `$${Number(amount || 0).toFixed(2)}`;
  };

  if (isLoading && !currentBot) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentBot) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <p>{bs?.botNotFound ?? "Bot not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-[160px] sm:pt-[168px] pb-20 font-sans">
      {/* Top Navigation Bar — fixed below main Navbar */}
      <div className="fixed top-[96px] sm:top-[104px] left-0 right-0 bg-card/80 backdrop-blur-md border-b border-border z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {bs?.backToBots ?? "Back to bots"}
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowRulesModal(true)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {bs?.acceptRules ?? "Rules"}
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={isSubmitting || settings.allowedCategories.length === 0}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSubmitting
                ? (bs?.saving ?? "Saving...")
                : (bs?.save ?? "Save")}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        {/* Header Section */}
        <div className="flex items-center gap-5">
          <img
            src={getBotAvatarUrl(currentBot.username)}
            alt={currentBot.username}
            className="w-16 h-16 rounded-full object-cover border border-border bg-accent shadow-sm"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentBot.username || "B")}&background=random&color=fff&size=128`;
            }}
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
              {currentBot.firstName}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              @{currentBot.username}
            </p>
          </div>
        </div>

        {/* Error/Success Alerts */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4 text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl p-4 text-sm flex justify-between items-center">
            <span>{successMessage}</span>
            <button onClick={clearSuccess} className="hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              {bs?.impressions ?? "Impressions"}
            </div>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {formatNumber(currentBot.impressionsServed || 0)}
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              {bs?.clicks ?? "Clicks"}
            </div>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {formatNumber(currentBot.clicks || 0)}
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              CTR
            </div>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {currentBot.ctr || 0}%
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="text-sm font-medium text-muted-foreground mb-2">
              {bs?.earnings ?? "Earnings"}
            </div>
            <div className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">
              {formatCurrency(currentBot.totalEarnings)}
            </div>
          </div>
        </div>

        {/* Integration Mode Selection */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-6 text-foreground">
            {bs?.integrationType ?? "Integration Mode"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() =>
                setSettings({ ...settings, integrationMode: "MANUAL" })
              }
              className={`relative cursor-pointer rounded-2xl border p-5 transition-all ${
                settings.integrationMode === "MANUAL"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground">
                  {t.addBot?.integrationTypeManual}
                </h4>
                {settings.integrationMode === "MANUAL" && (
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                )}
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {t.addBot?.integrationTypeManualDesc}
              </p>
            </div>

            <div
              onClick={() =>
                setSettings({ ...settings, integrationMode: "AUTO" })
              }
              className={`relative cursor-pointer rounded-2xl border p-5 transition-all ${
                settings.integrationMode === "AUTO"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-foreground">
                  {t.addBot?.integrationTypeAuto}
                </h4>
                {settings.integrationMode === "AUTO" && (
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                )}
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {t.addBot?.integrationTypeAutoDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Bot Category Selection */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              {bs?.botCategory ?? "Bot Category"}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {bs?.botCategoryDesc ??
                "Select the primary category of your bot. This helps in selecting the most relevant ads."}
            </p>
          </div>
          <div className="p-6 bg-card">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {apiCategories.map((c: any) => {
                const isSelected = settings.category === c.slug;
                return (
                  <button
                    key={c.id}
                    onClick={() =>
                      setSettings({ ...settings, category: c.slug })
                    }
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left group ${
                      isSelected
                        ? "bg-primary/10 border-primary text-foreground"
                        : "bg-transparent border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <div
                      className={`text-xl transition-transform ${isSelected ? "scale-110" : "group-hover:scale-110"}`}
                    >
                      {c.icon}
                    </div>
                    <span className="text-sm font-medium">{getCatName(c)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Main Configuration - 2 Columns wide */}
          <div className="lg:col-span-2 space-y-6">
            {/* Allowed Categories */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  {bs?.allowedCategories ?? "Allowed Categories"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {bs?.allowedCategoriesDesc ??
                    "Select the types of ads permitted to be shown in your bot. At least one must be selected."}
                </p>
              </div>
              <div className="p-6 bg-card">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {apiCategories.map((c: any) => {
                    const isSelected = settings.allowedCategories.includes(
                      c.id,
                    );
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleCategoryToggle(c.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left group ${
                          isSelected
                            ? "bg-primary/10 border-primary text-foreground"
                            : "bg-transparent border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`text-xl transition-transform ${isSelected ? "scale-110" : "group-hover:scale-110"}`}
                        >
                          {c.icon}
                        </div>
                        <span className="text-sm font-medium">
                          {getCatName(c)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-6 text-foreground">
                {bs?.postingRules ?? "Posting Rules & Limits"}
              </h2>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {bs?.frequencyTitle ?? "Post Frequency"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={freqBounds.min}
                      max={freqBounds.max}
                      value={settings.frequencyMinutes}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const clamped = Math.min(
                          Math.max(val, freqBounds.min),
                          freqBounds.max,
                        );
                        setSettings({ ...settings, frequencyMinutes: clamped });
                      }}
                      className="w-full pl-4 pr-12 py-3 bg-background border border-border rounded-xl text-foreground font-medium focus:outline-none focus:border-primary transition-colors"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
                      MIN
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {bs?.adminFrequencyPrefix ?? "Admin defined range:"}{" "}
                    <span className="text-foreground font-medium">
                      {freqBounds.min} — {freqBounds.max}{" "}
                      {bs?.minutes ?? "minutes"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    {bs?.postFilterTitle ?? "Which posts can this bot publish?"}
                  </label>
                  <div className="relative">
                    <select
                      value={settings.postFilter}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          postFilter: e.target.value as any,
                        })
                      }
                      className="w-full pl-4 pr-10 py-3 bg-background border border-border rounded-xl text-foreground font-medium appearance-none focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="all">
                        {bs?.postFilterAll ?? "All posts"}
                      </option>
                      <option value="not_mine">
                        {bs?.postFilterNotMine ?? "All posts but mine"}
                      </option>
                      <option value="only_mine">
                        {bs?.postFilterOnlyMine ?? "My posts only"}
                      </option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Blocked Ads */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <AdSelector
                onSelect={(ids) =>
                  setSettings({ ...settings, blockedAdIds: ids })
                }
                initialSelectedIds={settings.blockedAdIds}
              />
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSubmitting ? bs?.saving : bs?.save}
                </button>
              </div>
            </div>

            {/* Broadcast Settings */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-500" />
                {bs?.broadcastSettings ?? "Broadcast Settings"}
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* PDP Settings */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${settings.pdpEnabled ? "bg-green-500/5 border-green-500/20" : "bg-transparent border-border opacity-50"}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-foreground">
                        {bs?.pdpTitle ?? "Pay per click"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {bs?.pdpDesc ?? "Charge when user clicks a button"}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.pdpEnabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            pdpEnabled: e.target.checked,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                      {bs?.pdpPriceLabel ?? "Price per click ($)"}
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      className="w-full bg-background border border-border p-2.5 rounded-xl text-sm font-mono focus:border-primary focus:outline-none transition-colors"
                      value={settings.pricePerClick}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          pricePerClick: parseFloat(e.target.value) || 0,
                        })
                      }
                      disabled={!settings.pdpEnabled}
                    />
                  </div>
                </div>

                {/* POKAZ Settings */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${settings.pokazEnabled ? "bg-blue-500/5 border-blue-500/20" : "bg-transparent border-border opacity-50"}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-foreground">
                        {bs?.pokazTitle ?? "Pay per message"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {bs?.pokazDesc ??
                          "Charge for each message sent to a user"}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.pokazEnabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            pokazEnabled: e.target.checked,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                      {bs?.pokazPriceLabel ?? "Price per message ($)"}
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      className="w-full bg-background border border-border p-2.5 rounded-xl text-sm font-mono focus:border-primary focus:outline-none transition-colors"
                      value={settings.pricePerPokaz}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          pricePerPokaz: parseFloat(e.target.value) || 0,
                        })
                      }
                      disabled={!settings.pokazEnabled}
                    />
                  </div>
                </div>
              </div>

              {/* Auto Accept Toggle */}
              <div className="mt-8 p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <h3 className="font-bold text-foreground mb-1">
                    {bs?.autoAcceptAdsLabel}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {bs?.autoAcceptAdsDesc}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.autoAcceptAds}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        autoAcceptAds: e.target.checked,
                      })
                    }
                  />
                  <div className="w-11 h-6 bg-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* User Upload Tool */}
              <div className="bg-card border-2 border-primary/30 border-dashed rounded-2xl p-8 text-center mt-6 shadow-lg shadow-primary/5">
                <div className="mx-auto w-16 h-16 bg-primary/20 text-primary flex items-center justify-center rounded-full mb-4 shadow-inner border border-primary/30">
                  <UsersIcon className="w-8 h-8" />
                </div>
                <h3 className="text-foreground font-bold text-xl mb-2">
                  {bs?.uploadUsersTitle}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                  {bs?.uploadUsersDesc}
                </p>
                <div className="relative inline-block">
                  <input
                    type="file"
                    id="user-upload"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".txt,.csv"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="user-upload"
                    className="cursor-pointer bg-primary text-foreground px-8 py-3 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all inline-flex items-center gap-2 shadow-lg shadow-primary/30"
                  >
                    {bs?.uploadButton}
                  </label>
                </div>

                <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/20 text-left">
                  <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2 uppercase tracking-widest">
                    <Info className="w-4 h-4" />
                    {bs?.instructions ?? "Instructions"}
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-3 list-disc pl-5 leading-relaxed">
                    <li>
                      {bs?.instructionFileTypes ?? "Only .txt or .csv files"}:{" "}
                      <span className="text-foreground font-mono bg-foreground/10 px-1 rounded">
                        .txt
                      </span>{" "}
                      {t.locale === "uz"
                        ? "yoki"
                        : t.locale === "ru"
                          ? "или"
                          : "or"}{" "}
                      <span className="text-foreground font-mono bg-foreground/10 px-1 rounded">
                        .csv
                      </span>{" "}
                      {bs?.instructionAcceptance ?? "files are accepted"}.
                    </li>
                    <li>
                      {bs?.instructionFormat ??
                        "Each line must contain exactly one"}{" "}
                      <span className="text-primary font-bold">
                        Telegram User ID
                      </span>{" "}
                      {bs?.instructionFormatDesc ?? "(e.g. 12345678)"}.
                    </li>
                    <li>
                      {bs?.instructionNoNames ??
                        "Names or @usernames are not accepted, only numeric IDs."}
                    </li>
                    <li>
                      {bs?.instructionCleaning ??
                        "The system automatically filters out duplicates and invalid rows."}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Integration & History */}
          <div className="space-y-6">
            {/* Integration Card - Always show to allow hybrid use */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-5 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  {settings.integrationMode === "AUTO"
                    ? (bs?.hybridIntegration ?? "Hybrid Integration (API)")
                    : (bs?.integrationCode ?? "Integration Code")}
                </h2>
                <button
                  onClick={handleCopyCode}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy code"
                >
                  {copiedCode ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="p-5">
                <div className="flex gap-2 mb-4">
                  {[
                    { id: "python", label: "Python" },
                    { id: "javascript", label: "Node.js" },
                    { id: "php", label: "PHP" },
                    { id: "csharp", label: "C#" },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setActiveCodeTab(lang.id)}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                        activeCodeTab === lang.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
                <div className="bg-background border border-border rounded-xl relative">
                  <pre className="p-4 overflow-x-auto text-[11px] font-mono text-muted-foreground leading-relaxed scrollbar-none">
                    <code>{getIntegrationCode(activeCodeTab)}</code>
                  </pre>
                </div>
                <button
                  onClick={() => setShowResultModal(true)}
                  className="mt-4 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5" />
                  {bs?.viewResultCodes ?? "View API Result Codes"}
                </button>
              </div>
            </div>

            {/* Token Update */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-sm font-semibold mb-4 text-foreground">
                {bs?.updateToken ?? "Update Access Token"}
              </h2>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={settings.newToken}
                  onChange={(e) =>
                    setSettings({ ...settings, newToken: e.target.value })
                  }
                  placeholder={
                    bs?.newTokenPlaceholder ?? "New token from BotFather..."
                  }
                  className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                />
                <button
                  onClick={handleUpdateToken}
                  disabled={isSubmitting || !settings.newToken.trim()}
                  className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {bs?.update ?? "Update"}
                </button>
              </div>
            </div>

            {/* History / Released */}
            <div className="bg-card border border-border rounded-2xl flex flex-col h-[400px]">
              <div className="flex items-center gap-6 p-5 border-b border-border">
                <button
                  onClick={() => setActiveTab("released")}
                  className={`text-sm font-semibold transition-colors relative ${
                    activeTab === "released"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {bs?.releasedAds ?? "Released ads"}
                  {activeTab === "released" && (
                    <div className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("exceptions")}
                  className={`text-sm font-semibold transition-colors relative ${
                    activeTab === "exceptions"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {bs?.exceptions ?? "Exceptions"}
                  {activeTab === "exceptions" && (
                    <div className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("audience")}
                  className={`text-sm font-semibold transition-colors relative ${
                    activeTab === "audience"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {bs?.audienceTab}
                  {activeTab === "audience" && (
                    <div className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 scrollbar-none">
                {activeTab === "released" ? (
                  history && history.length > 0 ? (
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="bg-card border border-border rounded-xl p-4 transition-colors hover:border-primary/30"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-semibold text-foreground truncate pr-3">
                              {item.ad?.title || "Ad"}
                            </h4>
                            <span className="text-sm font-mono text-green-400 font-medium shrink-0">
                              +${parseFloat(item.botOwnerEarns).toFixed(4)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.ad?.text}
                          </p>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] font-mono bg-accent border border-border px-2 py-0.5 rounded-md text-muted-foreground">
                              @{item.username}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                      <p className="text-sm font-medium">
                        {bs?.noReleasedAds ?? "No released ads yet"}
                      </p>
                    </div>
                  )
                ) : activeTab === "audience" ? (
                  <div className="space-y-3">
                    {audienceStats && (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-background border border-border p-3 rounded-xl">
                          <div className="text-[10px] text-muted-foreground uppercase font-black">
                            {bs?.active3Days}
                          </div>
                          <div className="text-lg font-bold">
                            {audienceStats.active3Days || 0}
                          </div>
                        </div>
                        <div className="bg-background border border-border p-3 rounded-xl">
                          <div className="text-[10px] text-muted-foreground uppercase font-black">
                            {bs?.active7Days}
                          </div>
                          <div className="text-lg font-bold">
                            {audienceStats.active7Days || 0}
                          </div>
                        </div>
                      </div>
                    )}

                    {audience && audience.length > 0 ? (
                      audience.map((u: any) => (
                        <div
                          key={u.id}
                          className="bg-card border border-border rounded-xl p-3 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent text-foreground flex items-center justify-center text-xs font-bold border border-border">
                              {u.username
                                ? u.username[0].toUpperCase()
                                : u.firstName?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-foreground flex items-center gap-2">
                                {u.firstName} {u.lastName}
                                {u.source === "UPLOADED" && (
                                  <span className="text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20 font-black tracking-tighter uppercase">
                                    Uploaded
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-500 flex items-center gap-2">
                                {u.username
                                  ? `@${u.username}`
                                  : u.telegramUserId}
                                <span>•</span>
                                <span>{u.country || "—"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {bs?.lastActivity}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {new Date(u.lastSeenAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 py-10">
                        <UsersIcon className="w-10 h-10 opacity-10 mb-2" />
                        <p className="text-sm font-medium">
                          {bs?.noAudienceYet}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {isLoadingExceptions ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                      </div>
                    ) : blockedAdsDetails.length > 0 ? (
                      blockedAdsDetails.map((ad) => (
                        <div
                          key={ad.id}
                          className="bg-card border border-border rounded-xl p-4 flex gap-3 hover:border-primary/30 transition-colors"
                        >
                          {ad.mediaUrl ? (
                            <img
                              src={ad.mediaUrl}
                              alt=""
                              className="w-12 h-12 object-cover rounded-lg shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-accent border border-border rounded-xl flex items-center justify-center text-muted-foreground shrink-0 font-bold">
                              {ad.title?.[0]?.toUpperCase() || "A"}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-foreground truncate mb-1">
                              {ad.title || "Ad Without Title"}
                            </h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                              {ad.text || "No description provided"}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 py-10">
                        <p className="text-sm font-medium">
                          {bs?.noExceptions ?? "No exceptions configured"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RULES MODAL */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                {bs?.rulesModal?.title ?? "API Integration Instructions"}
              </h2>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  {bs?.rulesModal?.apiTokenLabel ?? "Your API Token"}
                </h3>
                <div className="flex items-center gap-3 bg-background border border-border rounded-xl p-3">
                  <code className="flex-1 text-sm text-green-400 break-all font-mono">
                    {currentBot?.apiKey || "Loading..."}
                  </code>
                  <button
                    onClick={handleCopyToken}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent transition-colors"
                  >
                    {copiedToken ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-yellow-500/80 mt-2">
                  {bs?.rulesModal?.tokenWarning}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  {bs?.rulesModal?.quickStart ?? "Quick Start"}
                </h3>
                <div className="space-y-2.5 text-sm text-muted-foreground">
                  {(
                    bs?.rulesModal?.quickStartSteps ?? [
                      "1. Copy your API token above",
                      "2. Choose your programming language from the Integration Code section",
                      "3. Use the provided code to integrate ad requests into your bot",
                      "4. Call the ad function after completing useful tasks for users",
                    ]
                  ).map((s: string, i: number) => (
                    <p key={i}>{s}</p>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  {bs?.rulesModal?.importantRules ?? "Important Rules"}
                </h3>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {(
                    bs?.rulesModal?.rules ?? [
                      "Only show ads after completing useful tasks",
                      'Follow the "completed task → display ad" principle',
                      "Mass mailings are strictly prohibited",
                      "Violation may result in account ban",
                    ]
                  ).map((rule: string, i: number) => (
                    <li key={i} className="flex gap-2.5">
                      <span
                        className={i === 3 ? "text-red-400" : "text-yellow-500"}
                      >
                        •
                      </span>
                      <span
                        className={i === 3 ? "text-red-400 font-medium" : ""}
                      >
                        {rule}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setShowRulesModal(false)}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors mt-4"
              >
                {bs?.rulesModal?.gotIt ?? "Got it!"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESULT CODES MODAL */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                {bs?.resultCodesModal?.title ?? "Result Codes"}
              </h2>
              <button
                onClick={() => setShowResultModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              {bs?.resultCodesModal?.desc}
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  {bs?.resultCodesModal?.exampleTitle ??
                    "Example Response (200 OK)"}
                </h3>
                <div className="bg-background border border-border rounded-xl p-4">
                  <pre className="text-sm text-green-600 dark:text-green-400 font-mono">
                    {'{\n  "SendPostResult": 1\n}'}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  {bs?.resultCodesModal?.allCodesTitle ?? "All Result Codes"}
                </h3>
                <div className="bg-background border border-border rounded-xl overflow-hidden">
                  {[
                    {
                      code: 0,
                      name: "Undefined",
                      color: "text-muted-foreground",
                    },
                    {
                      code: 1,
                      name: "Success",
                      color: "text-green-600 dark:text-green-500",
                    },
                    {
                      code: 2,
                      name: "RevokedTokenError",
                      color: "text-red-600 dark:text-red-500",
                    },
                    {
                      code: 3,
                      name: "UserForbiddenError",
                      color: "text-red-600 dark:text-red-500",
                    },
                    {
                      code: 4,
                      name: "TooManyRequestsError",
                      color: "text-yellow-600 dark:text-yellow-500",
                    },
                    {
                      code: 5,
                      name: "OtherBotApiError",
                      color: "text-red-600 dark:text-red-500",
                    },
                    {
                      code: 6,
                      name: "OtherError",
                      color: "text-red-600 dark:text-red-500",
                    },
                    {
                      code: 7,
                      name: "AdLimited",
                      color: "text-yellow-600 dark:text-yellow-500",
                    },
                    { code: 8, name: "NoAds", color: "text-muted-foreground" },
                    {
                      code: 9,
                      name: "BotIsNotEnabled",
                      color: "text-yellow-600 dark:text-yellow-500",
                    },
                    {
                      code: 10,
                      name: "Banned",
                      color: "text-red-600 dark:text-red-500",
                    },
                    {
                      code: 11,
                      name: "InReview",
                      color: "text-yellow-600 dark:text-yellow-500",
                    },
                  ].map((item, idx, arr) => (
                    <div
                      key={item.code}
                      className={`flex items-center justify-between p-3 text-sm ${idx !== arr.length - 1 ? "border-b border-border" : ""}`}
                    >
                      <span className="font-mono text-muted-foreground">
                        {item.name}
                      </span>
                      <span className={`font-mono font-bold ${item.color}`}>
                        {item.code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowResultModal(false)}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors mt-4"
              >
                {bs?.resultCodesModal?.close ?? "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotSettings;
