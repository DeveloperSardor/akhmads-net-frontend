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
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
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
            <span className="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              {broadcasts.length}
            </span>
            <span className="text-gray-500 text-sm">{t.pendingModeration}</span>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-purple-500" />
            <span className="text-gray-600 text-sm">Loading...</span>
          </div>

        /* Empty */
        ) : broadcasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#1f1f1f] flex items-center justify-center mb-5">
              <ShieldCheck className="w-7 h-7 text-gray-600" />
            </div>
            <h3 className="text-white font-semibold text-base mb-1">{t.moderationNoAds}</h3>
            <p className="text-gray-600 text-sm max-w-xs">{t.moderationNoAdsDesc}</p>
          </div>

        /* List */
        ) : (
          <div className="space-y-5">
            {broadcasts.map((broadcast) => (
              <div
                key={broadcast.id}
                className="bg-[#0c0c0c] border border-[#1a1a1a] rounded-2xl overflow-hidden transition-all hover:border-[#2a2a2a]"
              >
                {/* Card header */}
                <div className="px-5 py-4 border-b border-[#1a1a1a] flex flex-wrap items-center justify-between gap-3 bg-[#0e0e0e]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] border border-[#222] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">
                        @{broadcast.bot.username}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-gray-600" />
                        <span className="text-xs text-gray-500">
                          {t.moderationAdvertiser}: {broadcast.advertiser.firstName}
                          {broadcast.advertiser.username && (
                            <span className="text-gray-600"> (@{broadcast.advertiser.username})</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-600" />
                    <span>
                      {broadcast.scheduledAt
                        ? new Date(broadcast.scheduledAt).toLocaleString()
                        : t.moderationAsap}
                    </span>
                  </div>
                </div>

                {/* Ad content */}
                <div className="p-5 space-y-4">
                  {/* Text preview */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] border border-[#222] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-4 text-sm leading-relaxed text-gray-300 whitespace-pre-wrap flex-1">
                      {broadcast.adText}
                    </div>
                  </div>

                  {/* Media */}
                  {broadcast.mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-[#1a1a1a] ml-10">
                      <img
                        src={
                          broadcast.mediaUrl.startsWith("http")
                            ? broadcast.mediaUrl
                            : `${BASE_URL}${broadcast.mediaUrl}`
                        }
                        alt="Ad Media"
                        className="w-full h-auto max-h-56 object-cover"
                      />
                    </div>
                  )}

                  {/* Rejection reason */}
                  <div className="ml-10 space-y-1.5">
                    <label className="text-xs text-gray-600 font-medium">
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
                      className="w-full bg-[#080808] border border-[#1a1a1a] rounded-xl px-3 py-2.5 text-sm text-gray-300 placeholder-gray-700 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                      placeholder={t.rejectionReasonPlaceholder}
                    />
                  </div>

                  {/* Actions */}
                  <div className="ml-10 grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={() => handleReject(broadcast.id)}
                      disabled={!!isSubmitting}
                      className="flex items-center justify-center gap-2 bg-transparent hover:bg-red-500/10 text-red-500 border border-red-500/25 hover:border-red-500/40 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
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
                      className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50"
                    >
                      {isSubmitting === broadcast.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
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
