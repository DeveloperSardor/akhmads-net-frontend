import { Sparkles, TrendingUp, Zap } from "lucide-react";
import { useAdStore } from "../../store/adStore";

const AIRecommendations = () => {
  const { formData, updateFormData } = useAdStore();

  const recommendations = [
    {
      type: "headline",
      icon: Sparkles,
      label: "Optimize Headline",
      value: "Ajoyib taklifni qo'ldan boy bermang!",
      impact: "+45%",
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      type: "length",
      icon: TrendingUp,
      label: "Shorten Text",
      value: "Shorter messages perform 32% better",
      impact: "+32%",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      type: "timing",
      icon: Zap,
      label: "Optimal Time",
      value: "Post between 18:00-21:00",
      impact: "+28%",
      color: "text-green-500 bg-green-500/10",
    },
  ];

  const handleApply = (type: string) => {
    if (type === "headline") {
      updateFormData({
        title: "Ajoyib taklifni qo'ldan boy bermang!",
      });
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">AI Suggestions</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {recommendations.map((rec, index) => {
          const Icon = rec.icon;
          return (
            <div
              key={index}
              className="group p-4 bg-muted/30 hover:bg-muted/50 border border-border/50 rounded-lg transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 ${rec.color} rounded-lg`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-foreground">{rec.label}</h4>
                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded">
                      {rec.impact}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rec.value}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleApply(rec.type)}
                className="w-full py-2 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-sm font-medium rounded-lg transition-all"
              >
                Apply
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">AI-powered</span> • Based on 10M+ campaigns
        </p>
      </div>
    </div>
  );
};

export default AIRecommendations;