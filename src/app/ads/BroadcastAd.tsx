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
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="group mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">{tb.back}</span>
        </button>

        {/* Header */}
        <div className="grid md:grid-cols-2 gap-12 items-end mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-4 uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Advanced Campaign
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent italic">
              {tb.title}
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              {tb.subtitle}
            </p>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-end gap-2">
            {[1, 2].map((n) => (
              <button
                key={n}
                onClick={() => n === 1 && setStep(1)}
                className={`h-1.5 rounded-full transition-all duration-500 ${step === n ? "w-12 bg-purple-500" : "w-4 bg-white/10 hover:bg-white/20"}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form */}
          <div className="lg:col-span-8 space-y-6">
            {step === 1 ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* 1. Model Selection */}
                <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-3xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] pointer-events-none" />

                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 mb-8 flex items-center gap-2">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Zap className="w-4 h-4" />
                    </div>
                    1. {tb.typeLabel || "Kampaniya Modeli"}
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setBroadcastType("POKAZ")}
                      className={`p-6 rounded-2xl border text-left transition-all ${broadcastType === "POKAZ" ? "bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/20" : "bg-[#050505] border-[#1f1f1f] hover:border-[#333]"}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${broadcastType === "POKAZ" ? "bg-purple-500 text-white shadow-lg shadow-purple-500/40" : "bg-gray-800 text-gray-400"}`}
                      >
                        <Users className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg mb-1">
                        {tb.pokazTitle || "Pay per message"}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed uppercase font-black opacity-60">
                        {tb.pokazDesc || "Barcha foydalanuvchilar uchun"}
                      </p>
                    </button>

                    <button
                      onClick={() => setBroadcastType("PDP")}
                      className={`p-6 rounded-2xl border text-left transition-all ${broadcastType === "PDP" ? "bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/20" : "bg-[#050505] border-[#1f1f1f] hover:border-[#333]"}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${broadcastType === "PDP" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/40" : "bg-gray-800 text-gray-400"}`}
                      >
                        <Radio className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg mb-1">
                        {tb.pdpTitle || "Pay per click"}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed uppercase font-black opacity-60">
                        {tb.pdpDesc || "Faqat kliklar uchun"}
                      </p>
                    </button>
                  </div>
                </div>

                {/* 2. Bot & Audience */}
                <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-3xl p-8">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 mb-8 flex items-center gap-2">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Users className="w-4 h-4" />
                    </div>
                    2. {tb.step1 || "Auditoriya"}
                  </h2>

                  <div className="space-y-8">
                    {/* Bot Select */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block ml-1">
                        {tb.botSelect || "Botni tanlang"}
                      </label>
                      <Select
                        showSearch
                        value={selectedBotId}
                        loading={botsLoading}
                        placeholder={tb.searchBotPlaceholder}
                        className="w-full custom-select-bc-new h-14"
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
                            <div className="flex items-center gap-4 py-1">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/5 flex items-center justify-center font-black text-purple-400">
                                {b.username[0].toUpperCase()}
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <div className="font-bold text-white text-sm tracking-tight leading-none">
                                  @{b.username}
                                </div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-1 opacity-60">
                                  {b.category}
                                </div>
                              </div>
                              <div className="ml-auto">
                                <div className="px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-black text-purple-500 uppercase tracking-wider">
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
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block ml-1">
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
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block ml-1">
                          {tb.scheduleTitle || "Schedule (Optional)"}
                        </label>
                        <DatePicker
                          showTime
                          disabledDate={(current) =>
                            current && current < dayjs().endOf("day")
                          }
                          className="w-full h-14 bg-[#050505] border-[#1f1f1f] text-white hover:border-purple-500 focus:border-purple-500 rounded-2xl"
                          placeholder="Now"
                          value={scheduledAt}
                          onChange={(val) => setScheduledAt(val)}
                        />
                      </div>
                    </div>

                    {/* Count / Clicks Section */}
                    <div className="p-10 rounded-[40px] bg-gradient-to-b from-[#111] to-[#050505] border border-white/5 shadow-2xl relative overflow-hidden group/card">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                      <div className="flex items-start md:items-center justify-between mb-10 gap-4 relative z-10">
                        <div className="space-y-2">
                          <h4 className="font-bold text-sm text-gray-300">
                            {broadcastType === "POKAZ"
                              ? tb.targetCountLabel || "Recipients"
                              : tb.targetClickLabel || "Target Clicks"}
                          </h4>
                          <p className="text-[11px] text-gray-500 font-medium">
                            {broadcastType === "POKAZ"
                              ? tb.randomHint || "Random audience"
                              : tb.guaranteedHint ||
                                "Guaranteed organic clicks"}
                          </p>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <div className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-2xl">
                            {targetCount.toLocaleString()}
                          </div>
                          <span className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-1">
                            {broadcastType === "PDP"
                              ? tb.clicksLabel || "clicks"
                              : tb.usersLabel || "users"}
                          </span>
                        </div>
                      </div>

                      {broadcastType === "POKAZ" && (
                        <div className="mb-8 space-y-8 relative z-10">
                          <div className="p-1.5 bg-black/40 border border-white/5 rounded-2xl grid grid-cols-3 gap-1.5 shadow-inner">
                            {([3, 7, 30] as const).map((d) => (
                              <button
                                key={d}
                                onClick={() => setActiveDays(d)}
                                className={`py-4 px-1 rounded-xl text-xs font-bold transition-all duration-300 ${activeDays === d ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}
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
                              className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all focus:outline-none custom-slider-bc"
                            />
                          </div>
                          <div className="flex justify-between text-xs font-medium text-gray-500">
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
                              className={`py-6 rounded-2xl font-bold border transition-all ${targetCount === val ? "bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-600/30 -translate-y-1" : "bg-black/40 border-white/5 text-gray-600 hover:border-white/10"}`}
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
                    className="w-full h-16 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-[24px] font-black uppercase tracking-[0.2em] mt-12 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale shadow-xl shadow-purple-500/20 text-xs flex items-center justify-center gap-2 group/btn"
                  >
                    {tb.nextStep || "Davom etish"}
                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* 3. Content Creation */}
                <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-2 group-hover:scale-105 transition-transform duration-500">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      3. {tb.step3 || "Xabar Mazmuni"}
                    </h2>
                    {selectedBotId && (
                      <Tooltip title={tb.fetchDraft || "Botdagi draftni olish"}>
                        <button
                          onClick={fetchDraft}
                          disabled={fetchingDraft}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition-all"
                        >
                          {fetchingDraft ? (
                            <Spin size="small" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          {fetchingDraft ? tb.fetching : tb.fetchDraft}
                        </button>
                      </Tooltip>
                    )}
                  </div>

                  <div className="space-y-8">
                    {/* Composition Method Selection */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-6 bg-purple-500/5 border-2 border-purple-500/50 rounded-2xl ring-4 ring-purple-500/5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-purple-500/10 rounded-xl">
                            <FileText className="w-5 h-5 text-purple-400" />
                          </div>
                          <span className="text-base font-bold text-white uppercase tracking-tighter italic">
                            {tb.telegramTab?.directTitle || "Write directly"}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase font-black leading-relaxed tracking-widest opacity-70">
                          {tb.telegramTab?.hint ||
                            "You can add text, image, and buttons together"}
                        </p>
                      </div>

                      <a
                        href={`https://t.me/akhmadsnetbot?start=broadcast_${selectedBotId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-6 bg-card border border-border hover:border-blue-500/50 hover:bg-blue-500/5 rounded-2xl transition-all group relative overflow-hidden shadow-sm flex flex-col justify-center"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-500/10 rounded-xl transition-transform group-hover:scale-110">
                            <Send className="w-5 h-5 text-blue-500" />
                          </div>
                          <span className="text-base font-bold text-white group-hover:text-blue-500 transition-colors uppercase tracking-tighter italic">
                            {tb.telegramTab?.telegramTitle || "Add via Bot"}
                          </span>
                          <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse ml-auto" />
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase font-black leading-relaxed tracking-widest opacity-70">
                          {tb.telegramTab?.hint ||
                            "Create by sending a message to the bot"}
                        </p>
                      </a>
                    </div>

                    {/* Editor */}
                    <div className="bg-[#050505] border border-[#1f1f1f] rounded-2xl overflow-hidden">
                      <div className="p-3 border-b border-[#1f1f1f] flex gap-2">
                        {(["TEXT", "HTML"] as const).map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setContentType(fmt)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${contentType === fmt ? "bg-white text-black" : "text-gray-500 hover:bg-white/5"}`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={10}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={
                          tb.messagePlaceholder || "Xabaringizni yozing..."
                        }
                        className="w-full bg-transparent p-6 text-white text-lg leading-relaxed focus:outline-none resize-none placeholder:text-gray-700"
                      />
                    </div>

                    {/* Buttons Management */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-400 text-sm">
                          {tb.inlineButtons || "Inline Buttons"}
                        </h4>
                        <button
                          onClick={addButton}
                          disabled={buttons.length >= 6}
                          className="p-1 px-3 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                          <Plus className="w-3 h-3" />{" "}
                          {tb.addButton || "Qo'shish"}
                        </button>
                      </div>

                      <div className="grid gap-3">
                        {buttons.map((btn, i) => (
                          <div
                            key={i}
                            className="flex flex-col gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl"
                          >
                            <div className="flex gap-2 items-center">
                              <input
                                placeholder={
                                  tb.buttonTextPlaceholder || "Button text"
                                }
                                className="flex-1 bg-[#050505] border border-[#1f1f1f] rounded-xl p-3 text-sm focus:border-purple-500/50 outline-none h-11"
                                value={btn.text}
                                onChange={(e) =>
                                  updateButton(i, "text", e.target.value)
                                }
                              />
                              <input
                                placeholder={tb.urlPlaceholder || "https://..."}
                                className="flex-[2] bg-[#050505] border border-[#1f1f1f] rounded-xl p-3 text-sm focus:border-purple-500/50 outline-none h-11"
                                value={btn.url}
                                onChange={(e) =>
                                  updateButton(i, "url", e.target.value)
                                }
                              />
                              <button
                                onClick={() => removeButton(i)}
                                className="w-11 h-11 bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center rounded-xl hover:bg-red-500/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-4 px-1">
                              <div
                                className="flex items-center gap-2 cursor-pointer group/tracking"
                                onClick={() =>
                                  updateButton(
                                    i,
                                    "trackingEnabled",
                                    btn.trackingEnabled === false,
                                  )
                                }
                              >
                                <div
                                  className={`w-8 h-4 rounded-full transition-all relative ${btn.trackingEnabled !== false ? "bg-purple-500" : "bg-white/10"}`}
                                >
                                  <div
                                    className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${btn.trackingEnabled !== false ? "right-1" : "left-1"}`}
                                  />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">
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
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3">
                          {tb.draftMedia || "Draft Media Attached"}
                        </div>
                        {mediaType?.startsWith("video") ? (
                          <video
                            src={mediaUrl}
                            className="w-full max-h-64 object-cover rounded-xl"
                            controls
                          />
                        ) : (
                          <img
                            src={mediaUrl}
                            className="w-full max-h-64 object-cover rounded-xl"
                            alt="Draft"
                          />
                        )}
                        <button
                          onClick={() => setMediaUrl("")}
                          className="mt-3 text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />{" "}
                          {tb.removeMedia || "Medianing o'chirish"}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 mt-12">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all text-xs"
                    >
                      {tb.back || "Back"}
                    </button>
                    <button
                      disabled={isSubmitting || !canLaunch}
                      onClick={handleLaunch}
                      className="flex-[2] h-14 bg-gradient-to-r from-purple-600 to-blue-600 shadow-xl shadow-purple-600/20 text-white rounded-2xl font-black uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-20 flex items-center justify-center gap-2"
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
            <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-3xl p-8 relative overflow-hidden text-white/90">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[60px] -mr-10 -mt-10 pointer-events-none" />

              <h3 className="text-xl font-black italic border-b border-white/10 pb-6 mb-8 uppercase tracking-tighter flex items-center justify-between text-white">
                {tb.checkout?.budgetControl || "Budget Control"}
                <Sparkles className="w-5 h-5 text-purple-500" />
              </h3>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs font-black tracking-widest uppercase">
                    {tb.checkout?.targeting || "Targeting"}
                  </span>
                  <div className="px-2 py-1 rounded bg-white/5 text-[10px] font-bold text-white uppercase">
                    {targetLanguage.toLowerCase() === "all"
                      ? tb.allLanguages || "ALL"
                      : targetLanguage}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">
                    {tb.checkout?.recipients || "Recipients"}
                  </span>
                  <span className="font-bold text-white">
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

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center group hover:border-purple-500/30 transition-all">
                  <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    {tb.checkout?.baseFee || "Base Fee"}
                  </span>
                  <span className="font-bold text-white/50 text-xs">$0.50</span>
                </div>

                <div className="pt-6 border-t border-white/5 mt-6">
                  <div className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-2">
                    {tb.checkout?.total || "Total Amount"}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white italic">
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
