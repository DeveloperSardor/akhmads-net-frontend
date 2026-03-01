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
} from "lucide-react";
import toast from "react-hot-toast";
import { useAdStore } from "../../store/adStore";
import AdStatusBadge from "../../components/ad/AdStatusBadge";
import AdCardSkeleton from "../../components/ad/AdCardSkeleton";
import ScheduleModal from "../../components/ad/ScheduleModal";
import TestBotModal from "../../components/ad/TestBotModal";
import { useTranslations } from "../../hooks/useTranslations";

type TabType = "all" | "active" | "saved" | "archived" | "scheduled";
type StatusFilter = "all" | "DRAFT" | "SUBMITTED" | "RUNNING" | "PAUSED" | "COMPLETED";

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
    resetForm,
    toggleSaveAd,
    updateFormData,
    startEditingAd,
  } = useAdStore();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any>(null);

  useEffect(() => {
    loadAds();
  }, [activeTab, statusFilter]);

  const loadAds = async () => {
    const params: any = {};

    if (statusFilter !== "all") {
      params.status = statusFilter;
    }

    if (activeTab === "saved") {
      await fetchMyAds({ saved: true });
    } else if (activeTab === "archived") {
      params.archived = true;
      await fetchMyAds(params);
    } else if (activeTab === "scheduled") {
      params.status = "SCHEDULED";
      await fetchMyAds(params);
    } else if (activeTab === "active") {
      params.status = "RUNNING";
      await fetchMyAds(params);
    } else {
      await fetchMyAds(params);
    }
  };

  const filteredAds = ads.filter((ad) => {
    if (searchQuery) {
      return (
        ad.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

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

  const handleDuplicate = (ad: any) => {
    resetForm();
    updateFormData({
      contentType: ad.contentType || "TEXT",
      title: '',
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
    if (confirm(m?.deleteConfirm ?? "Are you sure you want to delete this ad?")) {
      await deleteAd(adId);
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
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-all text-sm ${isActive
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

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
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

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full sm:w-auto pl-9 sm:pl-10 pr-8 py-2.5 bg-card border border-border rounded-lg text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
            >
              {statusFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <AdCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredAds.length === 0 ? (
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
            {!searchQuery && (
              <button
                onClick={() => navigate(`/${lang}/launch-ad`)}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-all"
              >
                {m?.launchNew}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                actions={m?.actions}
                progressLabel={m?.progress}
                onView={() => navigate(`/${lang}/ads/${ad.id}`)}
                onPauseResume={() => handlePauseResume(ad)}
                onDuplicate={() => handleDuplicate(ad)}
                onEdit={() => handleEdit(ad)}
                onDelete={() => handleDelete(ad.id)}
                onSchedule={() => handleSchedule(ad)}
                onTest={() => handleTest(ad)}
                onToggleSave={handleToggleSave}
              />
            ))}
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
  onToggleSave,
}: any) => {
  const t = useTranslations();
  const m = t.myAds;
  const progress = (ad.deliveredImpressions / ad.targetImpressions) * 100;
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
            className={`p-2 rounded-lg transition-all ${isSaved
              ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
              : "bg-card hover:bg-muted border border-border text-muted-foreground hover:text-red-500"
              }`}
            title={isSaved ? (actions?.unsave ?? "Unsave") : (actions?.save ?? "Save")}
          >
            <Heart className={`w-5 h-5 transition-all ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
          </button>

          {ad.mediaUrl && (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
              <img src={ad.mediaUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {ad.rejectionReason && (ad.status === "DRAFT" || ad.status === "REJECTED") && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
            <span className="font-semibold block mb-0.5">
              {ad.status === "REJECTED" ? m?.rejectedReason || "Rad etildi:" : m?.editRequested || "Tahrirlash so'raldi:"}
            </span>
            {String(ad.rejectionReason).replace(/^Edit requested:\s*/i, "")}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Eye className="w-4 h-4 text-blue-400" />
          <span className="text-muted-foreground">
            {ad.deliveredImpressions?.toLocaleString() || 0} / {ad.targetImpressions?.toLocaleString() || 0}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MousePointer className="w-4 h-4 text-green-400" />
          <span className="text-muted-foreground">{ad.clicks || 0} ({ad.ctr || 0}%)</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-yellow-400" />
          <span className="text-muted-foreground">${parseFloat(ad.totalCost || 0).toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span className="text-muted-foreground">${parseFloat(ad.remainingBudget || 0).toFixed(2)}</span>
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
            title={ad.status === "RUNNING" ? (actions?.pause ?? "Pause") : (actions?.resume ?? "Resume")}
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
      </div>
    </div>
  );
};

export default MyAds;