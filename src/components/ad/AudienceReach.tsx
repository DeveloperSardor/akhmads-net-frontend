import { useState } from "react";
import { Check, Users, Target } from "lucide-react";
import { useAdStore } from "../../store/adStore";

const AudienceReach = () => {
  const { formData, updateFormData, targetingOptions } = useAdStore();
  const [selectedSegments, setSelectedSegments] = useState<string[]>(
    formData.targeting?.aiSegments || []
  );

  const quickReaches = [
    { value: 1000, label: "1K" },
    { value: 5000, label: "5K" },
    { value: 10000, label: "10K" },
    { value: 50000, label: "50K" },
  ];

  const handleSegmentToggle = (segmentId: string) => {
    const newSegments = selectedSegments.includes(segmentId)
      ? selectedSegments.filter((id) => id !== segmentId)
      : [...selectedSegments, segmentId];

    setSelectedSegments(newSegments);
    updateFormData({
      targeting: {
        ...formData.targeting,
        aiSegments: newSegments,
      },
    });
  };

  // ✅ FIXED - Add null check
  const formatNumber = (num: number | undefined) => {
    if (!num && num !== 0) return "0"; // Handle undefined/null
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
    return num.toString();
  };

  const estimatedReach = Math.floor(
    formData.targetImpressions * (selectedSegments.length > 0 ? 0.7 : 1)
  );

  const percentage = ((formData.targetImpressions - 100) / (100000 - 100)) * 100;

  // ✅ Default segments if API not loaded
  const defaultSegments = [
    {
      id: "tech",
      nameEn: "Tech Enthusiasts",
      description: "Users who frequently interact with technology-related content and news",
      estimatedReach: 45000,
      multiplier: 1.4,
    },
    {
      id: "shoppers",
      nameEn: "Active Shoppers",
      description: "Users who have shown high engagement with e-commerce and shopping bots",
      estimatedReach: 32000,
      multiplier: 1.3,
    },
    {
      id: "gamers",
      nameEn: "Gamers",
      description: "Users interested in gaming content, game bots, and gaming communities",
      estimatedReach: 28000,
      multiplier: 1.35,
    },
    {
      id: "crypto",
      nameEn: "Crypto Traders",
      description: "Users who engage with cryptocurrency news, trading bots, and blockchain content",
      estimatedReach: 19000,
      multiplier: 1.5,
    },
  ];

  const segments = targetingOptions?.aiSegments || defaultSegments;

  return (
    <div className="space-y-8">
      {/* Target Impressions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-muted-foreground" />
          <label className="text-sm font-semibold text-foreground">
            Target Impressions
          </label>
        </div>

        {/* Quick Selection */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {quickReaches.map((reach) => {
            const isActive = formData.targetImpressions === reach.value;
            return (
              <button
                key={reach.value}
                onClick={() => updateFormData({ targetImpressions: reach.value })}
                className={`relative py-4 px-3 rounded-xl border transition-all ${
                  isActive
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <div className="text-center">
                  <div className={`text-xl font-bold mb-1 ${isActive ? "" : ""}`}>
                    {reach.label}
                  </div>
                  <div className="text-xs opacity-80">users</div>
                </div>
                {isActive && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Slider */}
        <div className="p-5 bg-card border border-border rounded-xl">
          <label className="block text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wide">
            Custom Amount
          </label>
          
          <div className="mb-6">
            <input
              type="range"
              min="100"
              max="100000"
              step="100"
              value={formData.targetImpressions}
              onChange={(e) =>
                updateFormData({ targetImpressions: parseInt(e.target.value) })
              }
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  var(--primary) 0%, 
                  var(--primary) ${percentage}%, 
                  var(--border) ${percentage}%, 
                  var(--border) 100%)`,
              }}
            />
            <style>{`
              input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: var(--primary);
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
                transition: all 0.2s;
              }
              input[type="range"]::-webkit-slider-thumb:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.6);
              }
              input[type="range"]::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border: none;
                border-radius: 50%;
                background: var(--primary);
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
              }
            `}</style>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>100</span>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground tabular-nums">
                {formatNumber(formData.targetImpressions)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">target users</div>
            </div>
            <span>100K</span>
          </div>
        </div>
      </div>

      {/* AI Targeting */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">AI-Powered Targeting</h3>
          <span className="px-2 py-0.5 bg-gradient-to-r from-primary to-purple-500 text-white text-xs font-bold rounded uppercase tracking-wide">
            Smart
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          Reach the right audience with AI-driven behavioral segmentation
        </p>

        <div className="space-y-3">
          {segments.map((segment) => {
            const isSelected = selectedSegments.includes(segment.id);

            return (
              <button
                key={segment.id}
                onClick={() => handleSegmentToggle(segment.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-border/80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-border"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground mb-1">
                      {segment.nameEn}
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed mb-2">
                      {segment.description}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span>~{formatNumber(segment.estimatedReach)} potential users</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Summary */}
        {selectedSegments.length > 0 && (
          <div className="mt-5 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground mb-0.5">
                  {selectedSegments.length} segment{selectedSegments.length > 1 ? "s" : ""} selected
                </div>
                <div className="text-xs text-muted-foreground">
                  Expected +{selectedSegments.length * 15}% conversion boost
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-primary font-medium mb-0.5">Est. Reach</div>
                <div className="text-2xl font-bold text-foreground tabular-nums">
                  {formatNumber(estimatedReach)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudienceReach;