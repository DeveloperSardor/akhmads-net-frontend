import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  Calendar,
  Edit,
  LogOut,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  Copy,
  Check,
  Users,
  MousePointer2,
  Heart,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUserStore } from "../../store/userStore";
import { useTranslations } from "../../hooks/useTranslations";

const Profile = () => {
  const navigate = useNavigate();
  const t = useTranslations();
  const p = t.profile;

  const [activeTab, setActiveTab] = useState<"my-ads" | "my-bots">("my-ads");
  const [showEditModal, setShowEditModal] = useState(false);
  const [copiedTelegramId, setCopiedTelegramId] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "" });
  const [selectedAdForModal, setSelectedAdForModal] = useState<any>(null);
  const [selectedBotForModal, setSelectedBotForModal] = useState<any>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showBotModal, setShowBotModal] = useState(false);
  const { logout } = useAuthStore();

  const {
    profile,
    wallet,
    stats,
    ads,
    bots,
    revenueData,
    ctrData,
    isLoading,
    error,
    fetchProfile,
    fetchAds,
    fetchBots,
    fetchAnalytics,
    deleteAd,
    deleteBot,
    updateProfile,
    clearError,
  } = useUserStore();

  useEffect(() => {
    fetchProfile();
    fetchAds({ limit: 10 });
    fetchBots({ limit: 10 });
    fetchAnalytics(7, "advertiser");
  }, []);

  useEffect(() => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
      });
    }
  }, [profile]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDeleteAd = async (adId: string) => {
    if (
      window.confirm(
        p?.deleteAdConfirm ?? "Are you sure you want to delete this ad?",
      )
    ) {
      await deleteAd(adId);
    }
  };

  const handleDeleteBot = async (botId: string) => {
    if (
      window.confirm(
        p?.deleteBotConfirm ?? "Are you sure you want to delete this bot?",
      )
    ) {
      await deleteBot(botId);
    }
  };

  const handleSaveProfile = async () => {
    await updateProfile(editForm);
    setShowEditModal(false);
  };

  const handleCopyTelegramId = async () => {
    if (profile?.telegramId) {
      await navigator.clipboard.writeText(profile.telegramId);
      setCopiedTelegramId(true);
      setTimeout(() => setCopiedTelegramId(false), 2000);
    }
  };

  const avatarUrl =
    profile?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.firstName || "User")}&background=8b5cf6&color=fff&size=200&bold=true`;

  const formatCurrency = (amount?: number | string | null): string => {
    const numAmount = typeof amount === "number" ? amount : Number(amount) || 0;
    return `$${numAmount.toFixed(2)}`;
  };

  const formatNumber = (num?: number | string | null): string => {
    const numValue = typeof num === "number" ? num : Number(num) || 0;
    return numValue.toLocaleString();
  };

  const formatPercent = (num?: number | string | null): string => {
    const numValue = typeof num === "number" ? num : Number(num) || 0;
    return `${numValue.toFixed(1)}%`;
  };

  const getAdStatusStyles = (status: string) => {
    switch (status) {
      case "RUNNING":
        return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "PAUSED":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "APPROVED":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "DRAFT":
        return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
      case "SUBMITTED":
      case "PENDING_REVIEW":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "COMPLETED":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      case "ARCHIVED":
        return "bg-foreground/5 text-foreground/40 border border-white/10";
      case "SCHEDULED":
        return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
    }
  };

  const getBotStatusStyles = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "BANNED":
        return "bg-red-900/20 text-red-500 border border-red-900/30";
      case "PAUSED":
        return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
    }
  };

  const calculateAdSpent = (ad: any): number => {
    if (ad.spent !== undefined) return Number(ad.spent);
    const total = Number(ad.totalCost) || 0;
    const remaining = Number(ad.remainingBudget) || 0;
    return Math.max(0, total - remaining);
  };

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-destructive hover:text-destructive/80 ml-2 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Back Button & Title */}
        <div className="mt-16 pt-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition text-xs mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {p?.backToHome}
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">{p?.pageTitle}</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 mt-5 mb-4 shadow-sm">
          {/* Profile header — stack on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
            {/* Avatar + info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border border-border shrink-0">
                <img
                  src={avatarUrl}
                  alt={profile?.firstName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.firstName || "User")}&background=8b5cf6&color=fff&size=200&bold=true`;
                  }}
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold mb-0.5 truncate">
                  {profile?.firstName} {profile?.lastName}
                </h2>
                <p className="text-xs text-muted-foreground mb-1.5 truncate">
                  @{profile?.username || "user"}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground/80 truncate">
                    ID: {profile?.telegramId}
                  </span>
                  <button
                    onClick={handleCopyTelegramId}
                    className="p-1 hover:bg-accent rounded transition shrink-0"
                    title={p?.copyTelegramId}
                  >
                    {copiedTelegramId ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent/80 border border-border rounded-lg transition text-sm text-foreground"
              >
                <Edit className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{p?.edit}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive rounded-lg transition text-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{p?.logOut}</span>
              </button>
            </div>
          </div>

          {/* Financial Stats — always 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/10 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
                </div>
                <span className="text-xs text-muted-foreground truncate">
                  {p?.totalSpent}
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-bold">
                {formatCurrency(stats?.totalSpent ?? wallet?.totalSpent)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/10 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                  <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500" />
                </div>
                <span className="text-xs text-muted-foreground truncate">
                  {p?.totalEarned}
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-bold">
                {formatCurrency(stats?.totalEarned ?? wallet?.totalEarnings)}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics — 1 col mobile, 3 col sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Eye className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">
                {p?.impressions}
              </span>
            </div>
            <p className="text-xl font-bold mb-0.5">
              {formatNumber(stats?.totalImpressions)}
            </p>
            <p className="text-xs text-muted-foreground/60">{p?.totalViews}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MousePointerClick className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">{p?.ctr}</span>
            </div>
            <p className="text-xl font-bold mb-0.5">
              {formatPercent(stats?.averageCtr)}
            </p>
            <p className="text-xs text-muted-foreground/60">{p?.avgCtr}</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">
                {p?.conversions}
              </span>
            </div>
            <p className="text-xl font-bold mb-0.5">
              {formatCurrency(stats?.totalClicks)}
            </p>
            <p className="text-xs text-muted-foreground/60">
              {p?.totalConversions}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
          {/* Revenue Trend */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">{p?.revenueTrend}</h3>
              <div className="flex items-center gap-2">
                <button className="p-1.5 bg-accent hover:bg-accent/80 border border-border rounded-lg transition">
                  <Calendar className="w-3.5 h-3.5" />
                </button>
                <button className="px-2.5 py-1.5 bg-accent hover:bg-accent/80 border border-border rounded-lg transition text-xs">
                  {p?.exportCsv}
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="date"
                  stroke="currentColor"
                  opacity={0.5}
                  fontSize={10}
                />
                <YAxis stroke="currentColor" opacity={0.5} fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "var(--foreground)",
                  }}
                  cursor={{ fill: "currentColor", opacity: 0.05 }}
                />
                <Bar dataKey="earnings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CTR Indicator */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">{p?.ctrIndicator}</h3>
              <div className="flex items-center gap-2">
                <button className="p-1.5 bg-accent hover:bg-accent/80 border border-border rounded-lg transition">
                  <Calendar className="w-3.5 h-3.5" />
                </button>
                <button className="px-2.5 py-1.5 bg-accent hover:bg-accent/80 border border-border rounded-lg transition text-xs">
                  {p?.exportCsv}
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={ctrData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="date"
                  stroke="currentColor"
                  opacity={0.5}
                  fontSize={10}
                />
                <YAxis stroke="currentColor" opacity={0.5} fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "var(--foreground)",
                  }}
                  cursor={{ stroke: "currentColor", opacity: 0.2 }}
                />
                <Line
                  type="monotone"
                  dataKey="ctr"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Information Table */}
        <div className="bg-card border border-white/10 rounded-lg p-4">
          {/* Tab header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="text-sm font-semibold">{p?.information}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("my-ads")}
                className={`px-3 py-1.5 rounded-lg font-medium transition text-sm ${activeTab === "my-ads" ? "bg-purple-600 text-foreground" : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"}`}
              >
                {p?.myAds}
              </button>
              <button
                onClick={() => setActiveTab("my-bots")}
                className={`px-3 py-1.5 rounded-lg font-medium transition text-sm ${activeTab === "my-bots" ? "bg-purple-600 text-foreground" : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"}`}
              >
                {p?.myBots}
              </button>
            </div>
          </div>

          {/* Ads Table */}
          {activeTab === "my-ads" && (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-3 font-medium text-foreground/60 text-xs">
                        {p?.adsTableHeaders.title}
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-foreground/60 text-xs">
                        {p?.adsTableHeaders.impressions}
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-foreground/60 text-xs">
                        {p?.adsTableHeaders.ctr}
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-foreground/60 text-xs">
                        {p?.adsTableHeaders.conversions}
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-foreground/60 text-xs">
                        {p?.adsTableHeaders.spent}
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-foreground/60 text-xs">
                        {p?.adsTableHeaders.status}
                      </th>
                      <th className="text-right py-3 px-3 font-medium text-foreground/60 text-xs">
                        {p?.adsTableHeaders.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ads.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-10 text-foreground/40 text-sm"
                        >
                          {p?.noAds}
                        </td>
                      </tr>
                    ) : (
                      ads.map((ad) => (
                        <tr
                          key={ad.id}
                          className="border-b border-white/5 hover:bg-foreground/[0.02] transition"
                        >
                          <td className="py-3 px-3 max-w-[160px] truncate">
                            <div className="flex items-center gap-2">
                              {ad.isSaved && (
                                <Heart className="w-3 h-3 text-red-500 fill-red-500 shrink-0" />
                              )}
                              <span>{ad.title || ad.text?.slice(0, 40)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {formatNumber(
                              ad.deliveredImpressions ?? ad.impressions,
                            )}
                          </td>
                          <td className="py-3 px-3">{formatPercent(ad.ctr)}</td>
                          <td className="py-3 px-3">
                            {formatNumber(ad.conversions)}
                          </td>
                          <td className="py-3 px-3 text-red-400">
                            {formatCurrency(calculateAdSpent(ad))}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAdStatusStyles(ad.status)}`}
                            >
                              {p?.statusText?.[ad.status] ||
                                t.adStatus[ad.status] ||
                                ad.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setSelectedAdForModal(ad);
                                  setShowAdModal(true);
                                }}
                                className="p-1.5 hover:bg-foreground/10 rounded-lg transition"
                                title={t.myAds?.actions?.view || "View"}
                              >
                                <Eye className="w-3.5 h-3.5 text-purple-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteAd(ad.id)}
                                className="p-1.5 hover:bg-foreground/10 rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="sm:hidden space-y-3">
                {ads.length === 0 ? (
                  <p className="text-center py-10 text-foreground/40 text-sm">
                    {p?.noAds}
                  </p>
                ) : (
                  ads.map((ad) => (
                    <div
                      key={ad.id}
                      className="bg-foreground/[0.03] border border-white/10 rounded-xl p-3"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium truncate">
                          {ad.title || ad.text?.slice(0, 60)}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getAdStatusStyles(ad.status)}`}
                        >
                          {p?.statusText?.[ad.status] ||
                            t.adStatus[ad.status] ||
                            ad.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-foreground/50 mb-3">
                        <div>
                          <p className="text-foreground/30 mb-0.5">
                            {p?.adsTableHeaders.impressions}
                          </p>
                          <p className="text-foreground/70">
                            {formatNumber(
                              ad.deliveredImpressions ?? ad.impressions,
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-foreground/30 mb-0.5">
                            {p?.adsTableHeaders.conversions}
                          </p>
                          <p className="text-foreground/70">
                            {formatNumber(ad.conversions)}
                          </p>
                        </div>
                        <div>
                          <p className="text-foreground/30 mb-0.5">
                            {p?.adsTableHeaders.spent}
                          </p>
                          <p className="text-red-400">
                            {formatCurrency(calculateAdSpent(ad))}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => {
                            setSelectedAdForModal(ad);
                            setShowAdModal(true);
                          }}
                          className="p-1.5 hover:bg-foreground/10 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4 text-purple-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="p-1.5 hover:bg-foreground/10 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Bots Table */}
          {activeTab === "my-bots" && (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-3 font-medium text-foreground/60 text-xs">
                        {p?.botsTableHeaders.name}
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-foreground/60 text-xs">
                        {p?.botsTableHeaders.subscribers}
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-foreground/60 text-xs">
                        {p?.botsTableHeaders.impressions}
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-foreground/60 text-xs">
                        {p?.botsTableHeaders.earnings}
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-foreground/60 text-xs">
                        {p?.botsTableHeaders.status}
                      </th>
                      <th className="text-right py-3 px-3 font-medium text-foreground/60 text-xs">
                        {p?.botsTableHeaders.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bots.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-10 text-foreground/40 text-sm"
                        >
                          {p?.noBots}
                        </td>
                      </tr>
                    ) : (
                      bots.map((bot) => (
                        <tr
                          key={bot.id}
                          className="border-b border-white/5 hover:bg-foreground/[0.02] transition"
                        >
                          <td className="py-3 px-3">@{bot.username}</td>
                          <td className="py-3 px-3">
                            {formatNumber(bot.subscribers)}
                          </td>
                          <td className="py-3 px-3">
                            {formatNumber(bot.impressionsServed)}
                          </td>
                          <td className="py-3 px-3 text-green-400">
                            {formatCurrency(bot.earnings)}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBotStatusStyles(bot.status)}`}
                            >
                              {p?.statusText?.[bot.status] || bot.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setSelectedBotForModal(bot);
                                  setShowBotModal(true);
                                }}
                                className="p-1.5 hover:bg-foreground/10 rounded-lg transition"
                                title={t.myAds?.actions?.view || "View"}
                              >
                                <Eye className="w-3.5 h-3.5 text-purple-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteBot(bot.id)}
                                className="p-1.5 hover:bg-foreground/10 rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="sm:hidden space-y-3">
                {bots.length === 0 ? (
                  <p className="text-center py-10 text-foreground/40 text-sm">
                    {p?.noBots}
                  </p>
                ) : (
                  bots.map((bot) => (
                    <div
                      key={bot.id}
                      className="bg-foreground/[0.03] border border-white/10 rounded-xl p-3"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium">@{bot.username}</p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getBotStatusStyles(bot.status)}`}
                        >
                          {p?.statusText?.[bot.status] || bot.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                        <div>
                          <p className="text-foreground/30 mb-0.5">
                            {p?.botsTableHeaders.subscribers}
                          </p>
                          <p className="text-foreground/70">
                            {formatNumber(bot.subscribers)}
                          </p>
                        </div>
                        <div>
                          <p className="text-foreground/30 mb-0.5">
                            {p?.botsTableHeaders.impressions}
                          </p>
                          <p className="text-foreground/70">
                            {formatNumber(bot.impressionsServed)}
                          </p>
                        </div>
                        <div>
                          <p className="text-foreground/30 mb-0.5">
                            {p?.botsTableHeaders.earnings}
                          </p>
                          <p className="text-green-400">
                            {formatCurrency(bot.earnings)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => {
                            setSelectedBotForModal(bot);
                            setShowBotModal(true);
                          }}
                          className="p-1.5 hover:bg-foreground/10 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4 text-purple-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteBot(bot.id)}
                          className="p-1.5 hover:bg-foreground/10 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-white/10 rounded-xl p-5 sm:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{p?.editModal.title}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-foreground/60 hover:text-foreground transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs text-foreground/60 mb-2">
                  {p?.editModal.nameLabel}
                </label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-foreground/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition text-sm"
                  placeholder="Ahmad"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-foreground/60 mb-2">
                  {p?.editModal.surnameLabel}
                </label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-foreground/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition text-sm"
                  placeholder="Karimov"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2.5 bg-foreground/5 hover:bg-foreground/10 border border-white/10 rounded-lg transition font-medium text-sm"
              >
                {p?.editModal.cancel}
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-medium text-sm"
              >
                {p?.editModal.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modals */}
      {showAdModal && (
        <AdDetailModal
          ad={selectedAdForModal}
          onClose={() => setShowAdModal(false)}
          formatNumber={formatNumber}
          formatCurrency={formatCurrency}
          formatPercent={formatPercent}
          getAdStatusStyles={getAdStatusStyles}
          t={t}
        />
      )}

      {showBotModal && (
        <BotDetailModal
          bot={selectedBotForModal}
          onClose={() => setShowBotModal(false)}
          formatNumber={formatNumber}
          formatCurrency={formatCurrency}
          getBotStatusStyles={getBotStatusStyles}
          t={t}
        />
      )}
    </div>
  );
};

// --- SUB-COMPONENTS FOR MODALS ---

const AdDetailModal = ({
  ad,
  onClose,
  formatNumber,
  formatCurrency,
  formatPercent,
  getAdStatusStyles,
  t,
}: any) => {
  if (!ad) return null;
  const p = t.profile;

  const calculateAdSpent = (ad: any): number => {
    if (ad.spent !== undefined) return Number(ad.spent);
    const total = Number(ad.totalCost) || 0;
    const remaining = Number(ad.remainingBudget) || 0;
    return Math.max(0, total - remaining);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-card border border-white/10 rounded-xl p-5 sm:p-6 w-full max-w-2xl my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {p?.information} - {p?.myAds}
          </h2>
          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] text-foreground/40 mb-1.5 uppercase tracking-wider">
              {p?.adsTableHeaders.title}
            </label>
            <p className="text-sm font-medium leading-relaxed bg-foreground/5 p-3 rounded-lg border border-white/5 whitespace-pre-wrap max-h-[150px] overflow-y-auto">
              {ad.title || ad.text}
            </p>

            <div className="mt-5">
              <label className="block text-[10px] text-foreground/40 mb-2 uppercase tracking-wider">
                {p?.adsTableHeaders.status}
              </label>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getAdStatusStyles(ad.status)}`}
              >
                {p?.statusText?.[ad.status] ||
                  t.adStatus[ad.status] ||
                  ad.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-foreground/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] text-foreground/40 uppercase font-medium">
                  {p?.adsTableHeaders.impressions}
                </span>
              </div>
              <p className="text-lg font-bold">
                {formatNumber(ad.deliveredImpressions ?? ad.impressions)}
              </p>
            </div>

            <div className="bg-foreground/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <MousePointerClick className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] text-foreground/40 uppercase font-medium">
                  {p?.adsTableHeaders.ctr}
                </span>
              </div>
              <p className="text-lg font-bold">{formatPercent(ad.ctr)}</p>
            </div>

            <div className="bg-foreground/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] text-foreground/40 uppercase font-medium">
                  {p?.adsTableHeaders.conversions}
                </span>
              </div>
              <p className="text-lg font-bold">
                {formatNumber(ad.conversions)}
              </p>
            </div>

            <div className="bg-foreground/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[10px] text-foreground/40 uppercase font-medium">
                  {p?.adsTableHeaders.spent}
                </span>
              </div>
              <p className="text-lg font-bold text-red-400">
                {formatCurrency(calculateAdSpent(ad))}
              </p>
            </div>

            <div className="col-span-2 bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/10 rounded-lg p-3 mt-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-foreground/40 uppercase font-medium">
                  {p?.budget ?? "Budget"}
                </span>

                <p className="text-sm font-bold">
                  {formatCurrency(ad.totalCost)}
                </p>
              </div>
              <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (calculateAdSpent(ad) / (ad.totalCost || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              {p?.latestImpressions ?? "Latest Impressions"}
            </h3>
          </div>
          <DetailedImpressionsList adId={ad.id} p={p} />
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <MousePointer2 className="w-4 h-4 text-blue-400" />
              {p?.latestClicks ?? "Latest Clicks"}
            </h3>
          </div>
          <DetailedClicksList adId={ad.id} p={p} />
        </div>

        <div className="mt-8 pt-5 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-bold text-sm"
          >
            {p?.close ?? "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailedImpressionsList = ({ adId, p }: { adId: string; p: any }) => {
  const { accessToken } = useAuthStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/ads/${adId}/impressions`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { limit: 10 },
          },
        );
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch impressions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [adId]);

  if (loading)
    return (
      <div className="text-center py-4 text-foreground/40 text-xs">
        {p?.loading ?? "Loading..."}
      </div>
    );
  if (!data?.length)
    return (
      <div className="text-center py-4 text-foreground/40 text-xs">
        {p?.noImpressions ?? "No impressions yet"}
      </div>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] text-foreground/70">
        <thead>
          <tr className="border-b border-white/5 text-left">
            <th>{p?.tableUser ?? "User"}</th>
            <th>{p?.tableCountry ?? "Country"}</th>
            <th>{p?.tableBot ?? "Bot"}</th>
            <th>{p?.tableTime ?? "Time"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((imp: any) => (
            <tr key={imp.id}>
              <td className="py-2">
                <div className="flex flex-col">
                  <span className="text-foreground font-medium">
                    {imp.firstName} {imp.lastName}
                  </span>
                  <span className="text-foreground/40">
                    @{imp.username || "user"}
                  </span>
                </div>
              </td>
              <td className="py-2">
                <div className="flex items-center gap-1.5">
                  <span className="opacity-60">{imp.languageCode || "-"}</span>
                  <span className="bg-foreground/5 px-1.5 py-0.5 rounded text-[9px] font-bold text-foreground/50">
                    {imp.country || "???"}
                  </span>
                </div>
              </td>
              <td className="py-2 text-purple-400">@{imp.bot?.username}</td>
              <td className="py-2 text-foreground/40">
                {dayjs(imp.createdAt).format("HH:mm, DD.MM")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DetailedClicksList = ({ adId, p }: { adId: string; p: any }) => {
  const { accessToken } = useAuthStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/ads/${adId}/clicks-detailed`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { limit: 10 },
          },
        );
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch clicks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [adId]);

  if (loading)
    return (
      <div className="text-center py-4 text-foreground/40 text-xs">
        {p?.loading ?? "Loading..."}
      </div>
    );
  if (!data?.length)
    return (
      <div className="text-center py-4 text-foreground/40 text-xs">
        {p?.noClicks ?? "No clicks yet"}
      </div>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] text-foreground/70">
        <thead>
          <tr className="border-b border-white/5 text-left">
            <th>{p?.tableUser ?? "User"}</th>
            <th>{p?.tableCountry ?? "Country"}</th>
            <th>{p?.tableDevice ?? "Device/IP"}</th>
            <th>{p?.tableTime ?? "Time"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((click: any) => (
            <tr key={click.id}>
              <td className="py-2">
                <div className="flex flex-col">
                  <span className="text-foreground font-medium">
                    {click.firstName} {click.lastName}
                  </span>
                  <span className="text-foreground/40">
                    @{click.username || "user"}
                  </span>
                </div>
              </td>
              <td className="py-2">
                <div className="flex items-center gap-1.5">
                  <span className="opacity-60 uppercase">
                    {click.languageCode || "-"}
                  </span>
                  <span className="bg-foreground/5 px-1.5 py-0.5 rounded text-[9px] font-bold text-foreground/50">
                    {click.country || "???"}
                  </span>
                </div>
              </td>
              <td className="py-2">
                <div className="flex flex-col text-[9px] opacity-60">
                  <span>{click.ipAddress}</span>
                  <span className="truncate max-w-[100px]">
                    {click.userAgent?.split(" ")[0]}
                  </span>
                </div>
              </td>
              <td className="py-2 text-foreground/40">
                {dayjs(click.clickedAt).format("HH:mm, DD.MM")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const BotDetailModal = ({
  bot,
  onClose,
  formatNumber,
  formatCurrency,
  getBotStatusStyles,
  t,
}: any) => {
  if (!bot) return null;
  const p = t.profile;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-card border border-white/10 rounded-xl p-5 sm:p-6 w-full max-w-2xl my-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {p?.information} - {p?.myBots}
          </h2>
          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 bg-foreground/5 p-4 rounded-xl border border-white/5">
              <div className="w-14 h-14 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center text-xl font-bold border border-purple-500/20">
                {bot.username?.[0]?.toUpperCase() || "B"}
              </div>
              <div>
                <h3 className="text-lg font-bold">@{bot.username}</h3>
                <p className="text-xs text-foreground/40 bg-foreground/5 px-2 py-0.5 rounded mt-1 inline-block">
                  {bot.category}
                </p>
              </div>
            </div>

            <div className="bg-foreground/5 p-4 rounded-xl border border-white/5">
              <label className="block text-[10px] text-foreground/40 mb-2 uppercase tracking-wider">
                {p?.botsTableHeaders.status}
              </label>
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold ${getBotStatusStyles(bot.status)}`}
              >
                {p?.statusText?.[bot.status] || bot.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-foreground/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] text-foreground/40 uppercase font-medium">
                  {p?.botsTableHeaders.subscribers}
                </span>
              </div>
              <p className="text-lg font-bold">
                {formatNumber(bot.subscribers)}
              </p>
            </div>

            <div className="bg-foreground/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] text-foreground/40 uppercase font-medium">
                  {p?.botsTableHeaders.impressions}
                </span>
              </div>
              <p className="text-lg font-bold">
                {formatNumber(bot.impressionsServed)}
              </p>
            </div>

            <div className="col-span-2 bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-xl p-5 mt-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-foreground/50 uppercase font-bold tracking-tight">
                      {p?.botsTableHeaders.earnings}
                    </span>
                  </div>
                  <p className="text-3xl font-black text-green-400">
                    {formatCurrency(bot.earnings)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              {p?.activeUsers ?? "Latest Active Users"}
            </h3>
            <BotUsersExport botId={bot.id} p={p} />{" "}
          </div>
          <ActiveUsersList botId={bot.id} p={p} />
        </div>

        <div className="mt-8 pt-5 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-bold text-sm"
          >
            {p?.close ?? "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ActiveUsersList = ({ botId, p }: { botId: string; p: any }) => {
  const { accessToken } = useAuthStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/bots/${botId}/active-users`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        setData(res.data.data.slice(0, 10)); // Top 10
      } catch (err) {
        console.error("Failed to fetch active users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [botId]);

  if (loading)
    return (
      <div className="text-center py-4 text-foreground/40 text-xs">
        {p?.loading ?? "Loading..."}
      </div>
    );
  if (!data?.length)
    return (
      <div className="text-center py-4 text-foreground/40 text-xs">
        {p?.noUsers ?? "No users yet"}
      </div>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px] text-foreground/70">
        <thead>
          <tr className="border-b border-white/5 text-left text-foreground/40">
            <th>{p?.tableUser ?? "User"}</th>
            <th>{p?.tableLanguage ?? "Language"}</th>
            <th>{p?.tableCountry ?? "Country"}</th>
            <th>{p?.tableLastSeen ?? "Last seen"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((user: any) => (
            <tr key={user.id}>
              <td className="py-2 text-foreground/90">
                <div className="flex flex-col">
                  <span className="font-bold">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-[9px] opacity-40">
                    @{user.username || "user"}
                  </span>
                </div>
              </td>
              <td className="py-2 uppercase opacity-60">
                {user.languageCode || "-"}
              </td>
              <td className="py-2">
                <span className="bg-foreground/5 px-1.5 py-0.5 rounded text-[9px] font-bold text-foreground/50">
                  {user.country || "???"}
                </span>
              </td>
              <td className="py-2 text-foreground/40">
                {dayjs(user.lastSeenAt).fromNow()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const BotUsersExport = ({ botId, p }: { botId: string; p: any }) => {
  const { accessToken } = useAuthStore();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/detailed-stats/bot/${botId}/export`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const data = res.data.data;
      if (!data || data.length === 0) {
        alert(p?.exportEmpty ?? "No data to export");
        return;
      }

      // Simple JSON to CSV
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(","),
        ...data.map((row: any) =>
          headers.map((h) => `"${row[h] || ""}"`).join(","),
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bot-users-${botId}.csv`;
      a.click();
    } catch (err) {
      console.error("Export failed", err);
      alert(p?.exportError ?? "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="px-3 py-1 bg-foreground/5 hover:bg-foreground/10 border border-white/10 rounded-lg text-[10px] font-bold transition flex items-center gap-1.5 disabled:opacity-50"
    >
      <TrendingUp className="w-3 h-3" />
      {exporting
        ? (p?.exporting ?? "Preparing...")
        : (p?.exportBtn ?? "Excel (CSV)")}
    </button>
  );
};

export default Profile;
