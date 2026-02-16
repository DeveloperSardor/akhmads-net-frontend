import { useState } from "react";
import { FileText, Image as ImageIcon, Link2, Upload, X, Loader2 } from "lucide-react";
import { useAdStore } from "../../store/adStore";

const AdComposer = () => {
  const { formData, updateFormData } = useAdStore();
  const [activeTab, setActiveTab] = useState<"text" | "media" | "button">("text");
  const [preview, setPreview] = useState<string | null>(formData.mediaUrl || null);
  const [uploading, setUploading] = useState(false);

  const handleAddButton = () => {
    const newButton = { text: "", url: "" };
    updateFormData({
      buttons: [...(formData.buttons || []), newButton],
    });
  };

  const handleUpdateButton = (index: number, field: "text" | "url", value: string) => {
    const updatedButtons = [...(formData.buttons || [])];
    updatedButtons[index] = { ...updatedButtons[index], [field]: value };
    updateFormData({ buttons: updatedButtons });
  };

  const handleRemoveButton = (index: number) => {
    const updatedButtons = formData.buttons?.filter((_, i) => i !== index) || [];
    updateFormData({ buttons: updatedButtons });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Only JPG, PNG, GIF images are allowed");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      updateFormData({ mediaUrl: result, mediaFile: file });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = () => {
    setPreview(null);
    updateFormData({ mediaUrl: undefined, mediaFile: undefined });
  };

  const remainingChars = 1024 - (formData.text?.length || 0);

  return (
    <div className="space-y-6">
      {/* Ad Type Selector */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          Ad Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "text", label: "Text", icon: FileText, type: "TEXT" },
            { id: "media", label: "Media", icon: ImageIcon, type: "MEDIA" },
            { id: "button", label: "Button", icon: Link2, type: "TEXT" },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  updateFormData({ contentType: item.type as any });
                }}
                className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  isActive
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Upload */}
      {activeTab === "media" && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">
            Upload Media
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
                <div className="mt-3 flex items-center justify-between px-4 py-2 bg-card border border-border rounded-lg text-sm">
                  <span className="text-foreground truncate">{formData.mediaFile.name}</span>
                  <span className="text-muted-foreground text-xs ml-2">
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
                  PNG, JPG or GIF up to 5MB
                </p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>
      )}

      {/* Ad Text */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          Advertisement Text <span className="text-destructive">*</span>
        </label>
        <textarea
          value={formData.text || ""}
          onChange={(e) => updateFormData({ text: e.target.value })}
          placeholder="Write your compelling advertisement text here..."
          maxLength={1024}
          rows={7}
          className="w-full px-4 py-3 bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-foreground placeholder:text-muted-foreground resize-none transition-all outline-none"
        />
        <div className="flex items-center justify-between mt-2 text-xs">
          <p className="text-muted-foreground">Supports markdown and emojis</p>
          <p className={`font-medium tabular-nums ${
            remainingChars < 100 ? "text-yellow-500" : "text-muted-foreground"
          }`}>
            {remainingChars} characters left
          </p>
        </div>
      </div>

      {/* Call-to-Action Buttons */}
      {(activeTab === "button" || (formData.buttons && formData.buttons.length > 0)) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-foreground">
              Call-to-Action Buttons
            </label>
            {(!formData.buttons || formData.buttons.length < 3) && (
              <button
                onClick={handleAddButton}
                className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                + Add Button
              </button>
            )}
          </div>

          <div className="space-y-3">
            {formData.buttons?.map((button, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl group hover:border-border/80 transition-all"
              >
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={button.text}
                    onChange={(e) => handleUpdateButton(index, "text", e.target.value)}
                    placeholder="Button text"
                    className="w-full px-3 py-2 bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm text-foreground placeholder:text-muted-foreground transition-all outline-none"
                  />
                  <input
                    type="url"
                    value={button.url}
                    onChange={(e) => handleUpdateButton(index, "url", e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm text-foreground placeholder:text-muted-foreground font-mono transition-all outline-none"
                  />
                </div>
                <button
                  onClick={() => handleRemoveButton(index)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {(!formData.buttons || formData.buttons.length === 0) && activeTab === "button" && (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-card/50">
                <Link2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No buttons added yet</p>
                <button
                  onClick={handleAddButton}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-all"
                >
                  Add First Button
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdComposer;