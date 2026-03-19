// src/components/ad/BudgetPricing.tsx - FIXED WITH SUBMIT
import { useState, useEffect } from "react";
import {
  Loader2,
  Rocket,
  Info,
  TrendingUp,
  Zap,
  Target,
  DollarSign,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { useAdStore } from "../../store/adStore";
import walletService from "../../services/wallet.service";
import { useNavigate } from "react-router-dom";
import { useTranslations } from "../../hooks/useTranslations";

const BudgetPricing = () => {
  const navigate = useNavigate();
  const {
    formData,
    pricingEstimate,
    isSubmitting,
    createAd,
    submitAd,
    fetchPricingEstimate,
    editAdId,
    updateAndSubmitAd,
  } = useAdStore();
  const t = useTranslations();
  const bp = t.budgetPricing;

  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingWallet, setLoadingWallet] = useState(true);

  useEffect(() => {
    fetchPricingEstimate();
    loadWalletBalance();
  }, [formData.targetImpressions, formData.targeting?.aiSegments]);

  const loadWalletBalance = async () => {
    try {
      const response = await walletService.getWallet();
      setWalletBalance(parseFloat(response.data.wallet.available));
    } catch (error) {
      console.error("Failed to load wallet:", error);
    } finally {
      setLoadingWallet(false);
    }
  };

  const handleLaunch = async () => {
    try {
      if (editAdId) {
        // Edit mode: update existing ad content + submit for review
        const result = await updateAndSubmitAd(editAdId);
        if (!result) return; // error already set in store
      } else {
        // Create mode: create new ad (DRAFT) then submit
        const createdAd = await createAd();
        if (!createdAd || !createdAd.id) return;
        await submitAd(createdAd.id);
      }
      navigate("/my-ads");
    } catch (error) {
      console.error("Launch failed:", error);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const totalCost = pricingEstimate?.pricing?.totalCost || 0;
  const hasBalance = walletBalance >= totalCost;

  return (
    <div className="space-y-6">
      {/* Wallet Balance */}
      <div className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              {bp?.walletBalance ?? "Wallet Balance"}
            </h3>
          </div>
          {loadingWallet ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <span className="text-2xl font-bold text-primary tabular-nums">
              {formatCurrency(walletBalance)}
            </span>
          )}
        </div>

        {!loadingWallet && !hasBalance && totalCost > 0 && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-xs text-destructive">
              <strong>
                {bp?.insufficientBalanceText1 ??
                  "Insufficient balance. You need"}{" "}
              </strong>
              {formatCurrency(totalCost - walletBalance)}{" "}
              {bp?.insufficientBalanceText2 ?? "more to launch this campaign."}
              <button
                onClick={() => navigate("/wallet")}
                className="ml-2 underline font-semibold hover:no-underline"
              >
                {bp?.addFunds ?? "Add Funds"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cost Breakdown */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <label className="text-sm font-semibold text-foreground">
            {bp?.costBreakdown ?? "Cost Breakdown"}
          </label>
        </div>

        {pricingEstimate ? (
          <div className="space-y-3">
            {/* Base Cost */}
            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Target className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {bp?.baseCampaign ?? "Base Campaign"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${pricingEstimate.pricing.baseCPM}{" "}
                    {bp?.per1k ?? "per 1K impressions"}
                  </div>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {formatCurrency(
                  (pricingEstimate.pricing.baseCPM *
                    formData.targetImpressions) /
                    1000,
                )}
              </span>
            </div>

            {/* Impressions */}
            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {bp?.targetImpressions ?? "Target Impressions"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {bp?.expectedReach ?? "Expected reach"}
                  </div>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {formData.targetImpressions.toLocaleString()}
              </span>
            </div>

            {/* Platform Fee */}
            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <DollarSign className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {bp?.platformFee ?? "Platform Fee"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {bp?.serviceCharge ?? "Service charge"}
                  </div>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {formatCurrency(pricingEstimate.pricing.platformFee)}
              </span>
            </div>

            {/* Total */}
            <div className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {bp?.totalInvestment ?? "Total Investment"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {bp?.campaignCost ?? "Campaign cost"}
                  </div>
                </div>
                <div className="text-4xl font-bold text-primary tabular-nums">
                  {formatCurrency(totalCost)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-16 bg-card border border-border rounded-xl text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {bp?.calculatingPricing ?? "Calculating pricing..."}
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              {bp?.whatHappensNext ?? "What Happens Next?"}
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>
                •{" "}
                <span className="font-semibold text-foreground">
                  {bp?.submitWait
                    ? bp.submitWait.split(":")[0] + ":"
                    : "Submit:"}
                </span>{" "}
                {bp?.submitWait
                  ? bp.submitWait.split(":")[1]
                  : "Your ad goes to moderation"}
              </li>
              <li>
                •{" "}
                <span className="font-semibold text-foreground">
                  {bp?.reviewText
                    ? bp.reviewText.split(":")[0] + ":"
                    : "Review:"}
                </span>{" "}
                {bp?.reviewText
                  ? bp.reviewText.split(":")[1]
                  : "We check content (usually <24h)"}
              </li>
              <li>
                •{" "}
                <span className="font-semibold text-foreground">
                  {bp?.approvedText
                    ? bp.approvedText.split(":")[0] + ":"
                    : "Approved:"}
                </span>{" "}
                {bp?.approvedText
                  ? bp.approvedText.split(":")[1]
                  : "Campaign goes live automatically"}
              </li>
              <li>
                •{" "}
                <span className="font-semibold text-foreground">
                  {bp?.paymentText
                    ? bp.paymentText.split(":")[0] + ":"
                    : "Payment:"}
                </span>{" "}
                {bp?.paymentText
                  ? bp.paymentText.split(":")[1]
                  : "Charged only after approval"}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleLaunch}
        disabled={
          isSubmitting || !pricingEstimate || !hasBalance || loadingWallet
        }
        className="w-full py-4 bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>
              {editAdId
                ? (bp?.savingAndResending ?? "Saving and resending...")
                : (bp?.submitting ?? "Submitting...")}
            </span>
          </>
        ) : (
          <>
            <Rocket className="w-5 h-5" />
            <span>
              {editAdId
                ? (bp?.saveAndResend ?? "Save and resend")
                : (bp?.submitForReview ?? "Submit for Review")}
            </span>
          </>
        )}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        {bp?.fundsReservedNote ??
          "Funds will be reserved from your wallet. You'll be charged only after approval."}
      </p>
    </div>
  );
};

export default BudgetPricing;
