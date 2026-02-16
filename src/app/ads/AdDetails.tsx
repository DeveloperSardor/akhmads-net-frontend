import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  MousePointerClick,
  TrendingUp,
  DollarSign,
  Download,
  Loader2,
  Calendar,
  Users,
} from "lucide-react";
import { useAdStore } from "../../store/adStore";
import adService from "../../services/ad.service";
import type { AdPerformance } from "../../types/ad.types";

const AdDetails = () => {
  const { adId } = useParams<{ adId: string }>();
  const navigate = useNavigate();
  const { currentAd, isLoading, fetchAdById } = useAdStore();

  const [performance, setPerformance] = useState<AdPerformance | null>(null);
  const [loadingPerformance, setLoadingPerformance] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (adId) {
      fetchAdById(adId);
      loadPerformance();
    }
  }, [adId]);

  const loadPerformance = async () => {
    if (!adId) return;

    setLoadingPerformance(true);
    try {
      const response = await adService.getAdPerformance(adId);
      setPerformance(response.data.performance);
    } catch (error) {
      console.error("Failed to load performance:", error);
    } finally {
      setLoadingPerformance(false);
    }
  };

  const handleExport = async () => {
    if (!adId) return;

    setExporting(true);
    try {
      const blob = await adService.exportImpressions(adId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `campaign-${adId}-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to export:", error);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => `$${Number(amount || 0).toFixed(2)}`;
  const formatNumber = (num: number) => Number(num || 0).toLocaleString();

  if (isLoading || !currentAd) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
        <p className="text-muted-foreground text-sm">Loading details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/my-ads")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to campaigns
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-3">
                {currentAd.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(currentAd.createdAt).toLocaleDateString()}</span>
                </div>
                <span>•</span>
                <span>ID: {currentAd.id}</span>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-primary/25"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export Data</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Impressions
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground mb-2 tabular-nums">
              {formatNumber(currentAd.deliveredImpressions)}
            </div>
            <div className="text-sm text-muted-foreground">
              of {formatNumber(currentAd.targetImpressions)} target
            </div>
            <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(currentAd.deliveredImpressions / currentAd.targetImpressions) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <MousePointerClick className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Clicks
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground mb-2 tabular-nums">
              {formatNumber(currentAd.clicks)}
            </div>
            <div className="text-sm text-muted-foreground">Total engagements</div>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                CTR
              </span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2 tabular-nums">{currentAd.ctr}%</div>
            <div className="text-sm text-muted-foreground">Click-through rate</div>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-green-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Spent
              </span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2 tabular-nums">
              {formatCurrency(currentAd.totalCost - currentAd.remainingBudget)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(currentAd.remainingBudget)} remaining
            </div>
          </div>
        </div>

        {/* Performance Table */}
        {loadingPerformance ? (
          <div className="p-20 bg-card border border-border rounded-xl text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Loading performance data...</p>
          </div>
        ) : performance ? (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
                Performance by Bot
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Bot
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Audience
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Impressions
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {performance.botBreakdown.map((item) => (
                    <tr
                      key={item.bot.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-semibold text-foreground">
                            {item.bot.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-foreground">
                              @{item.bot.username}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.bot.firstName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground tabular-nums">
                            {formatNumber(item.bot.totalMembers)}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <span className="font-semibold text-sm text-foreground tabular-nums">
                          {formatNumber(item.impressions)}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <span className="font-semibold text-sm text-green-600 tabular-nums">
                          {formatCurrency(item.revenue)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdDetails;