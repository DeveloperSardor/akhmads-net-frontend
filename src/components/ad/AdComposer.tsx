// src/components/ad/AdComposer.tsx
import { useState } from "react";
import { FileText, Link2, /*Upload,*/ X, Loader2, Sparkles, Send } from "lucide-react";
import { useAdStore } from "../../store/adStore";
import api from "../../api/api";
import ButtonColorPicker from "./ButtonColorPicker";
import TelegramEmojiPicker from "./TelegramEmojiPicker";
import { useTranslations } from "../../hooks/useTranslations";

const AdComposer = () => {
  const { formData, updateFormData } = useAdStore();
  const t = useTranslations();
  const ac = t.adComposer;

  // const [preview, setPreview] = useState<string | null>(formData.mediaUrl || null);
  // const [uploading, setUploading] = useState(false);
  // const [uploadError, setUploadError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sendingPreview, setSendingPreview] = useState(false);

  const handleAddButton = () => {
    const newButton = { text: "", url: "", color: "blue" };
    updateFormData({ buttons: [...(formData.buttons || []), newButton] });
  };

  const handleUpdateButton = (index: number, field: "text" | "url" | "color", value: string) => {
    const updatedButtons = [...(formData.buttons || [])];
    updatedButtons[index] = { ...updatedButtons[index], [field]: value };
    updateFormData({ buttons: updatedButtons });
  };

  const handleRemoveButton = (index: number) => {
    const updatedButtons = formData.buttons?.filter((_, i) => i !== index) || [];
    updateFormData({ buttons: updatedButtons });
  };

  /*
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(ac?.fileSizeError ?? "File size must be less than 5MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError(ac?.fileTypeError ?? "Only JPG, PNG, GIF, WEBP images are allowed");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        try {
          const response = await api.post('/ads/upload-base64', { base64Data });
          const uploadedUrl = response.data.data.url;
          setPreview(uploadedUrl);
          updateFormData({ mediaUrl: uploadedUrl, mediaFile: file, contentType: 'MEDIA' });
        } catch (error: any) {
          setUploadError(error.response?.data?.message || (ac?.uploadFailed ?? 'Upload failed'));
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadError(ac?.uploadFailed ?? 'Upload failed');
      setUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setPreview(null);
    setUploadError(null);
    updateFormData({ mediaUrl: undefined, mediaFile: undefined });
  };
  */

  const handleSendPreview = async () => {
    if (!formData.text || formData.text.length < 10) {
      alert(ac?.sendPreviewAlert ?? 'Please write some ad text first (minimum 10 characters)');
      return;
    }
    setSendingPreview(true);
    try {
      await api.post('/telegram/preview', {
        text: formData.text,
        mediaUrl: formData.mediaUrl,
        buttons: formData.buttons,
      });
      alert(ac?.sendPreviewSuccess ?? '✅ Preview sent to your Telegram! Check your messages.');
    } catch (error: any) {
      alert(`❌ ${error.response?.data?.message || (ac?.sendPreviewFail ?? 'Failed to send preview')}`);
    } finally {
      setSendingPreview(false);
    }
  };

  const remainingChars = 1024 - (formData.text?.length || 0);
  const buttonCount = formData.buttons?.length || 0;

  return (
    <div className="space-y-6">
      {/* Campaign Type selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: Web Composer (Active) */}
        <div className="p-4 bg-primary/10 border-2 border-primary rounded-xl ring-4 ring-primary/5 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-primary/20 rounded-lg">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-bold text-foreground">
              {formData.mediaUrl
                ? (ac?.contentTypeMedia ?? 'Media Ad (Image + Text + Buttons)')
                : (ac?.contentTypeText ?? 'Text Ad (Text + Buttons)')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {ac?.contentTypeHint ?? 'You can add text, image, and buttons together'}
          </p>
        </div>

        {/* Option 2: Telegram Bot (Redirect) */}
        <a 
          href="https://t.me/akhmadsnetbot?start=add_ad" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-4 bg-card border border-border hover:border-blue-500/50 hover:bg-blue-500/5 rounded-xl transition-all group relative overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-500/20 rounded-lg transition-transform group-hover:scale-110">
              <Send className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-foreground group-hover:text-blue-500 transition-colors">
              {ac?.addViaBot ?? 'Add via Telegram Bot'}
            </span>
            <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {ac?.addViaBotHint ?? 'Create an ad by simply sending a message to the bot'}
          </p>
          <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20"></span>
          </div>
        </a>
      </div>

      {/* Media Upload (Temporarily Disabled)
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          {ac?.uploadLabel ?? 'Upload Media (Optional)'}
        </label>

        {preview ? (
          <div className="relative group">
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img src={preview} alt="Preview" className="w-full h-auto" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                <button onClick={handleRemoveMedia} className="p-3 bg-destructive hover:bg-destructive/90 rounded-xl transition-all">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            {formData.mediaFile && (
              <div className="mt-3 flex items-center justify-between px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
                <span className="text-green-600 dark:text-green-500 font-medium">✓ {formData.mediaFile.name}</span>
                <span className="text-green-600/80 dark:text-green-500/80 text-xs ml-2">
                  {((formData.mediaFile.size || 0) / 1024).toFixed(1)} KB
                </span>
              </div>
            )}
          </div>
        ) : (
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-12 text-center transition-all bg-card/50">
              {uploading
                ? <Loader2 className="w-10 h-10 text-primary mx-auto mb-3 animate-spin" />
                : <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              }
              <p className="text-sm font-medium text-foreground mb-1">
                {uploading
                  ? (ac?.uploading ?? "Uploading...")
                  : (ac?.uploadPlaceholder ?? "Click to upload or drag and drop")}
              </p>
              <p className="text-xs text-muted-foreground">
                {ac?.uploadFormats ?? "PNG, JPG, GIF, WEBP up to 5MB"}
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
      */}

      {/* Ad Text */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-foreground">
            {ac?.adTextLabel ?? 'Advertisement Text'} <span className="text-destructive">*</span>
          </label>
          <button
            onClick={() => setShowEmojiPicker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-blue-500/25"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {ac?.addEmoji ?? 'Add Emoji'}
          </button>
        </div>

        <textarea
          value={formData.text || ""}
          onChange={(e) => updateFormData({ text: e.target.value })}
          placeholder={ac?.adTextPlaceholder ?? "Write your compelling advertisement text here..."}
          maxLength={1024}
          rows={8}
          className="w-full px-4 py-3 bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-foreground placeholder:text-muted-foreground resize-none transition-all outline-none font-mono text-sm"
        />

        <div className="flex items-center justify-between mt-2 text-xs">
          <p className="text-muted-foreground">{ac?.supportsMarkdown ?? 'Supports emojis and markdown'}</p>
          <p className={`font-medium tabular-nums ${remainingChars < 100 ? "text-yellow-500" : "text-muted-foreground"}`}>
            {remainingChars} {ac?.charsLeft ?? 'characters left'}
          </p>
        </div>

        {/* Send Preview */}
        <div className="mt-3">
          <button
            onClick={handleSendPreview}
            disabled={sendingPreview || !formData.text || formData.text.length < 10}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
          >
            {sendingPreview ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{ac?.sending ?? 'Sending...'}</>
            ) : (
              <><Send className="w-4 h-4" />{ac?.sendPreview ?? 'Send Preview'}</>
            )}
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-foreground">
            {ac?.buttonsLabel ?? 'Call-to-Action Buttons (Optional)'}
          </label>
          {(!formData.buttons || formData.buttons.length < 3) && (
            <button
              onClick={handleAddButton}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold transition-all"
            >
              <Link2 className="w-3.5 h-3.5" />
              {ac?.addButton ?? 'Add Button'}
            </button>
          )}
        </div>

        {formData.buttons && formData.buttons.length > 0 ? (
          <div className="space-y-3">
            {formData.buttons.map((button, index) => (
              <div key={index} className="p-4 bg-card border border-border rounded-xl group hover:border-primary/30 transition-all space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={button.text}
                      onChange={(e) => handleUpdateButton(index, "text", e.target.value)}
                      placeholder={ac?.buttonTextPlaceholder ?? "Button text (e.g. Visit Website)"}
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
                  <button onClick={() => handleRemoveButton(index)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-xl bg-card/50">
            <Link2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">{ac?.noButtons ?? 'No buttons added yet'}</p>
            <button onClick={handleAddButton} className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-all">
              {ac?.addFirstButton ?? 'Add First Button'}
            </button>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary mb-1">
              {ac?.summaryTitle ?? 'Your Ad Includes:'}
            </p>
            <ul className="text-xs text-primary/80 space-y-0.5">
              <li>✓ {formData.text?.length || 0} {ac?.summaryChars ?? 'characters'}</li>
              {/* {preview && <li>✓ {ac?.summaryMedia ?? 'Media image uploaded'}</li>} */}
              {buttonCount > 0 && (
                <li>✓ {buttonCount} {buttonCount > 1 ? (ac?.summaryButtons ?? 'buttons') : (ac?.summaryButton ?? 'button')}</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Emoji Picker Modal */}
      {showEmojiPicker && (
        <TelegramEmojiPicker
          onSelect={(emoji) => {
            updateFormData({ text: (formData.text || "") + emoji });
            setShowEmojiPicker(false);
          }}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
};

export default AdComposer;