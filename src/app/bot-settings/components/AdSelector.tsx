import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, AlertOctagon } from "lucide-react";
import adService from "../../../services/ad.service";
import type { Ad } from "../../../types/ad.types";

interface AdSelectorProps {
  label: string;
  description: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

const AdSelector = ({ label, description, selectedIds, onChange, placeholder = "Search active ads to block..." }: AdSelectorProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Partial<Ad>[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAds, setSelectedAds] = useState<Partial<Ad>[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const search = async () => {
      if (!query.trim() || query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await adService.searchActiveAds(query);
        const fetchedAds = res.data.ads || [];
        // Filter out already selected ads
        setResults(fetchedAds.filter((a: any) => !selectedIds.includes(a.id)));
      } catch (err) {
        console.error("Failed to search ads", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(search, 400);
    return () => clearTimeout(timer);
  }, [query, selectedIds]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (ad: Partial<Ad>) => {
    if (!ad.id) return;
    const newSelectedAds = [...selectedAds, ad];
    setSelectedAds(newSelectedAds);
    onChange([...selectedIds, ad.id]);
    setQuery("");
    setIsOpen(false);
  };

  const handleRemove = (adId: string) => {
    setSelectedAds(selectedAds.filter((a) => a.id !== adId));
    onChange(selectedIds.filter((id) => id !== adId));
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      <div>
        <label className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-destructive" />
          {label}
        </label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-9 pr-10 py-2.5 bg-input border border-border rounded-xl text-sm focus:ring-1 focus:ring-destructive focus:border-destructive transition-all outline-none"
          />
          {loading && (
            <div className="absolute right-3">
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            </div>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && query.length >= 2 && (
          <div className="absolute top-11 left-0 right-0 max-h-60 overflow-y-auto bg-card border border-border rounded-xl shadow-xl z-50 p-2">
            {!loading && results.length === 0 ? (
              <div className="p-3 text-center text-sm text-muted-foreground">
                Hech qanday reklama topilmadi
              </div>
            ) : (
              results.map((ad) => (
                <button
                  key={ad.id}
                  onClick={() => handleSelect(ad)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-destructive/10 rounded-lg transition-colors text-left"
                >
                  {ad.mediaUrl ? (
                    <img src={ad.mediaUrl} alt="" className="w-8 h-8 rounded-md object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-card border border-border rounded-md flex items-center justify-center text-[10px] text-muted-foreground">
                      TEXT
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ad.title || "Ads Without Title"}</p>
                    <p className="text-xs text-muted-foreground truncate">{ad.text?.substring(0, 40)}...</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected tags */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedIds.map((id) => {
            const adData = selectedAds.find((a) => a.id === id);
            return (
              <div
                key={id}
                className="flex items-center gap-2 pl-2 pr-1 py-1 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg"
              >
                <div className="text-sm font-medium">
                  {adData ? (adData.title || "Ads Without Title") : <span>ID: {id.substring(0, 6)}...</span>}
                </div>
                <button
                  onClick={() => handleRemove(id)}
                  className="p-1 hover:bg-destructive text-destructive hover:text-white rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdSelector;
