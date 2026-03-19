import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Select, Spin, DatePicker, Tooltip } from "antd";
import dayjs from "dayjs";
import {
  ArrowLeft,
  Send,
  Users,
  Zap,
  Clock,
  Plus,
  Trash2,
  ChevronRight,
  Radio,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Download,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../api/api";
import { useTranslations } from "../../hooks/useTranslations";

const { Option } = Select;

const BASE_FEE = 0.5;

const dayKey: Record<number, string> = {
  3: "activeUsers3d",
  7: "activeUsers7d",
  30: "activeUsers30d",
};

const LANGUAGES = [
  { code: "uz", name: "🇺🇿 Uzbek" },
  { code: "ru", name: "🇷🇺 Russian" },
  { code: "en", name: "🇺🇸 English" },
  { code: "tr", name: "🇹🇷 Turkish" },
  { code: "ar", name: "🇸🇦 Arabic" },
  { code: "de", name: "🇩🇪 German" },
  { code: "fr", name: "🇫🇷 French" },
  { code: "es", name: "🇪🇸 Spanish" },
  { code: "it", name: "🇮🇹 Italian" },
  { code: "pt", name: "🇵🇹 Portuguese" },
  { code: "hi", name: "🇮🇳 Hindi" },
  { code: "zh", name: "🇨🇳 Chinese" },
  { code: "ja", name: "🇯🇵 Japanese" },
  { code: "ko", name: "🇰🇷 Korean" },
  { code: "uk", name: "🇺🇦 Ukrainian" },
  { code: "kk", name: "🇰🇿 Kazakh" },
];

type BtnColor = "blue" | "green" | "red" | "default";

interface Button {
  text: string;
  url: string;
  color: BtnColor;
  trackingEnabled?: boolean;
}

const BroadcastAd: React.FC = () => {
  const navigate = useNavigate();
  const { lang } = useParams();
  const t = useTranslations();
  const tb = t.broadcastAd;
  const [searchParams] = useSearchParams();
  const botIdFromUrl = searchParams.get("bot_id");

  // ── Data
  const [publicBots, setPublicBots] = useState<any[]>([]);
  const [botsLoading, setBotsLoading] = useState(false);

  // ── Selection
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [broadcastType, setBroadcastType] = useState<"PDP" | "POKAZ">("POKAZ");
  const [activeDays, setActiveDays] = useState<3 | 7 | 30>(30);
  const [targetCount, setTargetCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("ALL");
  const [scheduledAt, setScheduledAt] = useState<dayjs.Dayjs | null>(null);

  // ── Content
  const [contentType, setContentType] = useState<"TEXT" | "HTML" | "MEDIA">(
    "TEXT",
  );
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [buttons, setButtons] = useState<Button[]>([]);

  // ── Submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchingDraft, setFetchingDraft] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // ── Derived
  const selectedBot = useMemo(
    () => publicBots.find((b) => b.id === selectedBotId) ?? null,
    [publicBots, selectedBotId],
  );

  const activeUsersCount: number = selectedBot
    ? (selectedBot[dayKey[activeDays]] ?? 0)
    : 0;

  // Pricing from bot settings (or legacy defaults)
  const pricePerUnit = useMemo(() => {
    if (!selectedBot) return 0.05;
    return broadcastType === "POKAZ"
      ? selectedBot.pricePerPokaz || 0.005
      : selectedBot.pricePerClick || 0.05;
  }, [selectedBot, broadcastType]);

  const totalCost = useMemo(() => {
    const subTotal = targetCount * pricePerUnit;
    return subTotal > 0 ? subTotal + BASE_FEE : 0;
  }, [targetCount, pricePerUnit]);

  const canLaunch =
    !!selectedBotId && targetCount > 0 && text.trim().length >= 5;

  useEffect(() => {
    setBotsLoading(true);
    apiClient
      .get("/bots/public")
      .then((res) => {
        const bots = res.data?.data?.bots ?? [];
        setPublicBots(bots);

        // Auto-select if bot_id in URL
        if (botIdFromUrl) {
          const exists = bots.some((b: any) => b.id === botIdFromUrl);
          if (exists) {
            setSelectedBotId(botIdFromUrl);
            setStep(2);
          }
        }
      })
      .catch(() => toast.error(tb.errorLoadingBots))
      .finally(() => setBotsLoading(false));

    // Fetch wallet balance
    apiClient
      .get("/wallet")
      .then((res) =>
        setWalletBalance(parseFloat(res.data?.wallet?.available || "0")),
      )
      .catch(() => {});
  }, [botIdFromUrl, tb.errorLoadingBots]);

  // Fetch draft automatically once bot is selected via URL
  useEffect(() => {
    if (
      botIdFromUrl &&
      selectedBotId === botIdFromUrl &&
      publicBots.length > 0
    ) {
      fetchDraft();
    }
  }, [selectedBotId, botIdFromUrl, publicBots.length]);

  // ── Reset targetCount when dependencies change
  useEffect(() => {
    if (broadcastType === "PDP") {
      setTargetCount(100); // Default target clicks
    } else {
      const max = activeUsersCount;
      setTargetCount(max > 0 ? Math.min(targetCount || max, max) : 0);
    }
  }, [selectedBotId, activeDays, broadcastType, activeUsersCount]);

  const fetchDraft = async () => {
    if (!selectedBotId) return;
    setFetchingDraft(true);
    try {
      const res = await apiClient.get(`/bots/${selectedBotId}/broadcast-draft`);
      const draft = res.data?.data;
      if (draft) {
        setText(draft.text || "");
        setContentType(draft.contentType || "TEXT");
        if (draft.mediaUrl) {
          setMediaUrl(draft.mediaUrl);
          setMediaType(draft.mediaType);
        }
        if (draft.buttons) setButtons(draft.buttons);
        toast.success(tb.received || "Draft qabul qilindi!");
      }
    } catch (err) {
      toast.error(tb.draftNotFound || "Botda draft topilmadi");
    } finally {
      setFetchingDraft(false);
    }
  };

  const filteredBots = useMemo(
    () =>
      publicBots.filter((b) => {
        const q = searchTerm.toLowerCase();
        return (
          b.username?.toLowerCase().includes(q) ||
          b.firstName?.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q)
        );
      }),
    [publicBots, searchTerm],
  );

  const handleLaunch = async () => {
    if (!canLaunch) return;

    const validButtons = buttons.filter((b) => b.text.trim() && b.url.trim());

    setIsSubmitting(true);
    try {
      await apiClient.post("/ads/broadcasts", {
        botId: selectedBotId,
        type: broadcastType,
        contentType: mediaUrl ? "MEDIA" : contentType,
        text: text.trim(),
        mediaUrl,
        mediaType,
        targetCount,
        activeDays,
        language: targetLanguage,
        scheduledAt: scheduledAt ? scheduledAt.toISOString() : null,
        buttons: validButtons,
      });
      toast.success(tb.successMessage);
      navigate(`/${lang}/my-ads`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || tb.errorCreating;
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addButton = () => {
    if (buttons.length >= 5) return;
    setButtons((prev) => [
      ...prev,
      { text: "", url: "", color: "default", trackingEnabled: true },
    ]);
  };
  const removeButton = (i: number) =>
    setButtons((prev) => prev.filter((_, idx) => idx !== i));
  const updateButton = (i: number, field: keyof Button, val: any) =>
    setButtons((prev) =>
      prev.map((b, idx) => (idx === i ? { ...b, [field]: val } : b)),
    );

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="group mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="p-2 rounded-xl bg-card border border-border group-hover:bg-accent group-hover:border-primary/30 transition-all shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold">{tb.back}</span>
        </button>

        {/* Header */}
        <div className="grid md:grid-cols-2 gap-12 items-end mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold mb-4 uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Advanced Campaign
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-foreground italic tracking-tight">
              {tb.title}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
              {tb.subtitle}
            </p>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-end gap-2">
            {[1, 2].map((n) => (
              <button
                key={n}
                onClick={() => n === 1 && setStep(1)}
                className={`h-2 rounded-full transition-all duration-500 ${step === n ? "w-16 bg-primary shadow-lg shadow-primary/20" : "w-6 bg-muted hover:bg-muted/80"}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Form */}
          <div className="lg:col-span-8 space-y-8">
            {step === 1 ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* 1. Model Selection */}
                <div className="bg-card border border-border rounded-3xl p-10 relative overflow-hidden group shadow-sm">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[120px] pointer-events-none" />

                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-10 flex items-center gap-2">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                      <Zap className="w-4 h-4" />
                    </div>
                    1. {tb.typeLabel || "Kampaniya Modeli"}
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <button
                      onClick={() => setBroadcastType("POKAZ")}
                      className={`p-8 rounded-2xl border-2 text-left transition-all relative group/btn ${broadcastType === "POKAZ" ? "bg-primary/5 border-primary shadow-xl shadow-primary/5" : "bg-background border-border hover:border-primary/30"}`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all ${broadcastType === "POKAZ" ? "bg-primary text-primary-foreground shadow-xl shadow-primary/40 scale-110" : "bg-muted text-muted-foreground"}`}
                      >
                        <Users className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-xl mb-2 text-foreground">
                        {tb.pokazTitle || "Pay per message"}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed uppercase font-bold tracking-wider opacity-80">
                        {tb.pokazDesc || "Barcha foydalanuvchilar uchun"}
                      </p>
                    </button>

                    <button
                      onClick={() => setBroadcastType("PDP")}
                      className={`p-8 rounded-2xl border-2 text-left transition-all relative group/btn ${broadcastType === "PDP" ? "bg-blue-500/5 border-blue-500 shadow-xl shadow-blue-500/5" : "bg-background border-border hover:border-blue-500/30"}`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all ${broadcastType === "PDP" ? "bg-blue-500 text-foreground shadow-xl shadow-blue-500/40 scale-110" : "bg-muted text-muted-foreground"}`}
                      >
                        <Radio className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-xl mb-2 text-foreground">
                        {tb.pdpTitle || "Pay per click"}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed uppercase font-bold tracking-wider opacity-80">
                        {tb.pdpDesc || "Faqat kliklar uchun"}
                      </p>
                    </button>
                  </div>
                </div>

                {/* 2. Bot & Audience */}
                <div className="bg-card border border-border rounded-3xl p-10 shadow-sm">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-10 flex items-center gap-2">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                      <Users className="w-4 h-4" />
                    </div>
                    2. {tb.step1 || "Auditoriya"}
                  </h2>

                  <div className="space-y-10">
                    {/* Bot Select */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block ml-1">
                        {tb.botSelect || "Botni tanlang"}
                      </label>
                      <Select
                        showSearch
                        value={selectedBotId}
                        loading={botsLoading}
                        placeholder={tb.searchBotPlaceholder}
                        className="w-full custom-select-bc-new h-16"
                        onChange={(v) => setSelectedBotId(v)}
                        onSearch={setSearchTerm}
                        filterOption={false}
                        optionLabelProp="label"
                      >
                        {filteredBots.map((b) => (
                          <Option
                            key={b.id}
                            value={b.id}
                            label={`@${b.username}`}
                          >
                            <div className="flex items-center gap-4 py-2">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-lg">
                                {b.username[0].toUpperCase()}
                              </div>
                              <div className="flex flex-col gap-1">
                                <div className="font-black text-foreground text-sm tracking-tight leading-none">
                                  @{b.username}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mt-1">
                                  {b.category}
                                </div>
                              </div>
                              <div className="ml-auto">
                                <div className="px-4 py-2 rounded-xl bg-accent text-[10px] font-black text-primary uppercase tracking-widest shadow-sm border border-border/50">
                                  {(b.activeUsers30d ?? 0).toLocaleString()}{" "}
                                  {tb.usersLabel?.toLowerCase() || "user"}
                                </div>
                              </div>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </div>

                    {/* Language & Scheduling Group */}
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block ml-1">
                          {tb.languageTitle || "Language Targeting"}
                        </label>
                        <Select
                          value={targetLanguage}
                          onChange={setTargetLanguage}
                          className="w-full custom-select-bc-new h-14"
                        >
                          <Option value="ALL" className="font-bold">
                            🌐 {tb.allLanguages || "Barcha tillar"}
                          </Option>
                          {LANGUAGES.map((l) => (
                            <Option key={l.code} value={l.code}>
                              {l.name}
                            </Option>
                          ))}
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block ml-1">
                          {tb.scheduleTitle || "Schedule (Optional)"}
                        </label>
                        <DatePicker
                          showTime
                          disabledDate={(current) =>
                            current && current < dayjs().endOf("day")
                          }
                          className="w-full h-14 bg-background border-border text-foreground hover:border-primary focus:border-primary rounded-2xl shadow-sm"
                          placeholder="Now"
                          value={scheduledAt}
                          onChange={(val) => setScheduledAt(val)}
                        />
                      </div>
                    </div>

                    {/* Count / Clicks Section */}
                    <div className="p-10 rounded-[2.5rem] bg-accent/30 border border-border shadow-inner relative overflow-hidden group/card">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[100px] -mr-40 -mt-40 pointer-events-none" />

                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 relative z-10">
                        <div className="space-y-2">
                          <h4 className="font-black text-sm text-foreground uppercase tracking-widest">
                            {broadcastType === "POKAZ"
                              ? tb.targetCountLabel || "Recipients"
                              : tb.targetClickLabel || "Target Clicks"}
                          </h4>
                          <p className="text-xs text-muted-foreground font-medium">
                            {broadcastType === "POKAZ"
                              ? tb.randomHint || "Random audience"
                              : tb.guaranteedHint ||
                                "Guaranteed organic clicks"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-baseline gap-3">
                            <input
                              type="number"
                              value={targetCount}
                              onChange={(e) => {
                                let val = parseInt(e.target.value);
                                if (isNaN(val)) val = 0;
                                if (
                                  broadcastType === "POKAZ" &&
                                  val > activeUsersCount
                                )
                                  val = activeUsersCount;
                                setTargetCount(val);
                              }}
                              className="w-48 text-5xl md:text-7xl font-black text-foreground tracking-tighter tabular-nums bg-transparent border-b-2 border-border focus:border-primary outline-none text-right transition-colors"
                            />
                            <span className="text-sm font-black text-primary uppercase tracking-widest mb-2">
                              {broadcastType === "PDP"
                                ? tb.clicksLabel || "clicks"
                                : tb.usersLabel || "users"}
                            </span>
                          </div>

                          {walletBalance !== null && totalCost > 0 && (
                            <div
                              className={`mt-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-sm border ${walletBalance >= totalCost ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-destructive/10 text-destructive border-destructive/20 animate-pulse"}`}
                            >
                              {walletBalance >= totalCost
                                ? `Balance OK: $${totalCost.toFixed(2)}`
                                : `Need $${(totalCost - walletBalance).toFixed(2)} more`}
                            </div>
                          )}
                        </div>
                      </div>

                      {broadcastType === "POKAZ" && (
                        <div className="mb-8 space-y-10 relative z-10">
                          <div className="p-2 bg-background/50 border border-border rounded-2xl grid grid-cols-3 gap-2 shadow-sm">
                            {([3, 7, 30] as const).map((d) => (
                              <button
                                key={d}
                                onClick={() => setActiveDays(d)}
                                className={`py-4 px-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeDays === d ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-accent"}`}
                              >
                                {d} {tb.activeDaysBtn || "days active"}
                              </button>
                            ))}
                          </div>

                          <div className="relative pt-6 pb-2">
                            <input
                              type="range"
                              min={1}
                              max={activeUsersCount || 100}
                              value={targetCount}
                              onChange={(e) =>
                                setTargetCount(Number(e.target.value))
                              }
                              className="w-full h-3 bg-muted rounded-full appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all focus:outline-none"
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            <span>1 {tb.usersLabel || "User"}</span>
                            <span>
                              {activeUsersCount.toLocaleString()}{" "}
                              {tb.usersLabel || "Users"}
                            </span>
                          </div>
                        </div>
                      )}

                      {broadcastType === "PDP" && (
                        <div className="grid grid-cols-4 gap-4 relative z-10">
                          {[100, 500, 1000, 5000].map((val) => (
                            <button
                              key={val}
                              onClick={() => setTargetCount(val)}
                              className={`py-6 rounded-2xl font-black text-sm transition-all border-2 ${targetCount === val ? "bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/20 -translate-y-1" : "bg-background border-border text-muted-foreground hover:border-primary/30"}`}
                            >
                              {val.toLocaleString()}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    disabled={!selectedBotId || targetCount < 1}
                    onClick={() => setStep(2)}
                    className="w-full h-16 bg-primary text-primary-foreground rounded-[24px] font-black uppercase tracking-[0.2em] mt-12 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-30 shadow-xl shadow-primary/20 text-xs flex items-center justify-center gap-3 group/btn"
                  >
                    {tb.nextStep || "Davom etish"}
                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* 3. Content Creation */}
                <div className="bg-card border border-border rounded-3xl p-10 shadow-sm">
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <div className="p-2.5 bg-primary/10 rounded-xl">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      3. {tb.step3 || "Xabar Mazmuni"}
                    </h2>
                    {selectedBotId && (
                      <Tooltip title={tb.fetchDraft || "Botdagi draftni olish"}>
                        <button
                          onClick={fetchDraft}
                          disabled={fetchingDraft}
                          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent border border-border text-primary text-xs font-black shadow-sm hover:bg-accent/80 transition-all uppercase tracking-widest"
                        >
                          {fetchingDraft ? (
                            <Spin size="small" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          {fetchingDraft ? tb.fetching : tb.fetchDraft}
                        </button>
                      </Tooltip>
                    )}
                  </div>

                  <div className="space-y-10">
                    {/* Composition Method Selection */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-8 bg-primary/5 border-2 border-primary rounded-3xl relative shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2.5 bg-primary/10 rounded-xl">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <span className="text-xl font-black text-foreground italic tracking-tighter uppercase">
                            {tb.telegramTab?.directTitle || "Write directly"}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase font-black leading-relaxed tracking-widest opacity-80">
                          {tb.telegramTab?.hint ||
                            "You can add text, image, and buttons together"}
                        </p>
                      </div>

                      <a
                        href={`https://t.me/akhmadsnetbot?start=broadcast_${selectedBotId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-8 bg-background border border-border hover:border-blue-500/50 hover:bg-blue-500/5 rounded-3xl transition-all group relative overflow-hidden shadow-sm flex flex-col justify-center"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2.5 bg-blue-500/10 rounded-xl transition-transform group-hover:scale-110">
                            <Send className="w-6 h-6 text-blue-500" />
                          </div>
                          <span className="text-xl font-black text-foreground group-hover:text-blue-500 transition-colors italic tracking-tighter uppercase">
                            {tb.telegramTab?.telegramTitle || "Add via Bot"}
                          </span>
                          <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse ml-auto" />
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase font-black leading-relaxed tracking-widest opacity-80">
                          {tb.telegramTab?.hint ||
                            "Create by sending a message to the bot"}
                        </p>
                      </a>
                    </div>

                    {/* Editor */}
                    <div className="bg-background border-2 border-border rounded-3xl overflow-hidden shadow-sm focus-within:border-primary/50 transition-colors">
                      <div className="p-4 border-b-2 border-border flex gap-3 bg-muted/30">
                        {(["TEXT", "HTML"] as const).map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setContentType(fmt)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-sm ${contentType === fmt ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-accent"}`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={12}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={
                          tb.messagePlaceholder || "Xabaringizni yozing..."
                        }
                        className="w-full bg-transparent p-8 text-foreground text-xl leading-relaxed font-medium focus:outline-none resize-none placeholder:text-muted-foreground/30"
                      />
                    </div>

                    {/* Buttons Management */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <h4 className="font-black text-muted-foreground text-xs uppercase tracking-widest">
                          {tb.inlineButtons || "Inline Buttons"}
                        </h4>
                        <button
                          onClick={addButton}
                          disabled={buttons.length >= 6}
                          className="px-5 py-2.5 rounded-xl bg-accent border border-border text-xs font-black text-primary hover:bg-accent/80 transition-all flex items-center gap-2 uppercase tracking-widest shadow-sm"
                        >
                          <Plus className="w-4 h-4" />{" "}
                          {tb.addButton || "Qo'shish"}
                        </button>
                      </div>

                      <div className="grid gap-4">
                        {buttons.map((btn, i) => (
                          <div
                            key={i}
                            className="flex flex-col gap-4 p-6 bg-accent/20 border border-border rounded-3xl shadow-sm"
                          >
                            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                              <input
                                placeholder={
                                  tb.buttonTextPlaceholder || "Button text"
                                }
                                className="w-full md:flex-1 bg-background border border-border rounded-xl px-5 py-4 text-sm font-bold focus:border-primary outline-none shadow-sm"
                                value={btn.text}
                                onChange={(e) =>
                                  updateButton(i, "text", e.target.value)
                                }
                              />
                              <input
                                placeholder={tb.urlPlaceholder || "https://..."}
                                className="w-full md:flex-[2] bg-background border border-border rounded-xl px-5 py-4 text-sm font-bold focus:border-primary outline-none shadow-sm"
                                value={btn.url}
                                onChange={(e) =>
                                  updateButton(i, "url", e.target.value)
                                }
                              />
                              <button
                                onClick={() => removeButton(i)}
                                className="w-14 h-14 bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center rounded-xl hover:bg-destructive shadow-sm hover:text-destructive-foreground transition-all"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                            <div className="flex items-center gap-4 px-1">
                              <div
                                className="flex items-center gap-3 cursor-pointer group/tracking"
                                onClick={() =>
                                  updateButton(
                                    i,
                                    "trackingEnabled",
                                    btn.trackingEnabled === false,
                                  )
                                }
                              >
                                <div
                                  className={`w-12 h-6 rounded-full transition-all relative p-1 ${btn.trackingEnabled !== false ? "bg-primary" : "bg-muted"}`}
                                >
                                  <div
                                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${btn.trackingEnabled !== false ? "right-1" : "left-1"}`}
                                  />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                                  {btn.trackingEnabled !== false
                                    ? (tb?.trackingOn ?? "Tracking ON")
                                    : (tb?.trackingOff ?? "Tracking OFF")}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Media Preview if Drafted */}
                    {mediaUrl && (
                      <div className="p-8 rounded-[2.5rem] bg-accent/30 border-2 border-border shadow-inner group">
                        <div className="flex items-center justify-between mb-6">
                          <div className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">
                            {tb.draftMedia || "Draft Media Attached"}
                          </div>
                          <button
                            onClick={() => setMediaUrl("")}
                            className="p-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="rounded-3xl overflow-hidden border border-border shadow-xl">
                          {mediaType?.startsWith("video") ? (
                            <video
                              src={mediaUrl}
                              className="w-full max-h-[400px] object-cover"
                              controls
                            />
                          ) : (
                            <img
                              src={mediaUrl}
                              className="w-full max-h-[400px] object-cover"
                              alt="Draft"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-12">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 h-16 bg-background border-2 border-border rounded-2xl font-black uppercase tracking-widest hover:bg-muted transition-all text-xs active:scale-[0.98]"
                    >
                      {tb.back || "Back"}
                    </button>
                    <button
                      disabled={isSubmitting || !canLaunch}
                      onClick={handleLaunch}
                      className="flex-[2] h-16 bg-primary shadow-xl shadow-primary/20 text-primary-foreground rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-3 text-sm"
                    >
                      {isSubmitting ? (
                        <Spin size="small" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />{" "}
                          {tb.checkout?.launch || "Launch Campaign"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Checkout Summary */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-card border border-border rounded-[2.5rem] p-10 relative overflow-hidden shadow-xl text-foreground/90">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] -mr-24 -mt-24 pointer-events-none" />

              <h3 className="text-2xl font-black italic border-b-2 border-border pb-8 mb-10 uppercase tracking-tighter flex items-center justify-between text-foreground">
                {tb.checkout?.budgetControl || "Budget Control"}
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
              </h3>

              <div className="space-y-8">
                <div className="flex justify-between items-center px-2">
                  <span className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                    {tb.checkout?.targeting || "Targeting"}
                  </span>
                  <div className="px-2 py-1 rounded bg-foreground/5 text-[10px] font-bold text-foreground uppercase">
                    {targetLanguage.toLowerCase() === "all"
                      ? tb.allLanguages || "ALL"
                      : targetLanguage}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">
                    {tb.checkout?.recipients || "Recipients"}
                  </span>
                  <span className="font-bold text-foreground">
                    {targetCount.toLocaleString()}{" "}
                    {broadcastType === "PDP"
                      ? tb.clicksLabel || "Clicks"
                      : tb.usersLabel || "Users"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">
                    {tb.checkout?.rate || "Rate"} (
                    {broadcastType === "PDP"
                      ? tb.pdpTitle || "Per Click"
                      : tb.pokazTitle || "Per User"}
                    )
                  </span>
                  <span className="font-mono text-purple-400">
                    ${pricePerUnit.toFixed(4)}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-foreground/5 border border-white/10 flex justify-between items-center group hover:border-purple-500/30 transition-all">
                  <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    {tb.checkout?.baseFee || "Base Fee"}
                  </span>
                  <span className="font-bold text-foreground/50 text-xs">
                    $0.50
                  </span>
                </div>

                <div className="pt-6 border-t border-white/5 mt-6">
                  <div className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-2">
                    {tb.checkout?.total || "Total Amount"}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-foreground italic">
                      ${totalCost.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">
                      USD
                    </span>
                  </div>
                </div>

                {scheduledAt && (
                  <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase">
                    <Clock className="w-3 h-3" />
                    {tb.checkout?.scheduledLabel?.replace(
                      "{{date}}",
                      scheduledAt.format("DD.MM.YYYY HH:mm"),
                    ) || `${scheduledAt.format("DD.MM.YYYY HH:mm")} rejalangan`}
                  </div>
                )}
              </div>

              <div className="mt-10 flex gap-2 text-gray-600 text-[9px] leading-relaxed uppercase font-bold tracking-tight">
                <AlertCircle className="w-3 h-3 shrink-0 text-gray-700" />
                {tb.checkout?.fundsReservedNote ||
                  "Kampaniya tasdiqlangandan so'ng hamyoningizdan mablag' yechib olinadi."}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-select-bc-new .ant-select-selector {
          background: #0f0f0f !important;
          border-color: #1f1f1f !important;
          border-radius: 16px !important;
          color: white !important;
          transition: all 0.3s !important;
          display: flex !important;
          align-items: center !important;
          padding: 0 16px !important;
        }
        .custom-select-bc-new .ant-select-selection-item {
          line-height: 54px !important;
          font-weight: 700 !important;
          color: white !important;
          font-size: 14px !important;
        }
        .custom-select-bc-new:hover .ant-select-selector {
           border-color: #333 !important;
        }
        .custom-select-bc-new .ant-select-selection-placeholder {
          line-height: 54px !important;
          color: #444 !important;
        }
        .ant-select-dropdown {
          background: #0f0f0f !important;
          border: 1px solid #1f1f1f !important;
          border-radius: 16px !important;
          padding: 8px !important;
        }
        .ant-select-item {
            border-radius: 10px !important;
            margin-bottom: 4px !important;
            transition: all 0.2s !important;
        }
        .ant-select-item-option-active { background: rgba(255,255,255,0.05) !important; }
        .ant-select-item-option-selected { 
          background: rgba(147, 51, 234, 0.1) !important; 
          border: 1px solid rgba(147, 51, 234, 0.3) !important;
          color: white !important; 
        }
        .ant-select-item-option-selected * {
          color: white !important;
        }
        
        .ant-picker { background: #050505 !important; border-color: #1f1f1f !important; border-radius: 16px !important; }
        .ant-picker-input > input { color: white !important; font-weight: 600 !important; }
        .ant-picker-clear { background: #050505 !important; color: #444 !important; }
        .ant-picker-suffix { color: #444 !important; }

        .custom-slider-bc::-webkit-slider-runnable-track {
          background: rgba(255, 255, 255, 0.03);
          height: 12px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .custom-slider-bc::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 32px;
          width: 32px;
          border-radius: 12px;
          background: white;
          margin-top: -11px;
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
          border: 6px solid #8b5cf6;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: grab;
        }
        .custom-slider-bc::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.15) rotate(5deg);
        }
      `}</style>
    </div>
  );
};

export default BroadcastAd;
