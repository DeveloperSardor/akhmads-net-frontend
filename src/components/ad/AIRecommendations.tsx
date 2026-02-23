// src/components/ad/AIRecommendations.tsx
import { useMemo } from "react";
import { Sparkles, TrendingUp, Users, Target } from "lucide-react";
import { useAdStore } from "../../store/adStore";

const AIRecommendations = () => {
  const { formData } = useAdStore();

  const countEmojis = (text: string) => {
    if (!text) return 0;
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    return (text.match(emojiRegex) || []).length;
  };

  const hasCallToAction = (text: string) =>
    /click|buy|order|visit|get|try|download|subscribe|join|learn|discover|shop|grab|claim/i.test(text);

  const hasUrgency = (text: string) =>
    /limited|today|now|hurry|offer|sale|discount|%|off|ends|expires|last chance/i.test(text);

  const { score, recommendations } = useMemo(() => {
    const text = formData.text || '';
    const { mediaUrl, buttons } = formData;

    let score = 50;
    const recommendations: any[] = [];

    // Text length
    if (text.length >= 80 && text.length <= 200) score += 15;
    else if (text.length >= 50) score += 10;
    else if (text.length >= 20) score += 5;

    if (text.length > 0 && text.length < 50) {
      recommendations.push({
        icon: 'TrendingUp',
        title: 'Expand Your Message',
        description: 'Ads with 80-200 characters perform 34% better',
        type: 'warning',
      });
    }

    // Emojis
    const emojiCount = countEmojis(text);
    if (emojiCount >= 2 && emojiCount <= 4) score += 10;
    else if (emojiCount >= 1) score += 5;

    if (text.length >= 20 && emojiCount === 0) {
      recommendations.push({
        icon: 'Sparkles',
        title: 'Add Emojis',
        description: 'Ads with 2-4 emojis get 48% more clicks',
        type: 'suggestion',
      });
    }

    // CTA & Urgency
    if (hasCallToAction(text)) score += 10;
    if (hasUrgency(text)) score += 5;

    // Buttons
    if (buttons && buttons.length > 0) score += 10;
    else if (text.length >= 20) {
      recommendations.push({
        icon: 'Target',
        title: 'Add Call-to-Action Button',
        description: 'Buttons increase CTR by 2.5x',
        type: 'suggestion',
      });
    }

    // Image
    if (mediaUrl) score += 10;
    else if (text.length >= 20) {
      recommendations.push({
        icon: 'TrendingUp',
        title: 'Add Visual Content',
        description: 'Ads with images get 65% more engagement',
        type: 'info',
      });
    }

    return { score: Math.min(100, score), recommendations };
  }, [formData.text, formData.mediaUrl, formData.buttons]);

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = { Sparkles, TrendingUp, Users, Target };
    return icons[iconName] || Sparkles;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'suggestion': return 'text-blue-600 dark:text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'tip': return 'text-purple-600 dark:text-purple-500 bg-purple-500/10 border-purple-500/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  const isEmpty = (formData.text?.length || 0) < 10;

  return (
    <div className="bg-card border border-border rounded-xl p-4 relative z-0">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Recommendations</h3>
      </div>

      <div className="space-y-2.5">
        {/* Score */}
        {!isEmpty && (
          <div className={`p-3 border rounded-lg ${
            score >= 80
              ? 'text-green-600 dark:text-green-500 bg-green-500/10 border-green-500/20'
              : score >= 60
              ? 'text-blue-600 dark:text-blue-500 bg-blue-500/10 border-blue-500/20'
              : 'text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
          }`}>
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-semibold">Engagement Score: {score}%</p>
                  <div className="w-12 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden ml-2">
                    <div className="h-full bg-current transition-all" style={{ width: `${score}%` }} />
                  </div>
                </div>
                <p className="text-xs opacity-80">
                  {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good, can improve' : 'Needs optimization'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="text-center py-6">
            <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-xs text-muted-foreground">
              Start writing to get recommendations
            </p>
          </div>
        )}

        {/* Recommendations list */}
        {recommendations.map((rec, index) => {
          const Icon = getIconComponent(rec.icon);
          return (
            <div key={index} className={`p-3 border rounded-lg ${getTypeColor(rec.type)}`}>
              <div className="flex items-start gap-2">
                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold mb-0.5">{rec.title}</p>
                  <p className="text-xs opacity-80 leading-relaxed">{rec.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIRecommendations;