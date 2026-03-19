import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslations } from "../../hooks/useTranslations";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ShieldCheck,
  Bot,
  User,
  Clock,
  FileText,
} from "lucide-react";
import { BASE_URL } from "../../api/api";

interface Broadcast {
  id: string;
  adText: string;
  mediaUrl?: string;
  mediaType?: string;
  status: string;
  scheduledAt?: string;
  bot: {
    id: string;
    username: string;
  };
  advertiser: {
    firstName: string;
    username?: string;
  };
}

const ModerationPage = () => {
  const translations = useTranslations();
  const t = translations.botSettings;
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<{
    [key: string]: string;
  }>({});

  const fetchPending = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${BASE_URL}/api/v1/bots/broadcasts/pending`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBroadcasts(res.data.data.broadcasts || []);
    } catch (err) {
      console.error("Failed to fetch pending broadcasts", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    setIsSubmitting(id);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/api/v1/bots/broadcasts/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBroadcasts((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Approval failed", err);
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleReject = async (id: string) => {
    setIsSubmitting(id);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL}/api/v1/bots/broadcasts/${id}/reject`,
        { reason: rejectionReason[id] || "" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBroadcasts((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Rejection failed", err);
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t.pendingModeration}
            </h1>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed pl-[52px]">
            {t.moderationSubtitle}
          </p>
        </div>

        {/* Count badge */}
        {!isLoading && broadcasts.length > 0 && (
          <div className="mb-6 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {broadcasts.length}
            </span>
            <span className="text-muted-foreground text-sm font-medium">
              {t.pendingModeration}
            </span>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-muted-foreground text-sm font-medium">
              Loading...
            </span>
          </div>
        ) : /* Empty */
        broadcasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-6 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-foreground font-bold text-lg mb-2">
              {t.moderationNoAds}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
              {t.moderationNoAdsDesc}
            </p>
          </div>
        ) : (
          /* List */
          <div className="grid grid-cols-1 gap-6">
            {broadcasts.map((broadcast) => (
              <div
                key={broadcast.id}
                className="bg-card border border-border rounded-3xl overflow-hidden transition-all hover:shadow-lg hover:border-primary/30"
              >
                {/* Card header */}
                <div className="px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground leading-tight">
                        @{broadcast.bot.username}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">
                          {t.moderationAdvertiser}:{" "}
                          {broadcast.advertiser.firstName}
                          {broadcast.advertiser.username && (
                            <span className="text-muted-foreground/60">
                              {" "}
                              (@{broadcast.advertiser.username})
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background px-3 py-1.5 rounded-full border border-border">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {broadcast.scheduledAt
                        ? new Date(broadcast.scheduledAt).toLocaleString()
                        : t.moderationAsap}
                    </span>
                  </div>
                </div>

                {/* Ad content */}
                <div className="p-6 space-y-6">
                  {/* Text preview */}
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="bg-muted/10 border border-border rounded-2xl p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap flex-1 shadow-inner">
                      {broadcast.adText}
                    </div>
                  </div>

                  {/* Media */}
                  {broadcast.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden border border-border ml-12 shadow-sm">
                      <img
                        src={
                          broadcast.mediaUrl.startsWith("http")
                            ? broadcast.mediaUrl
                            : `${BASE_URL}${broadcast.mediaUrl}`
                        }
                        alt="Ad Media"
                        className="w-full h-auto max-h-72 object-cover"
                      />
                    </div>
                  )}

                  {/* Rejection reason */}
                  <div className="ml-12 space-y-2">
                    <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                      {t.rejectionReasonPlaceholder}
                    </label>
                    <textarea
                      value={rejectionReason[broadcast.id] || ""}
                      onChange={(e) =>
                        setRejectionReason((prev) => ({
                          ...prev,
                          [broadcast.id]: e.target.value,
                        }))
                      }
                      rows={2}
                      className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                      placeholder={t.rejectionReasonPlaceholder}
                    />
                  </div>

                  {/* Actions */}
                  <div className="ml-12 grid grid-cols-2 gap-4 pt-2">
                    <button
                      onClick={() => handleReject(broadcast.id)}
                      disabled={!!isSubmitting}
                      className="flex items-center justify-center gap-2 bg-background hover:bg-destructive/10 text-destructive border border-destructive/30 hover:border-destructive py-3 px-6 rounded-2xl text-sm font-bold transition-all disabled:opacity-50 active:scale-[0.98]"
                    >
                      {isSubmitting === broadcast.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      {t.rejectAd}
                    </button>
                    <button
                      onClick={() => handleApprove(broadcast.id)}
                      disabled={!!isSubmitting}
                      className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-2xl text-sm font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSubmitting === broadcast.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {t.approveAd}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationPage;
