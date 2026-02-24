// src/components/ad/LivePreview.tsx
import { useState } from "react";
import { Eye, Smartphone, Monitor } from "lucide-react";
import { useAdStore } from "../../store/adStore";
import { BUTTON_COLORS } from "./ButtonColorPicker";
import { useTranslations } from "../../hooks/useTranslations";

const LivePreview = () => {
  const { formData } = useAdStore();
  const t = useTranslations();
  const lp = t.livePreview;

  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");

  const getButtonColor = (color: string = 'blue') => {
    const colorConfig = BUTTON_COLORS.find(c => c.value === color);
    return colorConfig?.telegram || '#2196F3';
  };

  const formatText = (text: string) => {
    if (!text) return '';
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/\n/g, '<br />');
    return formatted;
  };

  const hasContent = formData.text || formData.mediaUrl || (formData.buttons && formData.buttons.length > 0);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            {lp?.title ?? 'Live Preview'}
          </h3>
        </div>

        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded transition-all ${device === 'mobile'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded transition-all ${device === 'desktop'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className={`relative ${device === 'mobile' ? 'max-w-[320px]' : 'max-w-full'} mx-auto`}>
        <div className="bg-[#0e1621] rounded-xl p-3 shadow-2xl">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AD</span>
            </div>
            <div>
              <div className="text-white text-sm font-medium">
                {lp?.adLabel ?? 'Your Advertisement'}
              </div>
              <div className="text-white/50 text-xs">
                {lp?.sponsored ?? 'Sponsored'}
              </div>
            </div>
          </div>

          {hasContent ? (
            <div className="space-y-3">
              {formData.mediaUrl && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={formData.mediaUrl}
                    alt="Ad preview"
                    className="w-full h-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {formData.text && (
                <div
                  className="text-white text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formatText(formData.text) }}
                />
              )}

              {formData.buttons && formData.buttons.length > 0 && (
                <div className="space-y-2">
                  {formData.buttons.map((button, index) => (
                    button.text && (
                      <button
                        key={index}
                        className="w-full py-2.5 px-4 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
                        style={{ backgroundColor: getButtonColor(button.color) }}
                      >
                        {button.text}
                      </button>
                    )
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Eye className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">
                {lp?.emptyHint ?? 'Start creating your ad to see preview'}
              </p>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">{lp?.telegramAd ?? 'Telegram Ad'}</span>
              <span className="text-white/40">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 p-2 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            {lp?.appearHint ?? 'This is how your ad will appear in Telegram'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;