// src/components/ad/AITextOptimizer.tsx
import { useState } from "react";
import { Sparkles, Loader2, Check, X, RefreshCw } from "lucide-react";
import api from "../../api/api";

interface AITextOptimizerProps {
  text: string;
  onApply: (optimizedText: string) => void;
  language?: 'uz' | 'ru' | 'en';
}

const AITextOptimizer = ({ text, onApply, language = 'uz' }: AITextOptimizerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (!text || text.length < 10) {
      setError('Text must be at least 10 characters');
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      const response = await api.post('/ai/optimize-text', {
        text,
        language,
        targetAudience: 'general',
        tone: 'professional',
      });

      setResult(response.data.data);
      setIsOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to optimize text');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApply = () => {
    if (result?.optimized) {
      onApply(result.optimized);
      setIsOpen(false);
      setResult(null);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setResult(null);
    setError(null);
  };

  if (!isOpen) {
    return (
      <div className="space-y-2">
        <button
          onClick={handleOptimize}
          disabled={isOptimizing || !text || text.length < 10}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Optimize with AI
            </>
          )}
        </button>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <X className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Optimization</h3>
              <p className="text-xs text-muted-foreground">Your text has been improved</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Comparison */}
        <div className="p-4 space-y-4">
          {/* Original */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-muted-foreground">
                Original Text
              </label>
              <span className="text-xs text-muted-foreground">
                {result?.original?.length} characters
              </span>
            </div>
            <div className="p-4 bg-muted/50 border border-border rounded-xl">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {result?.original}
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <div className="p-2 bg-primary/10 rounded-full">
              <RefreshCw className="w-5 h-5 text-primary" />
            </div>
          </div>

          {/* Optimized */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-primary">
                ✨ Optimized Text
              </label>
              <span className="text-xs text-primary">
                {result?.optimized?.length} characters
              </span>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-primary/30 rounded-xl">
              <p className="text-sm text-foreground whitespace-pre-wrap font-medium">
                {result?.optimized}
              </p>
            </div>
          </div>

          {/* Improvements */}
          {result?.improvements && result.improvements.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                What Changed:
              </label>
              <div className="space-y-2">
                {result.improvements.map((improvement: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                  >
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-600 dark:text-green-500">{improvement}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result?.suggestions && result.suggestions.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                AI Suggestions:
              </label>
              <ul className="space-y-1">
                {result.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-card flex items-center justify-between gap-3 p-4 border-t border-border">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-xl transition-all"
          >
            Keep Original
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Apply Optimized
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITextOptimizer;