// src/components/ad/AdComposer.tsx - FINAL PROFESSIONAL VERSION
import { useState, useEffect } from "react";
import { FileText, Image as ImageIcon, Link2, Upload, X, Loader2, Sparkles, Wand2, Send } from "lucide-react";
import { useAdStore } from "../../store/adStore";
import api from "../../api/api";
import ButtonColorPicker from "./ButtonColorPicker";
import AITextOptimizer from "./AITextOptimizer";
import TelegramEmojiPicker from "./TelegramEmojiPicker";

const AdComposer = () => {
  const { formData, updateFormData } = useAdStore();
  const [preview, setPreview] = useState<string | null>(formData.mediaUrl || null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sendingPreview, setSendingPreview] = useState(false);
  const [hasPremium, setHasPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);

  // Check Telegram Premium status on mount
  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const response = await api.get('/telegram/premium/check');
      setHasPremium(response.data.data.hasPremium);
    } catch (error) {
      console.error('Failed to check Premium:', error);
    } finally {
      setCheckingPremium(false);
    }
  };

  const handleAddButton = () => {
    const newButton = { text: "", url: "", color: "blue" };
    updateFormData({
      buttons: [...(formData.buttons || []), newButton],
    });
  };

  const handleUpdateButton = (
    index: number,
    field: "text" | "url" | "color",
    value: string
  ) => {
    const updatedButtons = [...(formData.buttons || [])];
    updatedButtons[index] = { ...updatedButtons[index], [field]: value };
    updateFormData({ buttons: updatedButtons });
  };

  const handleRemoveButton = (index: number) => {
    const updatedButtons = formData.buttons?.filter((_, i) => i !== index) || [];
    updateFormData({ buttons: updatedButtons });
  };

  // ✅ REAL UPLOAD TO MINIO
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Only JPG, PNG, GIF, WEBP images are allowed");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        try {
          // Upload to backend (MinIO)
          const response = await api.post('/ads/upload-base64', { base64Data });
          const uploadedUrl = response.data.data.url;

          // Set preview and form data
          setPreview(uploadedUrl);
          updateFormData({ 
            mediaUrl: uploadedUrl, 
            mediaFile: file,
            contentType: 'MEDIA' 
          });

          setUploading(false);
        } catch (error: any) {
          console.error('Upload failed:', error);
          setUploadError(error.response?.data?.message || 'Upload failed');
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);

    } catch (error: any) {
      setUploadError('Upload failed');
      setUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setPreview(null);
    setUploadError(null);
    updateFormData({ mediaUrl: undefined, mediaFile: undefined });
  };

  // ✅ SEND LIVE TELEGRAM PREVIEW
  const handleSendPreview = async () => {
    if (!formData.text || formData.text.length < 10) {
      alert('Please write some ad text first (minimum 10 characters)');
      return;
    }

    setSendingPreview(true);

    try {
      await api.post('/telegram/preview', {
        text: formData.text,
        mediaUrl: formData.mediaUrl,
        buttons: formData.buttons,
      });

      alert('✅ Preview sent to your Telegram! Check your messages.');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to send preview';
      alert(`❌ ${errorMsg}`);
    } finally {
      setSendingPreview(false);
    }
  };

  const handleApplyOptimized = (optimizedText: string) => {
    updateFormData({ text: optimizedText });
  };

  const remainingChars = 1024 - (formData.text?.length || 0);

  return (
    <div className="space-y-6">
      {/* Content Type Info */}
      <div className="p-4 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {formData.mediaUrl ? 'Media Ad (Image + Text + Buttons)' : 'Text Ad (Text + Buttons)'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          You can add text, image, and buttons together
        </p>
      </div>

      {/* Media Upload */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          Upload Media (Optional)
        </label>

        {preview ? (
          <div className="relative group">
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img src={preview} alt="Preview" className="w-full h-auto" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                <button
                  onClick={handleRemoveMedia}
                  className="p-3 bg-destructive hover:bg-destructive/90 rounded-xl transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            {formData.mediaFile && (
              <div className="mt-3 flex items-center justify-between px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
                <span className="text-green-600 dark:text-green-500 font-medium">
                  ✓ {formData.mediaFile.name}
                </span>
                <span className="text-green-600/80 dark:text-green-500/80 text-xs ml-2">
                  {((formData.mediaFile.size || 0) / 1024).toFixed(1)} KB
                </span>
              </div>
            )}
          </div>
        ) : (
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-12 text-center transition-all bg-card/50">
              {uploading ? (
                <Loader2 className="w-10 h-10 text-primary mx-auto mb-3 animate-spin" />
              ) : (
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              )}
              <p className="text-sm font-medium text-foreground mb-1">
                {uploading ? "Uploading..." : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF, WEBP up to 5MB
              </p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}

        {uploadError && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
            <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{uploadError}</p>
          </div>
        )}
      </div>

      {/* Ad Text */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-foreground">
            Advertisement Text <span className="text-destructive">*</span>
          </label>

          {/* Emoji Button */}
          <button
            onClick={() => setShowEmojiPicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-blue-500/25"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Add Emoji
          </button>
        </div>

        <textarea
          value={formData.text || ""}
          onChange={(e) => updateFormData({ text: e.target.value })}
          placeholder="Write your compelling advertisement text here...&#10;&#10;You can use:&#10;• Emojis 😊&#10;• Multiple lines&#10;• **Bold** text with markdown&#10;&#10;Example:&#10;🎉 Special Offer! Get 50% OFF&#10;✅ Limited time only&#10;👉 Order now!"
          maxLength={1024}
          rows={8}
          className="w-full px-4 py-3 bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-foreground placeholder:text-muted-foreground resize-none transition-all outline-none font-mono text-sm"
        />

        <div className="flex items-center justify-between mt-2 text-xs">
          <p className="text-muted-foreground">Supports emojis and markdown</p>
          <p
            className={`font-medium tabular-nums ${
              remainingChars < 100 ? "text-yellow-500" : "text-muted-foreground"
            }`}
          >
            {remainingChars} characters left
          </p>
        </div>

        {/* AI Optimizer & Live Preview */}
        <div className="mt-3 flex items-center gap-2">
          <AITextOptimizer
            text={formData.text || ""}
            onApply={handleApplyOptimized}
            language="uz"
          />

          <button
            onClick={handleSendPreview}
            disabled={sendingPreview || !formData.text || formData.text.length < 10}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
          >
            {sendingPreview ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Preview
              </>
            )}
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-foreground">
            Call-to-Action Buttons (Optional)
          </label>
          {(!formData.buttons || formData.buttons.length < 3) && (
            <button
              onClick={handleAddButton}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold transition-all"
            >
              <Link2 className="w-3.5 h-3.5" />
              Add Button
            </button>
          )}
        </div>

        {formData.buttons && formData.buttons.length > 0 ? (
          <div className="space-y-3">
            {formData.buttons.map((button, index) => (
              <div
                key={index}
                className="p-4 bg-card border border-border rounded-xl group hover:border-primary/30 transition-all space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={button.text}
                      onChange={(e) => handleUpdateButton(index, "text", e.target.value)}
                      placeholder="Button text (e.g. Visit Website)"
                      className="w-full px-3 py-2 bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm text-foreground placeholder:text-muted-foreground transition-all outline-none"
                    />
                    <input
                      type="url"
                      value={button.url}
                      onChange={(e) => handleUpdateButton(index, "url", e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm text-foreground placeholder:text-muted-foreground font-mono transition-all outline-none"
                    />
                    <ButtonColorPicker
                      selectedColor={button.color || "blue"}
                      onChange={(color) => handleUpdateButton(index, "color", color)}
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveButton(index)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-xl bg-card/50">
            <Link2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No buttons added yet</p>
            <button
              onClick={handleAddButton}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-all"
            >
              Add First Button
            </button>
          </div>
        )}
      </div>

      {/* Premium Notice */}
      {!checkingPremium && !hasPremium && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Telegram Premium Emojis
              </p>
              <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-0.5">
                Get Telegram Premium to use animated custom emojis in your ads
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary mb-1">Your Ad Includes:</p>
            <ul className="text-xs text-primary/80 space-y-0.5">
              <li>✓ Advertisement text ({formData.text?.length || 0} characters)</li>
              {preview && <li>✓ Media image uploaded</li>}
              {formData.buttons && formData.buttons.length > 0 && (
                <li>✓ {formData.buttons.length} button{formData.buttons.length > 1 ? 's' : ''}</li>
              )}
              {hasPremium && <li>✓ Telegram Premium available</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Emoji Picker Modal */}
      {showEmojiPicker && (
        <TelegramEmojiPicker
          onSelect={(emoji) => {
            const currentText = formData.text || "";
            updateFormData({ text: currentText + emoji });
            setShowEmojiPicker(false);
          }}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
};

export default AdComposer;