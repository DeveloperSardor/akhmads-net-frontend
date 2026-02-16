import { useState, useEffect } from "react";
import { Loader2, Rocket, Tag, Info, TrendingUp, Zap, Target, DollarSign } from "lucide-react";
import { useAdStore } from "../../store/adStore";
import { useNavigate } from "react-router-dom";

const BudgetPricing = () => {
  const navigate = useNavigate();
  const {
    formData,
    updateFormData,
    pricingEstimate,
    isSubmitting,
    createAd,
    fetchPricingEstimate,
  } = useAdStore();

  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    fetchPricingEstimate();
  }, [formData.targetImpressions, formData.targeting?.aiSegments, fetchPricingEstimate]);

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

  const handleLaunch = async () => {
    const created = await createAd();
    if (created) {
      navigate("/my-ads");
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const baseCost = pricingEstimate
    ? (pricingEstimate.pricing.baseCPM * formData.targetImpressions) / 1000
    : 0;

  const segmentCost = formData.targeting?.aiSegments?.length
    ? baseCost * 0.4
    : 0;

  const promoDiscount = promoApplied && formData.promoCode ? 30 : 0;
  const total = Math.max(0, baseCost + segmentCost - promoDiscount);

  return (
    <div className="space-y-6">
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
                {formatCurrency(baseCost)}
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

            {/* AI Targeting */}
            {formData.targeting?.aiSegments && formData.targeting.aiSegments.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Target className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">AI Targeting</div>
                    <div className="text-xs text-muted-foreground">
                      {formData.targeting.aiSegments.length} segment{formData.targeting.aiSegments.length > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-yellow-600 tabular-nums">
                  +{formatCurrency(segmentCost)}
                </span>
              </div>
            )}

            {/* Promo */}
            {promoApplied && formData.promoCode && (
              <div className="flex items-center justify-between p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Tag className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Promo Code</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {formData.promoCode}
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600 tabular-nums">
                  -{formatCurrency(promoDiscount)}
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
                  {formatCurrency(total)}
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
          Promo Code
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={promoInput}
            onChange={(e) => {
              setPromoInput(e.target.value.toUpperCase());
              setPromoError("");
            }}
            placeholder="ENTER CODE"
            disabled={promoApplied}
            className="flex-1 px-4 py-3 bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-mono text-foreground placeholder:text-muted-foreground transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleApplyPromo}
            disabled={!promoInput.trim() || promoApplied}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {promoApplied ? "Applied" : "Apply"}
          </button>
        </div>
        {promoError && (
          <p className="text-xs text-destructive mt-2">{promoError}</p>
        )}
      </div>

      {/* Tips */}
      <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Pro Tips</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>• <span className="font-semibold text-foreground">Start Small:</span> Test with $50-100 first</li>
              <li>• <span className="font-semibold text-foreground">Scale Up:</span> Higher budgets unlock premium placements</li>
              <li>• <span className="font-semibold text-foreground">AI Targeting:</span> Costs +40% but delivers 3x better conversion</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Launch Button */}
      <button
        onClick={handleLaunch}
        disabled={isSubmitting || !pricingEstimate}
        className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Creating Campaign...</span>
          </>
        ) : (
          <>
            <Rocket className="w-5 h-5" />
            <span>Launch Advertisement</span>
          </>
        )}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        Your ad will be reviewed within 24 hours
      </p>
    </div>
  );
};

export default BudgetPricing;