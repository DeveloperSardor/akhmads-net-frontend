// src/components/ad/TestBotModal.tsx
import { useState } from "react";
import { X, Send, CheckCircle } from "lucide-react";
import adService from "../../services/ad.service";

interface TestBotModalProps {
  ad: any;
  onClose: () => void;
}

const TestBotModal = ({ ad, onClose }: TestBotModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // ✅ Backend will use user's telegramId automatically
      await adService.sendTestAd(ad.id, ''); // Empty string, backend uses auth user's ID
      
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to send test ad");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Send Test Ad</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Preview your ad in Telegram
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Test sent! ✨
              </h3>
              <p className="text-sm text-muted-foreground">
                Check your Telegram messages from @akhmadsnetbot
              </p>
            </div>
          ) : (
            <>
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-foreground font-medium mb-2">
                  {ad.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {ad.text}
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  ℹ️ This test will be sent to your Telegram via <span className="font-semibold">@akhmadsnetbot</span>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-card border border-border hover:bg-muted text-foreground rounded-lg font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground rounded-lg font-semibold transition-all shadow-lg shadow-primary/25 disabled:shadow-none"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Sending..." : "Send Test"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestBotModal;