// src/components/ad/BudgetPricing.tsx - FIXED WITH SUBMIT
import { useState, useEffect } from "react";
import { Loader2, Rocket, Tag, Info, TrendingUp, Zap, Target, DollarSign, Wallet, AlertCircle } from "lucide-react";
import { useAdStore } from "../../store/adStore";
import { useAuthStore } from "../../store/authStore";
import walletService from "../../services/wallet.service";
import { useNavigate } from "react-router-dom";

const BudgetPricing = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    formData,
    updateFormData,
    pricingEstimate,
    isSubmitting,
    createAd,
    submitAd,
    currentAd,
    fetchPricingEstimate,
  } = useAdStore();

  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
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
      console.error('Failed to load wallet:', error);
    } finally {
      setLoadingWallet(false);
    }
  };

  const handleApplyPromo = () => {
    if (!promoInput.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    if (promoInput.trim().length < 4) {
      setPromoError("Invalid promo code");
      return;
    }

    updateFormData({ promoCode: promoInput });
    setPromoApplied(true);
    setPromoError("");
    fetchPricingEstimate();
  };

  // ✅ FIXED - CREATE + SUBMIT FLOW
  const handleLaunch = async () => {
    try {
      // Step 1: Create ad (DRAFT)
      const created = await createAd();
      if (!created || !currentAd) {
        return;
      }

      // Step 2: Submit for review (PENDING_REVIEW + wallet reserve)
      await submitAd(currentAd.id);
      
      // Step 3: Navigate to My Ads
      navigate("/my-ads");
    } catch (error) {
      console.error('Launch failed:', error);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const totalCost = pricingEstimate?.pricing?.totalCost || 0;
  const hasBalance = walletBalance >= totalCost;

  return (
    <div className="space-y-6">
      {/* Wallet Balance */}
      <div className="p-5 bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Wallet Balance</h3>
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
              <strong>Insufficient balance.</strong> You need {formatCurrency(totalCost - walletBalance)} more to launch this campaign.
              <button
                onClick={() => navigate('/wallet')}
                className="ml-2 underline font-semibold hover:no-underline"
              >
                Add Funds
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
            Cost Breakdown
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
                  <div className="text-sm font-medium text-foreground">Base Campaign</div>
                  <div className="text-xs text-muted-foreground">
                    ${pricingEstimate.pricing.baseCPM} per 1K impressions
                  </div>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {formatCurrency((pricingEstimate.pricing.baseCPM * formData.targetImpressions) / 1000)}
              </span>
            </div>

            {/* Impressions */}
            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Zap className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">Target Impressions</div>
                  <div className="text-xs text-muted-foreground">Expected reach</div>
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
                  <div className="text-sm font-medium text-foreground">Platform Fee</div>
                  <div className="text-xs text-muted-foreground">Service charge</div>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {formatCurrency(pricingEstimate.pricing.platformFee)}
              </span>
            </div>

            {/* Promo Discount */}
            {pricingEstimate.pricing.discount > 0 && (
              <div className="flex items-center justify-between p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Tag className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Promo Discount</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {formData.promoCode}
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600 tabular-nums">
                  -{formatCurrency(pricingEstimate.pricing.discount)}
                </span>
              </div>
            )}

            {/* Total */}
            <div className="p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Investment</div>
                  <div className="text-xs text-muted-foreground">Campaign cost</div>
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
            <p className="text-sm text-muted-foreground">Calculating pricing...</p>
          </div>
        )}
      </div>

      {/* Promo Code */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
          <Tag className="w-4 h-4 text-muted-foreground" />
          Promo Code (Optional)
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={promoInput}
            onChange={(e) => {
              setPromoInput(e.target.value.toUpperCase());
              setPromoError("");
              setPromoApplied(false);
            }}
            placeholder="ENTER CODE"
            className="flex-1 px-4 py-3 bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-mono text-foreground placeholder:text-muted-foreground transition-all outline-none"
          />
          <button
            onClick={handleApplyPromo}
            disabled={!promoInput.trim()}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Apply
          </button>
        </div>
        {promoError && (
          <p className="text-xs text-destructive mt-2">{promoError}</p>
        )}
        {promoApplied && (
          <p className="text-xs text-green-600 mt-2">✓ Promo code applied! Recalculating...</p>
        )}
      </div>

      {/* Tips */}
      <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">What Happens Next?</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>• <span className="font-semibold text-foreground">Submit:</span> Your ad goes to moderation</li>
              <li>• <span className="font-semibold text-foreground">Review:</span> We check content (usually &lt;24h)</li>
              <li>• <span className="font-semibold text-foreground">Approved:</span> Campaign goes live automatically</li>
              <li>• <span className="font-semibold text-foreground">Payment:</span> Charged only after approval</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleLaunch}
        disabled={isSubmitting || !pricingEstimate || !hasBalance || loadingWallet}
        className="w-full py-4 bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Submitting for Review...</span>
          </>
        ) : (
          <>
            <Rocket className="w-5 h-5" />
            <span>Submit for Review</span>
          </>
        )}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        Funds will be reserved from your wallet. You'll be charged only after approval.
      </p>
    </div>
  );
};

export default BudgetPricing;