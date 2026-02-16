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
} from "lucide-react";
import { useAdStore } from "../../store/adStore";
import AdStatusBadge from "../../components/ad/AdStatusBadge";
import AdCardSkeleton from "../../components/ad/AdCardSkeleton";
import ScheduleModal from "../../components/ad/ScheduleModal";
import TestBotModal from "../../components/ad/TestBotModal";

type TabType = "all" | "active" | "saved" | "archived" | "scheduled";
type StatusFilter = "all" | "DRAFT" | "SUBMITTED" | "RUNNING" | "PAUSED" | "COMPLETED";

const MyAds = () => {
  const { lang } = useParams();
  const navigate = useNavigate();
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
      return ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             ad.text.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handlePauseResume = async (ad: any) => {
    if (ad.status === "RUNNING") {
      await pauseAd(ad.id);
    } else if (ad.status === "PAUSED") {
      await resumeAd(ad.id);
    }
    loadAds();
  };

  // ✅ FIXED - Navigate to launch-ad with pre-filled form
  const handleDuplicate = (ad: any) => {
  // Reset form first
  resetForm();
  
  // Pre-fill with ad data
  updateFormData({
    contentType: ad.contentType || 'TEXT',
    title: `${ad.title} (Copy)`, // ✅ Add "(Copy)" to title
    text: ad.text || '',
    buttons: ad.buttons ? (typeof ad.buttons === 'string' ? JSON.parse(ad.buttons) : ad.buttons) : [],
    mediaUrl: ad.mediaUrl || undefined,
    targetImpressions: ad.targetImpressions || 1000,
    targeting: ad.targeting ? (typeof ad.targeting === 'string' ? JSON.parse(ad.targeting) : ad.targeting) : {
      languages: ['uz', 'ru', 'en'],
      frequency: 'unique',
    },
    cpmBid: ad.cpmBid ? parseFloat(ad.cpmBid) : undefined,
  });
  
  // Navigate to launch-ad
  navigate(`/${lang}/launch-ad`);
};

  const handleDelete = async (adId: string) => {
    if (confirm("Are you sure you want to delete this ad?")) {
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
    { id: "all", label: "All Ads", icon: BarChart3 },
    { id: "active", label: "Active", icon: TrendingUp },
    { id: "saved", label: "Saved", icon: Heart },
    { id: "scheduled", label: "Scheduled", icon: Clock },
    { id: "archived", label: "Archived", icon: Archive },
  ];

  const statusFilters = [
    { value: "all", label: "All Status" },
    { value: "DRAFT", label: "Draft" },
    { value: "SUBMITTED", label: "Pending" },
    { value: "RUNNING", label: "Running" },
    { value: "PAUSED", label: "Paused" },
    { value: "COMPLETED", label: "Completed" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto mt-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Advertisements</h1>
            <p className="text-muted-foreground">Manage and track your ad campaigns</p>
          </div>
          <button
            onClick={() => navigate(`/${lang}/launch-ad`)}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all shadow-lg shadow-primary/25"
          >
            <Plus className="w-5 h-5" />
            Launch New Ad
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all ${
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

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ads..."
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="pl-10 pr-8 py-2.5 bg-card border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
            >
              {statusFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

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
            <h3 className="text-xl font-semibold text-foreground mb-2">No ads found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? "Try adjusting your search" : "Create your first ad campaign"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate(`/${lang}/launch-ad`)}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-all"
              >
                Launch New Ad
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                onView={() => navigate(`/${lang}/ads/${ad.id}`)}
                onPauseResume={() => handlePauseResume(ad)}
                onDuplicate={() => handleDuplicate(ad)} 
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

const AdCard = ({ ad, onView, onPauseResume, onDuplicate, onDelete, onSchedule, onTest, onToggleSave }: any) => {
  const progress = (ad.deliveredImpressions / ad.targetImpressions) * 100;
  const [isSaved, setIsSaved] = useState(ad.isSaved || false);

  // ✅ UPDATE STATE WHEN ad.isSaved CHANGES
  useEffect(() => {
    setIsSaved(ad.isSaved || false);
  }, [ad.isSaved]);

  const handleToggleSave = async () => {
    if (onToggleSave) {
      // ✅ OPTIMISTIC UPDATE
      setIsSaved(!isSaved);
      
      try {
        await onToggleSave(ad.id);
      } catch (error) {
        // Revert on error
        setIsSaved(isSaved);
      }
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
            {ad.title}
          </h3>
          <AdStatusBadge status={ad.status} />
        </div>
        
        {/* ✅ RED HEART WHEN SAVED */}
        <div className="flex items-center gap-2 ml-3">
          <button
            onClick={handleToggleSave}
            className={`p-2 rounded-lg transition-all ${
              isSaved
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                : "bg-card hover:bg-muted border border-border text-muted-foreground hover:text-red-500"
            }`}
            title={isSaved ? "Unsave" : "Save"}
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
            <span>Progress</span>
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
          View
        </button>

        {(ad.status === "RUNNING" || ad.status === "PAUSED") && (
          <button
            onClick={onPauseResume}
            className="px-3 py-2 bg-card hover:bg-muted border border-border rounded-lg transition-all"
            title={ad.status === "RUNNING" ? "Pause" : "Resume"}
          >
            {ad.status === "RUNNING" ? (
              <Pause className="w-4 h-4 text-yellow-400" />
            ) : (
              <Play className="w-4 h-4 text-green-400" />
            )}
          </button>
        )}

        {ad.status === "DRAFT" && (
          <button
            onClick={onSchedule}
            className="px-3 py-2 bg-card hover:bg-muted border border-border rounded-lg transition-all"
            title="Schedule"
          >
            <Clock className="w-4 h-4 text-blue-400" />
          </button>
        )}

        {(ad.status === "DRAFT" || ad.status === "APPROVED") && (
          <button
            onClick={onTest}
            className="px-3 py-2 bg-card hover:bg-muted border border-border rounded-lg transition-all"
            title="Test"
          >
            <Send className="w-4 h-4 text-purple-400" />
          </button>
        )}

        <button
          onClick={onDuplicate}
          className="px-3 py-2 bg-card hover:bg-muted border border-border rounded-lg transition-all"
          title="Duplicate"
        >
          <Copy className="w-4 h-4 text-muted-foreground" />
        </button>

        {["DRAFT", "REJECTED", "COMPLETED"].includes(ad.status) && (
          <button
            onClick={onDelete}
            className="px-3 py-2 bg-card hover:bg-destructive/10 border border-border hover:border-destructive/50 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MyAds;