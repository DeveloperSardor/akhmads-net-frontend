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

const BASE_FEE = 0.5;
const PRICE_PER_USER = 0.05;

const calcTotal = (count: number) =>
  count > 0 ? BASE_FEE + count * PRICE_PER_USER : 0;

const dayKey: Record<number, string> = {
  3: "activeUsers3d",
  7: "activeUsers7d",
  30: "activeUsers30d",
};

type BtnColor = "blue" | "green" | "red" | "default";

interface Button {
  text: string;
  url: string;
  color: BtnColor;
}

const BroadcastAd: React.FC = () => {
  const navigate = useNavigate();
  const { lang } = useParams();
  const t = useTranslations();
  const tb = t.broadcastAd;

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
  const [buttons, setButtons] = useState<Button[]>([]);

  // ── Submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // ── Derived
  const selectedBot = useMemo(
    () => publicBots.find((b) => b.id === selectedBotId) ?? null,
    [publicBots, selectedBotId],
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
      .catch(() => toast.error(tb.errorLoadingBots))
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
    [publicBots, searchTerm],
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
    setButtons((prev) => [...prev, { text: "", url: "", color: "default" }]);
  };
  const removeButton = (i: number) =>
    setButtons((prev) => prev.filter((_, idx) => idx !== i));
  const updateButton = (i: number, field: keyof Button, val: string) =>
    setButtons((prev) =>
      prev.map((b, idx) => (idx === i ? { ...b, [field]: val } : b)),
    );

  const colorDot: Record<BtnColor, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    default: "bg-muted-foreground",
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 mt-4 flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card transition-all text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          {tb.back}
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Radio className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              {tb.title}
            </h1>
          </div>
          <p className="text-muted-foreground text-base max-w-xl mt-2">
            {tb.subtitle}
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[
            { n: 1, label: tb.step1 },
            { n: 2, label: tb.step2 },
          ].map((s, i, arr) => (
            <React.Fragment key={s.n}>
              <button
                onClick={() =>
                  s.n < step || (s.n === 2 && selectedBotId && targetCount > 0)
                    ? setStep(s.n as 1 | 2)
                    : undefined
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  step === s.n
                    ? "bg-primary text-primary-foreground"
                    : step > s.n
                      ? "bg-primary/20 text-primary cursor-pointer"
                      : "bg-card text-muted-foreground border border-border"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
                    step > s.n ? "bg-primary/30" : "bg-current/20"
                  }`}
                >
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
                  1. {tb.step1}
                </h2>

                {/* Bot select */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {tb.selectBotLabel}
                  </label>
                  {botsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                      <Spin size="small" /> {tb.botsLoading}
                    </div>
                  ) : publicBots.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                      <AlertCircle className="w-4 h-4" />
                      {tb.noActiveBots}
                    </div>
                  ) : (
                    <Select
                      showSearch
                      value={selectedBotId}
                      placeholder={tb.searchBotPlaceholder}
                      className="w-full h-12 custom-select-bc"
                      onChange={(v) => setSelectedBotId(v)}
                      onSearch={setSearchTerm}
                      filterOption={false}
                      notFoundContent={
                        <span className="text-muted-foreground text-sm">
                          {tb.notFound}
                        </span>
                      }
                    >
                      {filteredBots.map((b) => (
                        <Option key={b.id} value={b.id}>
                          <div className="flex items-center gap-2 py-0.5">
                            <img
                              src={`${(import.meta.env.VITE_API_URL || "/api/v1").replace(/\/$/, "")}/bots/avatar/@${b.username}`}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover bg-primary/20"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  `https://ui-avatars.com/api/?name=${b.firstName || b.username}&background=random&color=fff&size=128`;
                              }}
                            />
                            <span className="font-bold text-sm">
                              @{b.username}
                            </span>
                            {b.firstName && (
                              <span className="text-muted-foreground text-xs">
                                · {b.firstName}
                              </span>
                            )}
                            <span className="ml-auto text-xs font-bold text-primary">
                              {(b.activeUsers30d ?? 0).toLocaleString()}{" "}
                              {tb.usersSuffix}
                            </span>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  )}
                </div>

                {/* Active days + target count */}
                {selectedBot && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {tb.activeDaysLabel}
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
                              <div
                                className={`text-xl font-black ${
                                  activeDays === d
                                    ? "text-primary"
                                    : "text-foreground"
                                }`}
                              >
                                {count.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground font-semibold mt-0.5">
                                {d} {tb.daysSuffix}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {tb.targetCountLabel}
                        <span className="ml-2 text-primary font-black">
                          ({tb.maxPrefix} {activeUsersCount.toLocaleString()})
                        </span>
                      </label>

                      {activeUsersCount === 0 ? (
                        <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {tb.noActiveUsers}
                        </div>
                      ) : (
                        <>
                          <input
                            type="range"
                            min={1}
                            max={activeUsersCount}
                            value={targetCount}
                            onChange={(e) =>
                              setTargetCount(Number(e.target.value))
                            }
                            className="w-full accent-primary"
                          />
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min={1}
                              max={activeUsersCount}
                              value={targetCount}
                              onChange={(e) => {
                                const v = Math.max(
                                  1,
                                  Math.min(
                                    activeUsersCount,
                                    Number(e.target.value) || 1,
                                  ),
                                );
                                setTargetCount(v);
                              }}
                              className="w-36 px-4 py-2.5 bg-background border border-border rounded-xl text-foreground font-bold text-sm focus:border-primary outline-none"
                            />
                            <span className="text-muted-foreground text-sm">
                              {tb.usersSuffix}
                            </span>
                            <button
                              onClick={() => setTargetCount(activeUsersCount)}
                              className="ml-auto text-xs font-bold text-primary hover:underline"
                            >
                              {tb.allUsers} ({activeUsersCount.toLocaleString()}
                              )
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Info className="w-3.5 h-3.5" />
                            {tb.randomHint}
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      disabled={targetCount < 1 || activeUsersCount === 0}
                      onClick={() => setStep(2)}
                      className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-primary-foreground flex items-center justify-center gap-2 transition-all"
                    >
                      {tb.nextStep}
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
                    2. {tb.step2}
                  </h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> {tb.back}
                  </button>
                </div>

                {/* Format */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {tb.messageFormat}
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
                        {f === "TEXT" ? tb.plainText : tb.htmlFormat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {tb.messageText}
                    </label>
                    <span
                      className={`text-xs font-bold ${
                        text.length > 4000
                          ? "text-red-400"
                          : "text-muted-foreground"
                      }`}
                    >
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
                    <p className="text-xs text-red-400">{tb.minCharsError}</p>
                  )}
                </div>

                {/* Buttons — always visible */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {tb.inlineButtons}
                    </label>
                    <button
                      onClick={addButton}
                      disabled={buttons.length >= 5}
                      className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" /> {tb.addButton}
                    </button>
                  </div>
                  {buttons.map((btn, i) => (
                    <div
                      key={i}
                      className="space-y-2 animate-in slide-in-from-right-2 duration-200"
                    >
                      <div className="flex gap-2">
                        <input
                          placeholder={tb.buttonTextPlaceholder}
                          value={btn.text}
                          onChange={(e) =>
                            updateButton(i, "text", e.target.value)
                          }
                          className="flex-1 px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground/50 focus:border-primary outline-none"
                        />
                        <input
                          placeholder="https://..."
                          value={btn.url}
                          onChange={(e) =>
                            updateButton(i, "url", e.target.value)
                          }
                          className="flex-1 px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground/50 focus:border-primary outline-none"
                        />
                        <button
                          onClick={() => removeButton(i)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Color picker */}
                      <div className="flex items-center gap-2 ml-1">
                        <span className="text-xs text-muted-foreground">
                          {tb.buttonColors.color}
                        </span>
                        {[
                          {
                            c: "blue" as BtnColor,
                            label: tb.buttonColors.blue,
                          },
                          {
                            c: "green" as BtnColor,
                            label: tb.buttonColors.green,
                          },
                          { c: "red" as BtnColor, label: tb.buttonColors.red },
                          { c: "default" as BtnColor, label: "—" },
                        ].map(({ c, label }) => (
                          <button
                            key={c}
                            onClick={() => updateButton(i, "color", c)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              btn.color === c
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/30"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${colorDot[c]}`}
                            />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary before launch */}
                <div className="p-4 bg-primary/5 border border-primary/15 rounded-xl space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {tb.summary.bot}
                    </span>
                    <span className="font-bold">@{selectedBot?.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {tb.summary.users}
                    </span>
                    <span className="font-bold text-primary">
                      {targetCount.toLocaleString()} {tb.usersSuffix}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {tb.summary.activeDays}
                    </span>
                    <span className="font-bold">
                      {tb.summary.lastNDays.replace(
                        "{{n}}",
                        String(activeDays),
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Checkout ── */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
              <div className="h-1 -mt-5 -mx-5 mb-5 rounded-t-2xl bg-gradient-to-r from-primary via-indigo-500 to-blue-500" />

              <h3 className="font-black text-lg mb-5">{tb.checkout.title}</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {tb.checkout.recipients}
                  </span>
                  <span className="font-bold text-primary">
                    {targetCount > 0
                      ? `${targetCount.toLocaleString()} ${tb.usersSuffix}`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {tb.checkout.pricePerUser}
                  </span>
                  <span className="font-bold">$0.05</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {tb.checkout.messagePrice}
                  </span>
                  <span className="font-bold">
                    ${(targetCount * PRICE_PER_USER).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {tb.checkout.baseFee}
                  </span>
                  <span className="font-bold">${BASE_FEE.toFixed(2)}</span>
                </div>
              </div>

              <div className="h-px bg-border my-4" />

              <div className="flex justify-between items-baseline mb-5">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {tb.checkout.total}
                </span>
                <div className="text-right">
                  <div className="text-4xl font-black">
                    ${totalCost.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {tb.checkout.walletNote}
                  </div>
                </div>
              </div>

              {step === 1 ? (
                <button
                  disabled={
                    !selectedBotId || targetCount < 1 || activeUsersCount === 0
                  }
                  onClick={() => setStep(2)}
                  className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-primary-foreground flex items-center justify-center gap-2 transition-all"
                >
                  {tb.checkout.writeMessage}
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
                      {tb.checkout.launch}
                    </>
                  )}
                </button>
              )}

              <div className="mt-4 flex gap-2 text-xs text-muted-foreground leading-relaxed">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
                <span>{tb.checkout.info}</span>
              </div>

              {selectedBot && (
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    @{selectedBot.username} {tb.checkout.botStats}
                  </p>
                  {[
                    { label: `3 ${tb.daysSuffix}`, key: "activeUsers3d" },
                    { label: `7 ${tb.daysSuffix}`, key: "activeUsers7d" },
                    { label: `30 ${tb.daysSuffix}`, key: "activeUsers30d" },
                  ].map((s) => (
                    <div key={s.key} className="flex justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {s.label}
                      </span>
                      <span className="font-bold">
                        {(selectedBot[s.key] ?? 0).toLocaleString()}{" "}
                        {tb.usersSuffix}
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
