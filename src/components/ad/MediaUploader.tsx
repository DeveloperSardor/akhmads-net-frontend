import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { useAdStore } from "../../store/adStore";

const MediaUploader = () => {
  const { formData, updateFormData } = useAdStore();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(formData.mediaUrl || null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4"];
    if (!validTypes.includes(file.type)) {
      alert("Only JPG, PNG, GIF images and MP4 videos are allowed");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      updateFormData({ mediaUrl: result, mediaFile: file });
    };
    reader.readAsDataURL(file);

    // TODO: Upload to server
    // For now, just use local preview
  };

  const handleRemove = () => {
    setPreview(null);
    updateFormData({ mediaUrl: undefined, mediaFile: undefined });
  };

  return (
    <div>
      {preview ? (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden bg-gray-800">
            {formData.mediaFile?.type.startsWith("video") ? (
              <video src={preview} controls className="w-full h-auto" />
            ) : (
              <img src={preview} alt="Preview" className="w-full h-auto" />
            )}

            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span>
              {formData.mediaFile?.name} •{" "}
              {((formData.mediaFile?.size || 0) / 1024).toFixed(1)} KB
            </span>
            <span className="text-green-400">• Loaded</span>
          </div>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center hover:border-purple-600/50 transition-colors">
            {uploading ? (
              <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
            ) : (
              <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            )}

            <p className="text-white font-medium mb-1">Upload images</p>
            <p className="text-sm text-gray-400">
              Rasm tavsiya o'lchami: 1080×1080 px. 5 MB gacha.
            </p>
          </div>

          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,video/mp4"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}

      {formData.mediaFile && (
        <div className="mt-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
          <p className="text-xs text-gray-400">
            <span className="text-red-400">Rasm formati noto'g'ri, JPG/PNG yuklang.</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;