import { useState, useEffect } from "react";
import { Check, Users, Target, Globe } from "lucide-react";
import { Select } from "antd";
import { useAdStore } from "../../store/adStore";
import { useTranslations } from "../../hooks/useTranslations";
import axios from "axios";
import BotSelector from "./BotSelector";

interface CategoryFromApi {
  id: string;
  slug: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  icon: string;
  sortOrder: number;
}

const getLanguages = (t: any) => [
  {
    code: "all",
    name: `🌍 ${t.audienceReach?.allLanguages || "Barcha tillar"}`,
  },
  { code: "uz", name: "🇺🇿 Uzbek" },
  { code: "ru", name: "🇷🇺 Russian" },
  { code: "en", name: "🇺🇸 English" },
  { code: "tr", name: "🇹🇷 Turkish" },
  { code: "ar", name: "🇸🇦 Arabic" },
  { code: "de", name: "🇩🇪 German" },
  { code: "fr", name: "🇫🇷 French" },
  { code: "es", name: "🇪🇸 Spanish" },
  { code: "it", name: "🇮🇹 Italian" },
  { code: "pt", name: "🇵🇹 Portuguese" },
  { code: "hi", name: "🇮🇳 Hindi" },
];

const AudienceReach = () => {
  const { formData, updateFormData } = useAdStore();
  const [selectedSegments, setSelectedSegments] = useState<string[]>(
    formData.targeting?.aiSegments || [],
  );
  const [categories, setCategories] = useState<CategoryFromApi[]>([]);

  // Fetch categories from public API
  useEffect(() => {
    axios
      .get("https://api.akhmads.net/api/categories")
      .then((res) => setCategories(res.data.data || []))
      .catch(() => {});
  }, []);

  const t = useTranslations();
  const { locale } = t;
  const ar = t.audienceReach;
  const LANGUAGES = getLanguages(t);

  const getCatName = (cat: CategoryFromApi) => {
    if (locale === "uz") return cat.nameUz;
    if (locale === "eng") return cat.nameEn;
    return cat.nameRu;
  };

  const quickReaches = [
    { value: 1000, label: "1K" },
    { value: 5000, label: "5K" },
    { value: 10000, label: "10K" },
    { value: 50000, label: "50K" },
  ];

  const handleSegmentToggle = (segmentId: string) => {
    const newSegments = selectedSegments.includes(segmentId)
      ? selectedSegments.filter((id) => id !== segmentId)
      : [...selectedSegments, segmentId];

    setSelectedSegments(newSegments);
    updateFormData({
      targeting: {
        ...formData.targeting,
        aiSegments: newSegments,
        categories: newSegments,
      },
    });
  };

  // ✅ FIXED - Add null check
  const formatNumber = (num: number | undefined) => {
    if (!num && num !== 0) return "0"; // Handle undefined/null
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000)
      return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
    return num.toString();
  };

  const estimatedReach = Math.floor(
    formData.targetImpressions * (selectedSegments.length > 0 ? 0.7 : 1),
  );

  const percentage =
    ((formData.targetImpressions - 100) / (100000 - 100)) * 100;

  // ✅ Categories from API
  const segments = categories.map((cat) => ({
    id: cat.slug,
    name: `${cat.icon} ${getCatName(cat)}`,
  }));

  return (
    <div className="space-y-8">
      {/* Target Impressions */}
      <div>
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1 space-y-4">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              {ar?.selectLanguage || "Tilni tanlang"}
            </label>
            <Select
              mode="multiple"
              allowClear
              placeholder={ar?.allLanguages || "Barcha tillar"}
              value={
                formData.targeting?.languages?.includes("all")
                  ? []
                  : formData.targeting?.languages
              }
              onChange={(vals) => {
                let sorted = vals;
                if (!vals || vals.length === 0) sorted = ["all"];
                else if (vals.length > 0 && vals[vals.length - 1] === "all")
                  sorted = ["all"];
                else if (vals.includes("all"))
                  sorted = vals.filter((v) => v !== "all");
                updateFormData({
                  targeting: { ...formData.targeting, languages: sorted },
                });
              }}
              className="w-full h-12 custom-dark-select"
            >
              {LANGUAGES.map((l) => (
                <Select.Option key={l.code} value={l.code}>
                  {l.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-muted-foreground" />
          <label className="text-sm font-semibold text-foreground">
            {ar?.targetImpressions ?? "Target Impressions"}
          </label>
        </div>

        {/* Quick Selection */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {quickReaches.map((reach) => {
            const isActive = formData.targetImpressions === reach.value;
            return (
              <button
                key={reach.value}
                onClick={() =>
                  updateFormData({ targetImpressions: reach.value })
                }
                className={`relative py-4 px-3 rounded-xl border transition-all ${
                  isActive
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <div className="text-center">
                  <div
                    className={`text-xl font-bold mb-1 ${isActive ? "" : ""}`}
                  >
                    {reach.label}
                  </div>
                  <div className="text-xs opacity-80">
                    {ar?.users ?? "users"}
                  </div>
                </div>
                {isActive && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Slider */}
        <div className="p-5 bg-card border border-border rounded-xl">
          <label className="block text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wide">
            {ar?.customAmount ?? "Custom Amount"}
          </label>

          <div className="mb-6">
            <input
              type="range"
              min="100"
              max="100000"
              step="100"
              value={formData.targetImpressions}
              onChange={(e) =>
                updateFormData({ targetImpressions: parseInt(e.target.value) })
              }
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  var(--primary) 0%, 
                  var(--primary) ${percentage}%, 
                  var(--border) ${percentage}%, 
                  var(--border) 100%)`,
              }}
            />
            <style>{`
              input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: var(--primary);
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
                transition: all 0.2s;
              }
              input[type="range"]::-webkit-slider-thumb:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.6);
              }
              input[type="range"]::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border: none;
                border-radius: 50%;
                background: var(--primary);
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
              }
            `}</style>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>100</span>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground tabular-nums">
                {formatNumber(formData.targetImpressions)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {ar?.targetUsers ?? "target users"}
              </div>
            </div>
            <span>100K</span>
          </div>
        </div>
      </div>

      {/* Category Targeting */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              {ar?.categorySelect ?? "Kategoriya tanlash"}
            </h3>
          </div>
          {segments.length > 0 && (
            <button
              onClick={() => {
                const allSelected = segments.every((s) =>
                  selectedSegments.includes(s.id),
                );
                const newSegments = allSelected
                  ? []
                  : segments.map((s) => s.id);
                setSelectedSegments(newSegments);
                updateFormData({
                  targeting: {
                    ...formData.targeting,
                    aiSegments: newSegments,
                    categories: newSegments,
                  },
                });
              }}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg border border-primary/30 hover:border-primary/60 hover:bg-primary/5"
            >
              {segments.every((s) => selectedSegments.includes(s.id))
                ? (ar?.deselectAll ?? "Barchasini olib tashlash")
                : (ar?.selectAll ?? "Barchasini tanlash")}
            </button>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {ar?.categoryDesc ??
            "Reklamangiz ko'rsatiladigan bot kategoriyalarini tanlang"}
        </p>

        <div className="flex flex-wrap gap-3">
          {segments.map((segment) => {
            const isSelected = selectedSegments.includes(segment.id);

            return (
              <button
                key={segment.id}
                onClick={() => handleSegmentToggle(segment.id)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all duration-300 flex items-center gap-2 group ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "border-border bg-card/50 text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-card"
                }`}
              >
                <span
                  className={`transition-transform duration-300 ${isSelected ? "scale-110" : "group-hover:scale-110 opacity-70 group-hover:opacity-100"}`}
                >
                  {segment.name}
                </span>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Summary */}
        {selectedSegments.length > 0 && (
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
            <div className="text-sm font-medium text-foreground">
              {selectedSegments.length}{" "}
              {ar?.categoriesSelected ?? "ta kategoriya tanlandi"}
            </div>
            <div className="text-right">
              <div className="text-xs text-primary font-medium">
                {ar?.estimatedReach ?? "Taxminiy qamrov"}
              </div>
              <div className="text-lg font-bold text-foreground tabular-nums">
                {formatNumber(estimatedReach)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Specific Bot Targeting */}
      <div className="pt-6 border-t border-border">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            {ar?.specificBots ?? "Maxsus botlarni tanlash (Ixtiyoriy)"}
          </h3>
        </div>

        <div className="space-y-6">
          <BotSelector
            label={ar?.includeBots ?? "Faqat shu botlarda ko'rsatilsin"}
            description={
              ar?.includeBotsDesc ??
              "Reklamangiz faqat siz tanlagan botlardagina chiqadi (boshqalarida chiqmaydi)."
            }
            placeholder={
              ar?.searchPlaceholder ??
              "Bot nomi yoki username kiritib izlang..."
            }
            selectedIds={formData.specificBotIds || []}
            onChange={(ids) => updateFormData({ specificBotIds: ids })}
          />

          <BotSelector
            label={ar?.excludeBots ?? "Shu botlarda ko'rsatilmasin"}
            description={
              ar?.excludeBotsDesc ??
              "Reklamangiz aniq siz xohlamagan botlarda ko'rinmaydi (Blacklist)."
            }
            placeholder={
              ar?.searchPlaceholder ??
              "Bot nomi yoki username kiritib izlang..."
            }
            selectedIds={formData.excludedBotIds || []}
            onChange={(ids) => updateFormData({ excludedBotIds: ids })}
          />
        </div>
      </div>
    </div>
  );
};

export default AudienceReach;
