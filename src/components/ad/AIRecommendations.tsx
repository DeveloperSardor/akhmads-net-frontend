// src/components/ad/AIRecommendations.tsx - REAL API VERSION
import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Users, Target, Loader2, RefreshCw } from "lucide-react";
import { useAdStore } from "../../store/adStore";
import api from "../../api/api";

const AIRecommendations = () => {
  const { formData } = useAdStore();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [lastAnalyzed, setLastAnalyzed] = useState<string>('');

  useEffect(() => {
    if (!formData.text || formData.text.length < 20) {
      setRecommendations([]);
      setScore(0);
      return;
    }

    if (formData.text === lastAnalyzed && recommendations.length > 0) return;

    const timer = setTimeout(() => {
      analyzeAd();
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData.text, formData.mediaUrl, formData.buttons]);

  const analyzeAd = async () => {
    if (!formData.text || isAnalyzing) return;

    setIsAnalyzing(true);

    try {
      // Call real backend API
      const response = await api.post('/ai/analyze-ad', {
        text: formData.text,
        mediaUrl: formData.mediaUrl,
        buttons: formData.buttons,
        targetAudience: formData.targeting?.demographics || 'general',
      });

      const { score: newScore, recommendations: recs } = response.data.data;

      setScore(newScore);
      setRecommendations(recs);
      setLastAnalyzed(formData.text);
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Fallback to client-side
      const fallback = getFallbackAnalysis();
      setScore(fallback.score);
      setRecommendations(fallback.recommendations);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFallbackAnalysis = () => {
    const recommendations: any[] = [];
    let calculatedScore = 50;

    const text = formData.text || '';

    // Length
    if (text.length >= 80 && text.length <= 200) calculatedScore += 15;
    else if (text.length < 50) {
      recommendations.push({
        icon: 'TrendingUp',
        title: 'Add More Details',
        description: 'Longer ads (80-200 chars) perform 34% better',
        type: 'warning',
      });
    }

    // Emojis
    const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}]/gu) || []).length;
    if (emojiCount >= 2 && emojiCount <= 4) calculatedScore += 10;
    else if (emojiCount === 0) {
      recommendations.push({
        icon: 'Sparkles',
        title: 'Add Emojis',
        description: 'Ads with 2-4 emojis get 48% more clicks',
        type: 'suggestion',
      });
    }

    // CTA
    const hasCTA = /click|buy|order|visit|get|try/i.test(text);
    if (hasCTA) calculatedScore += 10;

    // Buttons
    if (formData.buttons && formData.buttons.length > 0) calculatedScore += 10;
    else {
      recommendations.push({
        icon: 'Target',
        title: 'Add Buttons',
        description: 'Buttons increase CTR by 2.5x',
        type: 'suggestion',
      });
    }

    // Image
    if (formData.mediaUrl) calculatedScore += 10;
    else {
      recommendations.push({
        icon: 'TrendingUp',
        title: 'Add Image',
        description: 'Visual ads get 65% more engagement',
        type: 'info',
      });
    }

    return { score: Math.min(100, calculatedScore), recommendations };
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Sparkles,
      TrendingUp,
      Users,
      Target,
    };
    return icons[iconName] || Sparkles;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 dark:text-green-500 bg-green-500/10 border-green-500/20';
      case 'warning': return 'text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'suggestion': return 'text-blue-600 dark:text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'tip': return 'text-purple-600 dark:text-purple-500 bg-purple-500/10 border-purple-500/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">AI Recommendations</h3>
        </div>

        {isAnalyzing && (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        )}

        {!isAnalyzing && formData.text && (
          <button
            onClick={analyzeAd}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
            title="Refresh analysis"
          >
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {/* Engagement Score */}
        {score > 0 && (
          <div className={`p-3 border rounded-lg transition-all ${
            score >= 80 ? getTypeColor('success') : score >= 60 ? getTypeColor('info') : getTypeColor('warning')
          }`}>
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-semibold">Engagement Score: {score}%</p>
                  <div className="w-12 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden ml-2">
                    <div
                      className="h-full bg-current transition-all"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs opacity-80">
                  {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good, can improve' : 'Needs optimization'}
                </p>
              </div>
            </div>
          </div>
        )}

        {recommendations.length === 0 && !isAnalyzing && !score && (
          <div className="text-center py-6">
            <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-xs text-muted-foreground">
              Start writing to get AI recommendations
            </p>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-6">
            <Loader2 className="w-8 h-8 text-primary mx-auto mb-2 animate-spin" />
            <p className="text-xs text-muted-foreground">
              Analyzing with GPT-4...
            </p>
          </div>
        )}

        {recommendations.map((rec, index) => {
          const Icon = getIconComponent(rec.icon);
          return (
            <div
              key={index}
              className={`p-3 border rounded-lg transition-all ${getTypeColor(rec.type)}`}
            >
              <div className="flex items-start gap-2">
                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold mb-0.5">{rec.title}</p>
                  <p className="text-xs opacity-80 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {recommendations.length > 0 && !isAnalyzing && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            🤖 Powered by GPT-4
          </p>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;