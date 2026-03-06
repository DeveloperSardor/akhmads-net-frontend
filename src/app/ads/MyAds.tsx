// src/pages/ads/MyAds.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  Eye,
  MousePointer,
  DollarSign,
  Play,
  Pause,
  Copy,
  Archive,
  Trash2,
  Heart,
  Clock,
  BarChart3,
  Send,
  Pencil,
  AlertTriangle,
  Radio,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAdStore } from "../../store/adStore";
import AdStatusBadge from "../../components/ad/AdStatusBadge";
import AdCardSkeleton from "../../components/ad/AdCardSkeleton";
import ScheduleModal from "../../components/ad/ScheduleModal";
import TestBotModal from "../../components/ad/TestBotModal";
import { useTranslations } from "../../hooks/useTranslations";
import adService from "../../services/ad.service";

type TabType = "all" | "active" | "saved" | "archived" | "scheduled";
type AdTypeFilter = "all" | "views" | "broadcast";
type StatusFilter =
  | "all"
  | "DRAFT"
  | "SUBMITTED"
  | "RUNNING"
  | "PAUSED"
  | "COMPLETED";

const MyAds = () => {
  const { lang } = useParams();
  const navigate = useNavigate();
  const t = useTranslations();
  const m = t.myAds;

  const {
    ads,
    isLoading,
    fetchMyAds,
    pauseAd,
    resumeAd,
    deleteAd,
    archiveAd,
    unarchiveAd,
    resetForm,
    toggleSaveAd,
    updateFormData,
    startEditingAd,
  } = useAdStore();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [adTypeFilter, setAdTypeFilter] = useState<AdTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [broadcastsLoading, setBroadcastsLoading] = useState(false);

  useEffect(() => {
    loadAds();
  }, [activeTab, statusFilter]);

  const loadAds = async () => {
    const params: any = {};
    if (statusFilter !== "all" && statusFilter !== "DRAFT") {
      params.status = statusFilter;
    }

    let fetchPromise: Promise<void>;
    if (activeTab === "saved") {
      fetchPromise = fetchMyAds({ saved: true });
    } else if (activeTab === "archived") {
      params.archived = true;
      fetchPromise = fetchMyAds(params);
    } else if (activeTab === "scheduled") {
      params.status = "SCHEDULED";
      fetchPromise = fetchMyAds(params);
    } else if (activeTab === "active") {
      params.status = "RUNNING";
      fetchPromise = fetchMyAds(params);
    } else {
      if (statusFilter === "DRAFT") params.status = "DRAFT";
      fetchPromise = fetchMyAds(params);
    }

    setBroadcastsLoading(true);
    try {
      const [_, bRes] = await Promise.all([
        fetchPromise,
        adService.getMyBroadcasts({ limit: 50 }),
      ]);
      const bList = Array.isArray(bRes?.data)
        ? bRes.data
        : bRes?.data?.broadcasts || [];
      setBroadcasts(bList);
    } catch {
      setBroadcasts([]);
    } finally {
      setBroadcastsLoading(false);
    }
  };

  const combinedList = [
    ...ads.map((ad) => ({ ...ad, _customType: "views" })),
    ...broadcasts.map((b) => ({ ...b, _customType: "broadcast" })),
  ]
    .filter((item) => {
      // Search filter
      if (
        searchQuery &&
        !item.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;

      // Type filter
      if (adTypeFilter !== "all" && item._customType !== adTypeFilter)
        return false;

      // Status mapping for Broadcasts in tabs
      if (item._customType === "broadcast") {
        if (activeTab === "active") return item.status === "RUNNING";
        if (activeTab === "scheduled")
          return ["PENDING", "APPROVED", "PENDING_REVIEW"].includes(
            item.status,
          );
        if (activeTab === "saved") return false; // Broadcasts don't have save yet
        if (activeTab === "archived") return false; // Broadcasts don't have archive yet
      }

      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );

  const handlePauseResume = async (ad: any) => {
    try {
      if (ad.status === "RUNNING") {
        await pauseAd(ad.id);
        toast.success(m?.toastPaused || "E'lon pauza qilindi");
      } else if (ad.status === "PAUSED") {
        await resumeAd(ad.id);
        toast.success(m?.toastResumed || "E'lon davom etilmoqda");
      }
      loadAds();
    } catch (error) {
      toast.error(m?.toastError || "Xatolik yuz berdi");
    }
  };

  const handleBroadcastPauseResume = async (broadcast: any) => {
    try {
      if (broadcast.status === "RUNNING") {
        await adService.pauseBroadcast(broadcast.id);
        toast.success(m?.toastPaused || "Rassilka pauza qilindi");
      } else if (broadcast.status === "PAUSED") {
        await adService.resumeBroadcast(broadcast.id);
        toast.success(m?.toastResumed || "Rassilka davom etilmoqda");
      }
      loadAds();
    } catch (error) {
      toast.error(m?.toastError || "Xatolik yuz berdi");
    }
  };

  const handleDuplicate = (ad: any) => {
    resetForm();
    updateFormData({
      contentType: ad.contentType || "TEXT",
      title: "",
      text: ad.text || "",
      buttons: ad.buttons
        ? typeof ad.buttons === "string"
          ? JSON.parse(ad.buttons)
          : ad.buttons
        : [],
      mediaUrl: ad.mediaUrl || undefined,
      targetImpressions: ad.targetImpressions || 1000,
      targeting: ad.targeting
        ? typeof ad.targeting === "string"
          ? JSON.parse(ad.targeting)
          : ad.targeting
        : { languages: ["uz", "ru", "en"], frequency: "unique" },
      cpmBid: ad.cpmBid ? parseFloat(ad.cpmBid) : undefined,
    });
    navigate(`/${lang}/launch-ad`);
  };

  const handleEdit = (ad: any) => {
    startEditingAd(ad);
    navigate(`/${lang}/launch-ad`);
  };

  const handleDelete = async (adId: string) => {
    if (
      confirm(m?.deleteConfirm ?? "Are you sure you want to delete this ad?")
    ) {
      await deleteAd(adId);
      loadAds();
    }
  };

  const handleArchive = async (adId: string) => {
    if (
      confirm(m?.archiveConfirm ?? "Are you sure you want to archive this ad?")
    ) {
      await archiveAd(adId);
      loadAds();
    }
  };

  const handleUnarchive = async (adId: string) => {
    if (
      confirm(
        m?.unarchiveConfirm ?? "Are you sure you want to unarchive this ad?",
      )
    ) {
      await unarchiveAd(adId);
      loadAds();
    }
  };

  const handleSchedule = (ad: any) => {
    setSelectedAd(ad);
    setShowScheduleModal(true);
  };

  const handleTest = (ad: any) => {
    setSelectedAd(ad);
    setShowTestModal(true);
  };

  const handleToggleSave = async (adId: string) => {
    await toggleSaveAd(adId);
    loadAds();
  };

  const tabs = [
    { id: "all", label: m?.tabs.all ?? "All Ads", icon: BarChart3 },
    { id: "active", label: m?.tabs.active ?? "Active", icon: TrendingUp },
    { id: "saved", label: m?.tabs.saved ?? "Saved", icon: Heart },
    { id: "scheduled", label: m?.tabs.scheduled ?? "Scheduled", icon: Clock },
    { id: "archived", label: m?.tabs.archived ?? "Archived", icon: Archive },
  ];

  const typeFilters = [
    { value: "all", label: m?.typeFilters?.all ?? "All Types" },
    { value: "views", label: m?.typeFilters?.views ?? "Views" },
    { value: "broadcast", label: m?.typeFilters?.broadcast ?? "Broadcasts" },
  ];

  const statusFilters = [
    { value: "all", label: m?.statusFilters.all ?? "All Status" },
    { value: "DRAFT", label: m?.statusFilters.draft ?? "Draft" },
    { value: "SUBMITTED", label: m?.statusFilters.submitted ?? "Pending" },
    { value: "RUNNING", label: m?.statusFilters.running ?? "Running" },
    { value: "PAUSED", label: m?.statusFilters.paused ?? "Paused" },
    { value: "COMPLETED", label: m?.statusFilters.completed ?? "Completed" },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6">
      <div className="max-w-7xl mx-auto mt-24 sm:mt-32">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              {m?.pageTitle}
            </h1>
            <p className="text-sm text-muted-foreground">{m?.pageSubtitle}</p>
          </div>
          <button
            onClick={() => navigate(`/${lang}/launch-ad`)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all shadow-lg shadow-primary/25 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            {m?.launchNew}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-all text-sm ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-card/80 border border-border"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={m?.searchPlaceholder}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Radio className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                value={adTypeFilter}
                onChange={(e) =>
                  setAdTypeFilter(e.target.value as AdTypeFilter)
                }
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 bg-card border border-border rounded-lg text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer min-w-[140px]"
              >
                {typeFilters.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 bg-card border border-border rounded-lg text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer min-w-[140px]"
              >
                {statusFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading || broadcastsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <AdCardSkeleton key={i} />
            ))}
          </div>
        ) : combinedList.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {m?.noAdsFound}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? m?.adjustSearch : m?.createFirst}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {combinedList.map((item) =>
              item._customType === "views" ? (
                <AdCard
                  key={item.id}
                  ad={item}
                  actions={m?.actions}
                  progressLabel={m?.progress}
                  onView={() => navigate(`/${lang}/ads/${item.id}`)}
                  onPauseResume={() => handlePauseResume(item)}
                  onDuplicate={() => handleDuplicate(item)}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item.id)}
                  onSchedule={() => handleSchedule(item)}
                  onTest={() => handleTest(item)}
                  onArchive={() => handleArchive(item.id)}
                  onUnarchive={() => handleUnarchive(item.id)}
                  onToggleSave={handleToggleSave}
                />
              ) : (
                <BroadcastCard
                  key={item.id}
                  broadcast={item}
                  lang={lang}
                  onNew={() => navigate(`/${lang}/broadcasts/new`)}
                  onPauseResume={() => handleBroadcastPauseResume(item)}
                />
              ),
            )}
          </div>
        )}
      </div>

      {showScheduleModal && selectedAd && (
        <ScheduleModal
          ad={selectedAd}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedAd(null);
            loadAds();
          }}
        />
      )}

      {showTestModal && selectedAd && (
        <TestBotModal
          ad={selectedAd}
          onClose={() => {
            setShowTestModal(false);
            setSelectedAd(null);
          }}
        />
      )}
    </div>
  );
};

// ── Broadcasts status config ──────────────────────────────────────────────────
const getBroadcastStatusInfo = (status: string, statusTrans: any) => {
  const map: Record<string, { label: string; color: string; dot: string }> = {
    PENDING: {
      label: statusTrans?.PENDING ?? "Pending",
      color: "text-amber-400 bg-amber-400/10 border-amber-400/25",
      dot: "bg-amber-400",
    },
    PENDING_REVIEW: {
      label: statusTrans?.PENDING ?? "Pending",
      color: "text-amber-400 bg-amber-400/10 border-amber-400/25",
      dot: "bg-amber-400",
    },
    APPROVED: {
      label: statusTrans?.APPROVED ?? "Approved",
      color: "text-violet-400 bg-violet-400/10 border-violet-400/25",
      dot: "bg-violet-400",
    },
    RUNNING: {
      label: statusTrans?.RUNNING ?? "Running",
      color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
      dot: "bg-cyan-400 animate-pulse",
    },
    COMPLETED: {
      label: statusTrans?.COMPLETED ?? "Completed",
      color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
      dot: "bg-emerald-400",
    },
    PAUSED: {
      label: statusTrans?.PAUSED ?? "Paused",
      color: "text-slate-400 bg-slate-400/10 border-slate-400/25",
      dot: "bg-slate-400",
    },
    FAILED: {
      label: statusTrans?.FAILED ?? "Failed",
      color: "text-red-400 bg-red-400/10 border-red-400/25",
      dot: "bg-red-400",
    },
  };
  return (
    map[status] ?? {
      label: status,
      color: "text-slate-400 bg-slate-400/10 border-slate-400/25",
      dot: "bg-slate-400",
    }
  );
};

const BroadcastCard = ({
  broadcast: b,
  lang,
  onPauseResume,
}: {
  broadcast: any;
  onNew: () => void;
  onPauseResume?: () => void;
  lang?: string;
}) => {
  const t = useTranslations();
  const navigate = useNavigate();
  const bTrans = t.myAds.broadcasts;
  const st = getBroadcastStatusInfo(b.status, bTrans.status);
  const sentPct =
    b.targetCount > 0
      ? Math.min(100, Math.round(((b.sentCount ?? 0) / b.targetCount) * 100))
      : 0;
  const isActive = b.status === "RUNNING";
  const isPaused = b.status === "PAUSED";
  const isDone = b.status === "COMPLETED";

  return (
    <div
      className={`relative bg-card border rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 ${
        isActive
          ? "border-cyan-500/30 shadow-sm shadow-cyan-500/10"
          : "border-border hover:border-primary/30"
      }`}
    >
      {/* Top accent bar */}
      <div
        className={`h-1 w-full ${
          isActive
            ? "bg-gradient-to-r from-cyan-500 to-indigo-500"
            : isDone
              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
              : b.status === "FAILED"
                ? "bg-gradient-to-r from-red-500 to-rose-500"
                : "bg-gradient-to-r from-primary/60 to-indigo-500/60"
        }`}
      />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug mb-1.5">
              {b.text?.slice(0, 90) || "—"}
            </p>
            {b.bot?.username && (
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Radio className="w-2.5 h-2.5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  @{b.bot.username}
                </span>
              </div>
            )}
          </div>
          <span
            className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${st.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {st.label}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-background/60 border border-border/50 rounded-xl p-3 text-center">
            <div className="text-base font-black text-foreground tabular-nums">
              {(b.targetCount ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">
              {bTrans.target}
            </div>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center">
            <div className="text-base font-black text-emerald-400 tabular-nums">
              {(b.sentCount ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">
              {bTrans.sent}
            </div>
          </div>
          <div
            className={`rounded-xl p-3 text-center border ${
              (b.failedCount ?? 0) > 0
                ? "bg-red-500/5 border-red-500/20"
                : "bg-background/60 border-border/50"
            }`}
          >
            <div
              className={`text-base font-black tabular-nums ${(b.failedCount ?? 0) > 0 ? "text-red-400" : "text-muted-foreground"}`}
            >
              {(b.failedCount ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">
              {bTrans.failed}
            </div>
          </div>
        </div>

        {/* Progress bar (RUNNING, PAUSED or COMPLETED) */}
        {(isActive || isPaused || isDone) && (
          <div className="mb-4">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-muted-foreground font-semibold">
                {bTrans.progress}
              </span>
              <span
                className={`font-bold ${isDone ? "text-emerald-400" : isPaused ? "text-slate-400" : "text-cyan-400"}`}
              >
                {sentPct}%
              </span>
            </div>
            <div className="h-2 bg-border/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isDone
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : isPaused
                      ? "bg-gradient-to-r from-slate-500 to-slate-400"
                      : "bg-gradient-to-r from-cyan-500 to-indigo-500"
                }`}
                style={{ width: `${sentPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-primary/70" />
            <span className="text-sm font-bold text-foreground">
              ${parseFloat(b.totalCost ?? "0").toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">{bTrans.cost}</span>
          </div>
          <div className="flex items-center gap-2">
            {(isActive || isPaused) && onPauseResume && (
              <button
                onClick={onPauseResume}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20"
                    : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20"
                }`}
              >
                {isActive ? (
                  <><Pause className="w-3 h-3" />{bTrans.pause ?? "Pauza"}</>
                ) : (
                  <><Play className="w-3 h-3" />{bTrans.resume ?? "Davom"}</>
                )}
              </button>
            )}
            <button
              onClick={() => navigate(`/${lang}/launch-ad`)}
              className="p-1.5 hover:bg-muted rounded-lg transition-all"
              title="Duplicate"
            >
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdCard = ({
  ad,
  actions,
  progressLabel,
  onView,
  onPauseResume,
  onDuplicate,
  onEdit,
  onDelete,
  onSchedule,
  onTest,
  onArchive,
  onUnarchive,
  onToggleSave,
}: any) => {
  const t = useTranslations();
  const m = t.myAds;
  const progress =
    ad.targetImpressions > 0
      ? (ad.deliveredImpressions / ad.targetImpressions) * 100
      : 0;
  const [isSaved, setIsSaved] = useState(ad.isSaved || false);

  useEffect(() => {
    setIsSaved(ad.isSaved || false);
  }, [ad.isSaved]);

  const handleToggleSave = async () => {
    if (onToggleSave) {
      setIsSaved(!isSaved);
      try {
        await onToggleSave(ad.id);
      } catch {
        setIsSaved(isSaved);
      }
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:border-primary/50 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
            {ad.text?.slice(0, 60)}
          </h3>
          <AdStatusBadge status={ad.status} />
        </div>

        <div className="flex items-center gap-2 ml-3">
          <button
            onClick={handleToggleSave}
            className={`p-2.5 rounded-xl transition-all duration-300 transform active:scale-90 ${
              isSaved
                ? "bg-red-500 text-white shadow-lg shadow-red-500/40 rotate-[360deg]"
                : "bg-card hover:bg-muted border border-border text-muted-foreground hover:text-red-500"
            }`}
            title={
              isSaved
                ? (actions?.unsave ?? "Unsave")
                : (actions?.save ?? "Save")
            }
          >
            <Heart
              className={`w-5 h-5 transition-all ${isSaved ? "fill-white text-white" : ""}`}
            />
          </button>

          {ad.mediaUrl && (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
              <img
                src={ad.mediaUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {ad.rejectionReason &&
        (ad.status === "DRAFT" || ad.status === "REJECTED") && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
              <span className="font-semibold block mb-0.5">
                {ad.status === "REJECTED"
                  ? m?.rejectedReason || "Rad etildi:"
                  : m?.editRequested || "Tahrirlash so'raldi:"}
              </span>
              {String(ad.rejectionReason).replace(/^Edit requested:\s*/i, "")}
            </div>
          </div>
        )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Eye className="w-4 h-4 text-blue-400" />
          <span className="text-muted-foreground">
            {ad.deliveredImpressions?.toLocaleString() || 0} /{" "}
            {ad.targetImpressions?.toLocaleString() || 0}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MousePointer className="w-4 h-4 text-green-400" />
          <span className="text-muted-foreground">
            {ad.clicks || 0} ({ad.ctr || 0}%)
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-yellow-400" />
          <span className="text-muted-foreground">
            ${parseFloat(ad.totalCost || 0).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span className="text-muted-foreground">
            ${parseFloat(ad.remainingBudget || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {ad.status === "RUNNING" && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{progressLabel ?? "Progress"}</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-pink-500 transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-all"
        >
          <BarChart3 className="w-4 h-4" />
          {actions?.view ?? "View"}
        </button>

        {(ad.status === "RUNNING" || ad.status === "PAUSED") && (
          <button
            onClick={onPauseResume}
            className="px-3 py-2 bg-card hover:bg-muted border border-border rounded-lg transition-all"
            title={
              ad.status === "RUNNING"
                ? (actions?.pause ?? "Pause")
                : (actions?.resume ?? "Resume")
            }
          >
            {ad.status === "RUNNING" ? (
              <Pause className="w-4 h-4 text-yellow-400" />
            ) : (
              <Play className="w-4 h-4 text-green-400" />
            )}
          </button>
        )}

        {(ad.status === "DRAFT" || ad.status === "REJECTED") && (
          <button
            onClick={onEdit}
            className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all"
            title={actions?.edit ?? "Tahrirlash"}
          >
            <Pencil className="w-4 h-4 text-amber-500" />
          </button>
        )}

        {ad.status === "DRAFT" && (
          <button
            onClick={onSchedule}
            className="px-3 py-2 bg-card hover:bg-muted border border-border rounded-lg transition-all"
            title={actions?.schedule ?? "Schedule"}
          >
            <Clock className="w-4 h-4 text-blue-400" />
          </button>
        )}

        {(ad.status === "DRAFT" || ad.status === "APPROVED") && (
          <button
            onClick={onTest}
            className="px-3 py-2 bg-card hover:bg-muted border border-border rounded-lg transition-all"
            title={actions?.test ?? "Test"}
          >
            <Send className="w-4 h-4 text-purple-400" />
          </button>
        )}

        <button
          onClick={onDuplicate}
          className="px-3 py-2 bg-card hover:bg-muted border border-border rounded-lg transition-all"
          title={actions?.duplicate ?? "Duplicate"}
        >
          <Copy className="w-4 h-4 text-muted-foreground" />
        </button>

        {["DRAFT", "REJECTED", "COMPLETED"].includes(ad.status) && (
          <button
            onClick={onDelete}
            className="px-3 py-2 bg-card hover:bg-destructive/10 border border-border hover:border-destructive/50 rounded-lg transition-all"
            title={actions?.delete ?? "Delete"}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        )}

        {!["DRAFT", "PENDING_REVIEW", "SUBMITTED"].includes(ad.status) &&
          !ad.isArchived && (
            <button
              onClick={onArchive}
              className="px-3 py-2 bg-card hover:bg-muted border border-border rounded-lg transition-all"
              title={actions?.archive ?? "Archive"}
            >
              <Archive className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

        {ad.isArchived && (
          <button
            onClick={onUnarchive}
            className="px-3 py-2 bg-card hover:bg-primary/20 border border-border rounded-lg transition-all text-primary"
            title={actions?.unarchive ?? "Unarchive"}
          >
            <Archive className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MyAds;
