import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Select, Spin } from "antd";
import {
  ArrowLeft,
  Send,
  Users,
  Zap,
  Clock,
  Plus,
  Trash2,
  Info,
  ChevronRight,
  Radio,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../api/api";
import { useTranslations } from "../../hooks/useTranslations";

const { Option } = Select;

// ── Tarif sabab: backend $0.50 base + $0.05/user
const BASE_FEE = 0.5;
const PRICE_PER_USER = 0.05;

const calcTotal = (count: number) =>
  count > 0 ? BASE_FEE + count * PRICE_PER_USER : 0;

// ── Active days → bot field name
const dayKey: Record<number, string> = {
  3:  "activeUsers3d",
  7:  "activeUsers7d",
  30: "activeUsers30d",
};

const BroadcastAd: React.FC = () => {
  const navigate = useNavigate();
  const { lang } = useParams();
  const t = useTranslations();

  // ── Data
  const [publicBots, setPublicBots] = useState<any[]>([]);
  const [botsLoading, setBotsLoading] = useState(false);

  // ── Selection
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);
  const [activeDays, setActiveDays] = useState<3 | 7 | 30>(30);
  const [targetCount, setTargetCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // ── Content
  const [contentType, setContentType] = useState<"TEXT" | "HTML">("TEXT");
  const [text, setText] = useState("");
  const [buttons, setButtons] = useState<{ text: string; url: string }[]>([]);

  // ── Submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1=targeting, 2=content

  // ── Derived
  const selectedBot = useMemo(
    () => publicBots.find((b) => b.id === selectedBotId) ?? null,
    [publicBots, selectedBotId]
  );

  const activeUsersCount: number = selectedBot
    ? (selectedBot[dayKey[activeDays]] ?? 0)
    : 0;

  const totalCost = calcTotal(targetCount);
  const canLaunch =
    !!selectedBotId &&
    targetCount > 0 &&
    targetCount <= activeUsersCount &&
    text.trim().length >= 5;

  // ── Load bots
  useEffect(() => {
    setBotsLoading(true);
    apiClient
      .get("/bots/public")
      .then((res) => setPublicBots(res.data?.data?.bots ?? []))
      .catch(() => toast.error("Botlarni yuklashda xatolik"))
      .finally(() => setBotsLoading(false));
  }, []);

  // ── When bot or activeDays change → reset targetCount
  useEffect(() => {
    const max = activeUsersCount;
    setTargetCount(max > 0 ? Math.min(targetCount || max, max) : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBotId, activeDays]);

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
    [publicBots, searchTerm]
  );

  const handleLaunch = async () => {
    if (!canLaunch) return;

    const validButtons = buttons.filter((b) => b.text.trim() && b.url.trim());

    setIsSubmitting(true);
    try {
      await apiClient.post("/ads/broadcasts", {
        botId: selectedBotId,
        contentType,
        text: text.trim(),
        targetCount,
        activeDays,
        buttons: validButtons,
      });
      toast.success("Broadcast muvaffaqiyatli ishga tushirildi!");
      navigate(`/${lang}/my-ads`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Broadcast yaratishda xatolik";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addButton = () =>
    setButtons((prev) => [...prev, { text: "", url: "" }]);
  const removeButton = (i: number) =>
    setButtons((prev) => prev.filter((_, idx) => idx !== i));
  const updateButton = (i: number, field: "text" | "url", val: string) =>
    setButtons((prev) =>
      prev.map((b, idx) => (idx === i ? { ...b, [field]: val } : b))
    );

  // ───────────────────────────── Render ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 mt-4 flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card transition-all text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Orqaga
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Radio className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Broadcast Xabar
            </h1>
          </div>
          <p className="text-muted-foreground text-base max-w-xl mt-2">
            Botning faol foydalanuvchilariga to'g'ridan-to'g'ri shaxsiy xabar yuboring.
            100% yetkazish kafolati.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[
            { n: 1, label: "Auditoriya" },
            { n: 2, label: "Xabar matni" },
          ].map((s, i, arr) => (
            <React.Fragment key={s.n}>
              <button
                onClick={() => s.n < step || (s.n === 2 && selectedBotId && targetCount > 0) ? setStep(s.n as 1 | 2) : undefined}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  step === s.n
                    ? "bg-primary text-primary-foreground"
                    : step > s.n
                    ? "bg-primary/20 text-primary cursor-pointer"
                    : "bg-card text-muted-foreground border border-border"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${step > s.n ? "bg-primary/30" : "bg-current/20"}`}>
                  {step > s.n ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.n}
                </span>
                {s.label}
              </button>
              {i < arr.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Main form ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* ═══ STEP 1: Audience ═══ */}
            {step === 1 && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                <h2 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  1. Auditoriyani tanlang
                </h2>

                {/* Bot select */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Qaysi botning auditoriyasiga?
                  </label>
                  {botsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                      <Spin size="small" /> Botlar yuklanmoqda...
                    </div>
                  ) : publicBots.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                      <AlertCircle className="w-4 h-4" />
                      Hozircha birorta faol bot yo'q
                    </div>
                  ) : (
                    <Select
                      showSearch
                      value={selectedBotId}
                      placeholder="Bot qidiring..."
                      className="w-full h-12 custom-select-bc"
                      onChange={(v) => setSelectedBotId(v)}
                      onSearch={setSearchTerm}
                      filterOption={false}
                      notFoundContent={<span className="text-muted-foreground text-sm">Topilmadi</span>}
                    >
                      {filteredBots.map((b) => (
                        <Option key={b.id} value={b.id}>
                          <div className="flex items-center gap-2 py-0.5">
                            <img
                              src={`${import.meta.env.VITE_API_URL}/bots/avatar/${b.username}`}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover bg-primary/20"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                            <span className="font-bold text-sm">@{b.username}</span>
                            {b.firstName && (
                              <span className="text-muted-foreground text-xs">· {b.firstName}</span>
                            )}
                            <span className="ml-auto text-xs font-bold text-primary">
                              {(b.activeUsers30d ?? 0).toLocaleString()} foydalanuvchi
                            </span>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  )}
                </div>

                {/* Active days */}
                {selectedBot && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Faollik davri (so'nggi N kun ichida aktiv bo'lganlar)
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {([3, 7, 30] as const).map((d) => {
                          const count = selectedBot[dayKey[d]] ?? 0;
                          return (
                            <button
                              key={d}
                              onClick={() => setActiveDays(d)}
                              className={`rounded-xl p-3 text-center border transition-all ${
                                activeDays === d
                                  ? "border-primary bg-primary/10"
                                  : "border-border bg-background hover:border-primary/40"
                              }`}
                            >
                              <div className={`text-xl font-black ${activeDays === d ? "text-primary" : "text-foreground"}`}>
                                {count.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground font-semibold mt-0.5">
                                {d} kun
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Target count */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Nechta foydalanuvchiga yuborish?
                        <span className="ml-2 text-primary font-black">
                          (max: {activeUsersCount.toLocaleString()})
                        </span>
                      </label>

                      {activeUsersCount === 0 ? (
                        <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          Bu davr ichida faol foydalanuvchi yo'q. Boshqa davrni tanlang.
                        </div>
                      ) : (
                        <>
                          {/* Slider */}
                          <input
                            type="range"
                            min={1}
                            max={activeUsersCount}
                            value={targetCount}
                            onChange={(e) => setTargetCount(Number(e.target.value))}
                            className="w-full accent-primary"
                          />
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min={1}
                              max={activeUsersCount}
                              value={targetCount}
                              onChange={(e) => {
                                const v = Math.max(1, Math.min(activeUsersCount, Number(e.target.value) || 1));
                                setTargetCount(v);
                              }}
                              className="w-36 px-4 py-2.5 bg-background border border-border rounded-xl text-foreground font-bold text-sm focus:border-primary outline-none"
                            />
                            <span className="text-muted-foreground text-sm">foydalanuvchi</span>
                            <button
                              onClick={() => setTargetCount(activeUsersCount)}
                              className="ml-auto text-xs font-bold text-primary hover:underline"
                            >
                              Barchasi ({activeUsersCount.toLocaleString()})
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Info className="w-3.5 h-3.5" />
                            Foydalanuvchilar tasodifiy tanlanadi
                          </div>
                        </>
                      )}
                    </div>

                    {/* Next step button */}
                    <button
                      disabled={targetCount < 1 || activeUsersCount === 0}
                      onClick={() => setStep(2)}
                      className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-primary-foreground flex items-center justify-center gap-2 transition-all"
                    >
                      Davom etish
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ═══ STEP 2: Message content ═══ */}
            {step === 2 && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    2. Xabar matni
                  </h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Orqaga
                  </button>
                </div>

                {/* Format */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Xabar formati
                  </label>
                  <div className="flex gap-2">
                    {(["TEXT", "HTML"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setContentType(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                          contentType === f
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {f === "TEXT" ? "Oddiy matn" : "HTML / Formatlangan"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Xabar matni *
                    </label>
                    <span className={`text-xs font-bold ${text.length > 4000 ? "text-red-400" : "text-muted-foreground"}`}>
                      {text.length} / 4096
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    maxLength={4096}
                    placeholder={
                      contentType === "HTML"
                        ? "<b>Salom!</b>\n\nMahsulotimizni ko'ring 👇"
                        : "Salom! Yangi mahsulotimiz chiqdi..."
                    }
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 text-sm leading-relaxed resize-none focus:border-primary outline-none transition-all font-mono"
                  />
                  {text.trim().length < 5 && text.length > 0 && (
                    <p className="text-xs text-red-400">Kamida 5 ta belgi kiriting</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Inline tugmalar (ixtiyoriy)
                    </label>
                    <button
                      onClick={addButton}
                      disabled={buttons.length >= 5}
                      className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" /> Qo'shish
                    </button>
                  </div>
                  {buttons.map((btn, i) => (
                    <div key={i} className="flex gap-2 animate-in slide-in-from-right-2 duration-200">
                      <input
                        placeholder="Tugma matni"
                        value={btn.text}
                        onChange={(e) => updateButton(i, "text", e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground/50 focus:border-primary outline-none"
                      />
                      <input
                        placeholder="https://..."
                        value={btn.url}
                        onChange={(e) => updateButton(i, "url", e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground/50 focus:border-primary outline-none"
                      />
                      <button
                        onClick={() => removeButton(i)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Summary before launch */}
                <div className="p-4 bg-primary/5 border border-primary/15 rounded-xl space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bot:</span>
                    <span className="font-bold">@{selectedBot?.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Foydalanuvchilar:</span>
                    <span className="font-bold text-primary">{targetCount.toLocaleString()} ta</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Faollik davri:</span>
                    <span className="font-bold">So'nggi {activeDays} kun</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Checkout ── */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
              {/* Top bar */}
              <div className="h-1 -mt-5 -mx-5 mb-5 rounded-t-2xl bg-gradient-to-r from-primary via-indigo-500 to-blue-500" />

              <h3 className="font-black text-lg mb-5">Hisob-kitob</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Qabul qiluvchi:</span>
                  <span className="font-bold text-primary">
                    {targetCount > 0 ? `${targetCount.toLocaleString()} ta` : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Narx (har biri):</span>
                  <span className="font-bold">$0.05</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Xabar narxi:</span>
                  <span className="font-bold">
                    ${(targetCount * PRICE_PER_USER).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Bazaviy to'lov:</span>
                  <span className="font-bold">${BASE_FEE.toFixed(2)}</span>
                </div>
              </div>

              <div className="h-px bg-border my-4" />

              <div className="flex justify-between items-baseline mb-5">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Jami
                </span>
                <div className="text-right">
                  <div className="text-4xl font-black">${totalCost.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">USD Wallet</div>
                </div>
              </div>

              {/* Launch button */}
              {step === 1 ? (
                <button
                  disabled={!selectedBotId || targetCount < 1 || activeUsersCount === 0}
                  onClick={() => setStep(2)}
                  className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-primary-foreground flex items-center justify-center gap-2 transition-all"
                >
                  Xabar yozing
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  disabled={isSubmitting || !canLaunch}
                  onClick={handleLaunch}
                  className="w-full h-12 bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25"
                >
                  {isSubmitting ? (
                    <Spin size="small" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      YUBORISH
                    </>
                  )}
                </button>
              )}

              {/* Info */}
              <div className="mt-4 flex gap-2 text-xs text-muted-foreground leading-relaxed">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
                <span>
                  Broadcast bir necha daqiqa ichida yetkaziladi.
                  Xabarlar botingiz orqali to'g'ridan-to'g'ri yuboriladi.
                </span>
              </div>

              {/* Stats */}
              {selectedBot && (
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    @{selectedBot.username} statistikasi
                  </p>
                  {[
                    { label: "3 kun", key: "activeUsers3d" },
                    { label: "7 kun", key: "activeUsers7d" },
                    { label: "30 kun", key: "activeUsers30d" },
                  ].map((s) => (
                    <div key={s.key} className="flex justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {s.label}
                      </span>
                      <span className="font-bold">
                        {(selectedBot[s.key] ?? 0).toLocaleString()} foydalanuvchi
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-select-bc .ant-select-selector {
          background: var(--card) !important;
          border-color: var(--border) !important;
          border-radius: 12px !important;
          height: 48px !important;
          display: flex !important;
          align-items: center !important;
          color: var(--foreground) !important;
        }
        .custom-select-bc .ant-select-selection-placeholder {
          color: var(--muted-foreground) !important;
        }
        .custom-select-bc .ant-select-arrow { color: var(--muted-foreground) !important; }
        .ant-select-dropdown {
          background: var(--card) !important;
          border: 1px solid var(--border) !important;
          border-radius: 12px !important;
        }
        .ant-select-item { color: var(--foreground) !important; }
        .ant-select-item-option-active { background: rgba(139,92,246,0.08) !important; }
        .ant-select-item-option-selected { background: rgba(139,92,246,0.15) !important; color: #a78bfa !important; }
      `}</style>
    </div>
  );
};

export default BroadcastAd;
