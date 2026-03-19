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

  const getButtonColor = (color: string = "blue") => {
    const colorConfig = BUTTON_COLORS.find((c) => c.value === color);
    return colorConfig?.telegram || "#2196F3";
  };

  const formatText = (text: string) => {
    if (!text) return "";
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // ✅ Handle <tg-emoji> tags
    formatted = formatted.replace(
      /<tg-emoji emoji-id="(.*?)">(.*?)<\/tg-emoji>/g,
      (match, id, fallback) => {
        return `<span class="premium-emoji-placeholder" title="Premium Emoji: ${id}">${fallback}<span class="premium-star-icon">⭐</span></span>`;
      },
    );

    formatted = formatted.replace(/\n/g, "<br />");
    return formatted;
  };

  const hasContent =
    formData.text ||
    formData.mediaUrl ||
    (formData.buttons && formData.buttons.length > 0);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            {lp?.title ?? "Live Preview"}
          </h3>
        </div>

        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded transition-all ${
              device === "mobile"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded transition-all ${
              device === "desktop"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        className={`relative ${device === "mobile" ? "max-w-[320px]" : "max-w-full"} mx-auto overflow-hidden rounded-xl border border-border shadow-2xl`}
      >
        <div style={{ backgroundColor: "#ffffff" }} className="p-3">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">AD</span>
            </div>
            <div>
              <div
                style={{ color: "#111827" }}
                className="text-sm font-semibold tracking-tight"
              >
                {lp?.adLabel ?? "Your Advertisement"}
              </div>
              <div
                style={{ color: "#6B7280" }}
                className="text-[10px] font-medium uppercase tracking-wider"
              >
                {lp?.sponsored ?? "Sponsored"}
              </div>
            </div>
          </div>

          {/* Content */}
          {hasContent ? (
            <div className="space-y-3">
              {formData.text && (
                <div
                  style={{ color: "#111827" }}
                  className="text-sm leading-relaxed whitespace-pre-wrap break-words break-all"
                  dangerouslySetInnerHTML={{
                    __html: formatText(formData.text),
                  }}
                />
              )}

              {formData.buttons && formData.buttons.length > 0 && (
                <div className="space-y-2">
                  {formData.buttons.map(
                    (button, index) =>
                      button.text && (
                        <button
                          key={index}
                          className="w-full py-2.5 px-4 rounded-lg text-white text-sm font-bold transition-all hover:opacity-90 shadow-sm"
                          style={{
                            backgroundColor: getButtonColor(button.color),
                          }}
                        >
                          {button.text}
                        </button>
                      ),
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Eye className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm italic">
                {lp?.emptyHint ?? "Start creating your ad to see preview"}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span
                style={{ color: "#9CA3AF" }}
                className="text-[10px] font-medium uppercase tracking-widest"
              >
                {lp?.telegramAd ?? "Telegram Ad"}
              </span>
              <span
                style={{ color: "#9CA3AF" }}
                className="text-[10px] font-medium tabular-nums"
              >
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 p-2 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            {lp?.appearHint ?? "This is how your ad will appear in Telegram"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
