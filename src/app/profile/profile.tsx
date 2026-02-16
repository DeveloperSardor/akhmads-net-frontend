import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Download,
  Edit,
  LogOut,
  Trash2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUserStore } from "../../store/userStore";

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"my-ads" | "my-bots">("my-ads");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
  });

  // Auth store
  const { user: authUser, logout } = useAuthStore();

  // User store
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

  // Fetch data on mount
  useEffect(() => {
    fetchProfile();
    fetchAds({ limit: 10 });
    fetchBots({ limit: 10 });
    fetchAnalytics(7, "advertiser");
  }, []);

  // Set edit form when profile loads
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
    if (window.confirm("Are you sure you want to delete this ad?")) {
      await deleteAd(adId);
    }
  };

  const handleDeleteBot = async (botId: string) => {
    if (window.confirm("Are you sure you want to delete this bot?")) {
      await deleteBot(botId);
    }
  };

  const handleSaveProfile = async () => {
    await updateProfile(editForm);
    setShowEditModal(false);
  };

  // Calculate avatar URL
  const avatarUrl =
    profile?.avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.firstName || "User"
    }`;

  // Format currency - fixed type handling
  const formatCurrency = (amount?: number | string | null): string => {
    const numAmount = typeof amount === 'number' ? amount : Number(amount) || 0;
    return `$${numAmount.toFixed(2)}`;
  };

  // Format number - fixed type handling
  const formatNumber = (num?: number | string | null): string => {
    const numValue = typeof num === 'number' ? num : Number(num) || 0;
    return numValue.toLocaleString();
  };

  // Format percentage - fixed type handling
  const formatPercent = (num?: number | string | null): string => {
    const numValue = typeof num === 'number' ? num : Number(num) || 0;
    return `${numValue.toFixed(1)}%`;
  };

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
            <button onClick={clearError} className="text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Back Button & Title */}
        <div className="mt-15">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition text-xs mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to home
          </button>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 mt-5 mb-4">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden">
                <img
                  src={avatarUrl}
                  alt={profile?.firstName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-0.5">
                  {profile?.firstName} {profile?.lastName}
                </h2>
                <p className="text-xs text-white/50">{profile?.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition text-sm"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition text-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out
              </button>
            </div>
          </div>

          {/* Financial Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                </div>
                <span className="text-xs text-white/60">Total Spent</span>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(stats?.totalSpent ?? wallet?.totalSpent)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 text-green-400" />
                </div>
                <span className="text-xs text-white/60">Total Earned</span>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrency(stats?.totalEarned ?? wallet?.totalEarnings)}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Eye className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <span className="text-xs text-white/60">Impressions</span>
            </div>
            <p className="text-xl font-bold mb-0.5">
              {formatNumber(stats?.totalImpressions)}
            </p>
            <p className="text-xs text-white/40">Total views</p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <MousePointerClick className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <span className="text-xs text-white/60">CTR</span>
            </div>
            <p className="text-xl font-bold mb-0.5">
              {formatPercent(stats?.averageCtr)}
            </p>
            <p className="text-xs text-white/40">Average click-through rate</p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <span className="text-xs text-white/60">Conversions</span>
            </div>
            <p className="text-xl font-bold mb-0.5">
              {formatCurrency(stats?.totalClicks)}
            </p>
            <p className="text-xs text-white/40">Total conversions</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
          {/* Revenue Trend */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Revenue trend</h3>
              <div className="flex items-center gap-2">
                <button className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition">
                  <Calendar className="w-3.5 h-3.5" />
                </button>
                <button className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition text-xs">
                  Export CSV
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="date" stroke="#ffffff30" fontSize={10} />
                <YAxis stroke="#ffffff30" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0a0a",
                    border: "1px solid #ffffff20",
                    borderRadius: "6px",
                    fontSize: "11px",
                  }}
                  cursor={{ fill: "#ffffff08" }}
                />
                <Bar dataKey="earnings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CTR Indicator */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">CTR indicator</h3>
              <div className="flex items-center gap-2">
                <button className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition">
                  <Calendar className="w-3.5 h-3.5" />
                </button>
                <button className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition text-xs">
                  Export CSV
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={ctrData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="date" stroke="#ffffff30" fontSize={10} />
                <YAxis stroke="#ffffff30" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0a0a",
                    border: "1px solid #ffffff20",
                    borderRadius: "6px",
                    fontSize: "11px",
                  }}
                  cursor={{ stroke: "#ffffff20" }}
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
        <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Information</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("my-ads")}
                className={`px-3 py-1.5 rounded-lg font-medium transition text-sm ${activeTab === "my-ads"
                    ? "bg-purple-600 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
              >
                My Ads
              </button>
              <button
                onClick={() => setActiveTab("my-bots")}
                className={`px-3 py-1.5 rounded-lg font-medium transition text-sm ${activeTab === "my-bots"
                    ? "bg-purple-600 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
              >
                My Bots
              </button>
            </div>
          </div>

          {/* Ads Table */}
          {activeTab === "my-ads" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 font-medium text-white/60 text-xs">
                      Ad Title
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-white/60 text-xs">
                      Impressions
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-white/60 text-xs">
                      CTR
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-white/60 text-xs">
                      Conversions
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-white/60 text-xs">
                      Spent
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-white/60 text-xs">
                      Status
                    </th>
                    <th className="text-right py-3 px-3 font-medium text-white/60 text-xs">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-white/40 text-sm">
                        No ads found
                      </td>
                    </tr>
                  ) : (
                    ads.map((ad) => (
                      <tr
                        key={ad.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition"
                      >
                        <td className="py-3 px-3">{ad.title}</td>
                        <td className="py-3 px-3">{formatNumber(ad.impressions)}</td>
                        <td className="py-3 px-3">{formatPercent(ad.ctr)}</td>
                        <td className="py-3 px-3">{formatPercent(ad.ctr)}</td>
                        <td className="py-3 px-3 text-red-400">
                          {formatCurrency(ad.spent)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${ad.status === "RUNNING"
                                ? "bg-green-500/20 text-green-400"
                                : ad.status === "PAUSED"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                          >
                            {ad.status === "RUNNING"
                              ? "Active"
                              : ad.status === "PAUSED"
                                ? "Pending"
                                : ad.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/ads/${ad.id}`)}
                              className="p-1.5 hover:bg-white/10 rounded-lg transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAd(ad.id)}
                              className="p-1.5 hover:bg-white/10 rounded-lg transition"
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
          )}

          {/* Bots Table */}
          {activeTab === "my-bots" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 font-medium text-white/60 text-xs">
                      Bot Name
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-white/60 text-xs">
                      Subscribers
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-white/60 text-xs">
                      Impressions
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-white/60 text-xs">
                      Earnings
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-white/60 text-xs">
                      Status
                    </th>
                    <th className="text-right py-3 px-3 font-medium text-white/60 text-xs">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bots.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-white/40 text-sm">
                        No bots found
                      </td>
                    </tr>
                  ) : (
                    bots.map((bot) => (
                      <tr
                        key={bot.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition"
                      >
                        <td className="py-3 px-3">@{bot.username}</td>
                        <td className="py-3 px-3">{formatNumber(bot.subscribers)}</td>
                        <td className="py-3 px-3">
                          {formatNumber(bot.impressionsServed)}
                        </td>
                        <td className="py-3 px-3 text-green-400">
                          {formatCurrency(bot.earnings)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${bot.status === "ACTIVE"
                                ? "bg-green-500/20 text-green-400"
                                : bot.status === "PENDING"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                          >
                            {bot.status === "ACTIVE"
                              ? "Active"
                              : bot.status === "PENDING"
                                ? "Pending"
                                : bot.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/bots/${bot.id}`)}
                              className="p-1.5 hover:bg-white/10 rounded-lg transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBot(bot.id)}
                              className="p-1.5 hover:bg-white/10 rounded-lg transition"
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
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Edit the User information</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/60 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs text-white/60 mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition text-sm"
                  placeholder="Ahmad"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-2">Surname</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 transition text-sm"
                  placeholder="Karimov"
                />
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-2">Role</label>
                <div className="px-3.5 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white/80">
                  {profile?.role || "User"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-medium text-sm"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;