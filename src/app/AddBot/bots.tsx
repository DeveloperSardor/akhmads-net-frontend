import { useEffect, useState } from "react";
import { 
  Loader2, 
  Pause, 
  Play, 
  Trash2, 
  Eye, 
  RefreshCw, 
  Settings, 
  TrendingUp, 
  Users,
  DollarSign,
  Activity
} from "lucide-react";
import { useBotStore } from "../../store/botStore";
import { useNavigate, useParams } from "react-router-dom";

const Bots = () => {
  const navigate = useNavigate();
  const { lang } = useParams(); // ✅ Get current language
  const { bots, isLoading, fetchMyBots, deleteBot, togglePause, isSubmitting } = useBotStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pausingId, setPausingId] = useState<string | null>(null);

  // Ensure bots is always an array
  const botsList = Array.isArray(bots) ? bots : [];

  // Fetch bots on mount
  useEffect(() => {
    fetchMyBots({ limit: 10 });
  }, [fetchMyBots]);

  // Handle delete
  const handleDelete = async (botId: string, botUsername: string) => {
    if (window.confirm(`Are you sure you want to delete @${botUsername}?`)) {
      setDeletingId(botId);
      await deleteBot(botId);
      setDeletingId(null);
    }
  };

  // Handle pause/resume
  const handleTogglePause = async (botId: string, currentPaused: boolean) => {
    setPausingId(botId);
    await togglePause(botId, !currentPaused);
    setPausingId(null);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${Number(amount || 0).toFixed(2)}`;
  };

  // Format number
  const formatNumber = (num: number) => {
    return Number(num || 0).toLocaleString();
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "REJECTED":
      case "BANNED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "PAUSED":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (isLoading && botsList.length === 0) {
    return (
      <div className="mt-8 flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-12">
        <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Bots</h2>
          <p className="text-sm text-white/60 mt-1">
            {botsList.length} {botsList.length === 1 ? 'bot' : 'bots'} registered
          </p>
        </div>
        <button
          onClick={() => fetchMyBots({ limit: 10 })}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {botsList.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No bots registered yet</h3>
          <p className="text-sm text-white/50 max-w-md mx-auto">
            Add your first bot using the form above to start earning revenue through ad distribution
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                    Bot
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                    Performance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                    Members
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                    Earnings
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/60">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-white/60">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {botsList.map((bot) => (
                  <tr
                    key={bot.id}
                    className="transition hover:bg-white/[0.03] group"
                  >
                    {/* Bot Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                          {bot.username?.[0]?.toUpperCase() || 'B'}
                        </div>
                        <div>
                          <p className="font-semibold text-white">@{bot.username}</p>
                          <p className="text-xs text-white/50">{bot.firstName}</p>
                        </div>
                      </div>
                    </td>

                    {/* Performance Stats */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <Eye className="w-3 h-3 text-purple-400" />
                          <span className="text-white/80">
                            {formatNumber(bot.impressionsServed || 0)} views
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <TrendingUp className="w-3 h-3 text-blue-400" />
                          <span className="text-white/80">
                            {bot.ctr || 0}% CTR
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Members */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-white/40" />
                        <div>
                          <p className="font-semibold text-white">
                            {formatNumber(bot.totalMembers || 0)}
                          </p>
                          <p className="text-xs text-white/50">
                            {formatNumber(bot.activeMembers || 0)} active
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Earnings */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="font-bold text-green-400">
                            {formatCurrency(bot.totalEarnings || 0)}
                          </p>
                          <p className="text-xs text-white/50">
                            {formatCurrency(bot.pendingEarnings || 0)} pending
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                            bot.status
                          )}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {bot.status}
                        </span>
                        {bot.monetized && (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-xs font-medium text-purple-400">
                              Monetized
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Settings Button - PRIMARY ACTION */}
                        <button
                          onClick={() => navigate(`/${lang}/bots/${bot.id}/settings`)} // ✅ FIXED - includes lang
                          className="flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 px-3 py-2 text-xs font-medium transition-colors"
                          title="Bot Settings"
                        >
                          <Settings className="h-3.5 w-3.5" />
                          Settings
                        </button>

                        {/* View Details */}
                        <button
                          onClick={() => navigate(`/${lang}/bots/${bot.id}`)} // ✅ FIXED
                          className="rounded-lg p-2 transition hover:bg-white/10 text-white/70 hover:text-white"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Pause/Resume */}
                        <button
                          onClick={() => handleTogglePause(bot.id, bot.isPaused)}
                          disabled={pausingId === bot.id || isSubmitting}
                          className="rounded-lg p-2 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                          title={bot.isPaused ? "Resume" : "Pause"}
                        >
                          {pausingId === bot.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-white/70" />
                          ) : bot.isPaused ? (
                            <Play className="h-4 w-4 text-green-400" />
                          ) : (
                            <Pause className="h-4 w-4 text-yellow-400" />
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(bot.id, bot.username)}
                          disabled={deletingId === bot.id || isSubmitting}
                          className="rounded-lg p-2 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 text-white/70 hover:text-red-400"
                          title="Delete"
                        >
                          {deletingId === bot.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="border-t border-white/10 bg-white/[0.01] px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6 text-white/60">
                <span>Total Bots: <strong className="text-white">{botsList.length}</strong></span>
                <span className="w-px h-4 bg-white/10"></span>
                <span>
                  Total Earnings: <strong className="text-green-400">
                    {formatCurrency(
                      botsList.reduce((sum, bot) => sum + (bot.totalEarnings || 0), 0)
                    )}
                  </strong>
                </span>
                <span className="w-px h-4 bg-white/10"></span>
                <span>
                  Total Members: <strong className="text-purple-400">
                    {formatNumber(
                      botsList.reduce((sum, bot) => sum + (bot.totalMembers || 0), 0)
                    )}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bots;