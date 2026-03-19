import { useEffect, useState } from "react";
import { getBotAvatarUrl } from "../../api/api";
import {
  Loader2,
  Pause,
  Play,
  Trash2,
  Eye,
  RefreshCw,
  Settings,
  TrendingUp,
  DollarSign,
  Activity,
  X,
  Users,
} from "lucide-react";
import { useBotStore } from "../../store/botStore";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslations } from "../../hooks/useTranslations";

const Bots = () => {
  const navigate = useNavigate();
  const { lang } = useParams();
  const t = useTranslations();
  const b = t.addBot?.bots;

  const { bots, isLoading, fetchMyBots, deleteBot, togglePause, isSubmitting } =
    useBotStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pausingId, setPausingId] = useState<string | null>(null);
  const [selectedBot, setSelectedBot] = useState<any | null>(null);

  const botsList = Array.isArray(bots) ? bots : [];

  useEffect(() => {
    fetchMyBots({ limit: 10 });
  }, [fetchMyBots]);

  const handleDelete = async (botId: string, botUsername: string) => {
    const confirmMsg = (
      b?.deleteConfirm ?? "Are you sure you want to delete @{{username}}?"
    ).replace("{{username}}", botUsername);
    if (window.confirm(confirmMsg)) {
      setDeletingId(botId);
      await deleteBot(botId);
      setDeletingId(null);
    }
  };

  const handleTogglePause = async (botId: string, currentPaused: boolean) => {
    setPausingId(botId);
    await togglePause(botId, !currentPaused);
    setPausingId(null);
  };

  const formatCurrency = (amount: number) =>
    `$${Number(amount || 0).toFixed(2)}`;
  const formatNumber = (num: number) => Number(num || 0).toLocaleString();

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
      <div className="mt-8 flex items-center justify-center rounded-2xl border border-border bg-card/30 p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{b?.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {botsList.length}{" "}
            {botsList.length === 1 ? b?.botRegistered : b?.botsRegistered}
          </p>
        </div>
        <button
          onClick={() => fetchMyBots({ limit: 10 })}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-border bg-accent/50 px-4 py-2.5 text-sm font-medium transition hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {b?.refresh}
        </button>
      </div>

      {botsList.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card/30 p-16 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {b?.noBots}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {b?.noBotsDesc}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card/30 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-accent/30">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {b?.tableHeaders.bot}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {b?.tableHeaders.performance}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {b?.tableHeaders.earnings}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {b?.tableHeaders.status}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {b?.tableHeaders.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {botsList.map((bot) => (
                  <tr
                    key={bot.id}
                    className="transition hover:bg-accent/20 group"
                  >
                    {/* Bot Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getBotAvatarUrl(bot.username)}
                          alt={bot.username}
                          className="w-10 h-10 rounded-full object-cover border border-border bg-background"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.username || "B")}&background=random&color=fff&size=64`;
                          }}
                        />
                        <div>
                          <p className="font-semibold text-foreground">
                            @{bot.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {bot.firstName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Performance */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <Eye className="w-3 h-3 text-primary" />
                          <span className="text-foreground/80">
                            {formatNumber(bot.impressionsServed || 0)}{" "}
                            {b?.views}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <TrendingUp className="w-3 h-3 text-indigo-400" />
                          <span className="text-foreground/80">
                            {bot.ctr || 0}% CTR
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Earnings */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(bot.totalEarnings || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(bot.pendingEarnings || 0)}{" "}
                            {b?.pending}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(bot.status)}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {/* Status tarjimasi */}
                          {b?.statusText?.[bot.status] || bot.status}
                        </span>
                        {bot.monetized && (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                              {b?.monetized}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/${lang}/bots/${bot.id}/settings`)
                          }
                          className="flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary/90 px-3 py-2 text-xs font-medium text-primary-foreground transition-colors shadow-sm"
                          title={b?.settings}
                        >
                          <Settings className="h-3.5 w-3.5" />
                          {b?.settings}
                        </button>

                        <button
                          onClick={() => setSelectedBot(bot)}
                          className="rounded-lg p-2 transition hover:bg-accent text-muted-foreground hover:text-foreground border border-border"
                          title={b?.viewDetails}
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            handleTogglePause(bot.id, bot.isPaused)
                          }
                          disabled={pausingId === bot.id || isSubmitting}
                          className="rounded-lg p-2 transition hover:bg-accent border border-border disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {pausingId === bot.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : bot.isPaused ? (
                            <Play className="h-4 w-4 text-green-500" />
                          ) : (
                            <Pause className="h-4 w-4 text-yellow-500" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDelete(bot.id, bot.username)}
                          disabled={deletingId === bot.id || isSubmitting}
                          className="rounded-lg p-2 transition hover:bg-destructive/10 border border-border text-muted-foreground hover:text-destructive"
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
          <div className="border-t border-border bg-accent/10 px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6 text-muted-foreground">
                <span>
                  {b?.totalBots}:{" "}
                  <strong className="text-foreground">{botsList.length}</strong>
                </span>
                <span className="w-px h-4 bg-border"></span>
                <span>
                  {b?.totalEarnings}:{" "}
                  <strong className="text-green-600 dark:text-green-400">
                    {formatCurrency(
                      botsList.reduce(
                        (sum, bot) => sum + (bot.totalEarnings || 0),
                        0,
                      ),
                    )}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bot Details Modal */}
      {selectedBot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={getBotAvatarUrl(selectedBot.username)}
                  alt={selectedBot.username}
                  className="h-12 w-12 rounded-full border border-border object-cover bg-background"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedBot.username || "B")}&background=random&color=fff&size=64`;
                  }}
                />
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    @{selectedBot.username}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedBot.firstName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBot(null)}
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mt-6 space-y-6">
              {/* Status & Monetization */}
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(selectedBot.status)}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                  {b?.statusText?.[selectedBot.status] || selectedBot.status}
                </span>
                {selectedBot.monetized && (
                  <span className="inline-flex rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-sm font-medium text-primary">
                    {b?.monetized}
                  </span>
                )}
                {selectedBot.isPaused && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    <Pause className="h-3.5 w-3.5" />
                    Paused
                  </span>
                )}
              </div>

              {/* Members Info - MOVED FROM TABLE */}
              <div className="rounded-xl border border-border bg-accent/10 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground/80">
                  <Users className="h-4 w-4" /> A'zolar statistikasi
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Jami a'zolar
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {formatNumber(selectedBot.totalMembers || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Faol a'zolar
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {formatNumber(selectedBot.activeMembers || 0)}
                    </p>
                  </div>
                </div>
                {selectedBot.botstatData && (
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
                    <div className="text-center rounded-lg bg-green-500/10 py-2 border border-green-500/20">
                      <p className="text-[10px] text-green-600 dark:text-green-400 uppercase">
                        Live User
                      </p>
                      <p className="font-mono text-sm font-medium text-green-700 dark:text-green-300">
                        {formatNumber(selectedBot.botstatData.users_live || 0)}
                      </p>
                    </div>
                    <div className="text-center rounded-lg bg-destructive/10 py-2 border border-destructive/20">
                      <p className="text-[10px] text-destructive uppercase">
                        Dead User
                      </p>
                      <p className="font-mono text-sm font-medium text-destructive">
                        {formatNumber(selectedBot.botstatData.users_die || 0)}
                      </p>
                    </div>
                    <div className="text-center rounded-lg bg-blue-500/10 py-2 border border-blue-500/20">
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase">
                        Groups
                      </p>
                      <p className="font-mono text-sm font-medium text-blue-700 dark:text-blue-300">
                        {formatNumber(selectedBot.botstatData.groups_live || 0)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Performance */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-accent/10 p-4">
                  <p className="mb-1 text-xs text-muted-foreground">
                    Ko'rishlar (Impressions)
                  </p>
                  <p className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <Eye className="h-4 w-4 text-primary" />
                    {formatNumber(selectedBot.impressionsServed || 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-accent/10 p-4">
                  <p className="mb-1 text-xs text-muted-foreground">
                    CTR (Clicktrough Rate)
                  </p>
                  <p className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <TrendingUp className="h-4 w-4 text-indigo-400" />
                    {selectedBot.ctr || 0}%
                  </p>
                </div>
              </div>

              {/* Category & Details */}
              <div className="rounded-xl border border-border bg-accent/10 p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Kategoriya
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedBot.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Bot tili
                  </span>
                  <span className="text-sm font-medium text-foreground uppercase">
                    {selectedBot.language}
                  </span>
                </div>
                {selectedBot.shortDescription && (
                  <div className="border-t border-border pt-3">
                    <span className="block text-xs text-muted-foreground mb-1">
                      Tavsif
                    </span>
                    <p className="text-sm text-foreground/80">
                      {selectedBot.shortDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex gap-3 border-t border-border pt-4">
              <button
                onClick={() => {
                  setSelectedBot(null);
                  navigate(`/${lang}/bots/${selectedBot.id}/settings`);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <Settings className="h-4 w-4" />
                Sozlamalar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bots;
