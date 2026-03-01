import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, AlertOctagon } from "lucide-react";
import adService from "../../../services/ad.service";
import type { Ad } from "../../../types/ad.types";

import { useTranslations } from "@/hooks/useTranslations";

interface AdSelectorProps {
  label?: string;
  description?: string;
  onSelect: (selectedIds: string[]) => void;
  initialSelectedIds?: string[];
  placeholder?: string;
}

export default function AdSelector({
  label,
  description,
  onSelect,
  initialSelectedIds = [],
  placeholder,
}: AdSelectorProps) {
  const t = useTranslations();
  const bs = t.botSettings;

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Partial<Ad>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAds, setSelectedAds] = useState<Partial<Ad>[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize selected ads from initialSelectedIds
  useEffect(() => {
    if (initialSelectedIds.length > 0) {
      const fetchSelectedAds = async () => {
        try {
          const fetchedAds = await Promise.all(
            initialSelectedIds.map(async (id) => {
              const res = await adService.getAdById(id);
              return res.data.ad;
            })
          );
          setSelectedAds(fetchedAds.filter(Boolean));
        } catch (error) {
          console.error("Failed to fetch initial selected ads", error);
        }
      };
      fetchSelectedAds();
    } else {
      setSelectedAds([]);
    }
  }, [initialSelectedIds]);

  // Debounced search
  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await adService.searchActiveAds(searchQuery);
        const fetchedAds = res.data.ads || [];
        // Filter out already selected ads
        setSearchResults(fetchedAds.filter((a: any) => !selectedAds.some(sa => sa.id === a.id)));
      } catch (err) {
        console.error("Failed to search ads", err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(search, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedAds]);

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
    if (!ad.id || selectedAds.some(sa => sa.id === ad.id)) return;
    const newSelectedAds = [...selectedAds, ad];
    setSelectedAds(newSelectedAds);
    onSelect(newSelectedAds.map((a) => a.id!));
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleRemove = (adId: string) => {
    const newSelectedAds = selectedAds.filter((a) => a.id !== adId);
    setSelectedAds(newSelectedAds);
    onSelect(newSelectedAds.map((a) => a.id!));
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      <div>
        <label className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-destructive" />
          {label || bs?.blockAdsTitle}
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          {description || bs?.blockAdsDesc}
        </p>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
            placeholder={placeholder || bs?.searchAds}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
        </div>

        {/* Dropdown */}
        {isOpen && searchQuery.length >= 2 && (
          <div className="absolute z-10 w-full mt-1 bg-card border border-border shadow-xl rounded-xl max-h-60 overflow-y-auto overflow-x-hidden backdrop-blur-xl">
            {searchResults.map((ad) => (
              <div
                key={ad.id}
                className="px-4 py-3 hover:bg-secondary/50 cursor-pointer flex items-center gap-3 transition-colors border-b border-border/10 last:border-0"
                onClick={() => handleSelect(ad)}
              >
                {ad.mediaUrl ? (
                  <img src={ad.mediaUrl} alt="Ad media" className="w-10 h-10 object-cover rounded-lg" />
                ) : (
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold shadow-inner">
                    {ad.title?.charAt(0).toUpperCase() || "AD"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate h-5">{ad.title || "Ads Without Title"}</div>
                  <div className="text-xs text-muted-foreground truncate h-4">{ad.text || "No description"}</div>
                </div>
              </div>
            ))}
            {searchResults.length === 0 && !isLoading && searchQuery.length >= 2 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {bs?.noAdsFound}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedAds.length > 0 && (
        <div className="mt-4 p-4 bg-secondary/20 border border-border/50 rounded-xl">
          <div className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
             <AlertOctagon className="w-4 h-4 text-destructive" />
             {bs?.selectedAds || "Bloklangan reklamalar"} ({selectedAds.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedAds.map((ad) => (
              <div
                key={ad.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-foreground shadow-sm group"
              >
                {ad.mediaUrl ? (
                  <img src={ad.mediaUrl} alt="" className="w-5 h-5 object-cover rounded shadow-sm" />
                ) : (
                  <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center text-primary text-[10px] font-bold">
                    {ad.title?.charAt(0).toUpperCase() || "AD"}
                  </div>
                )}
                <span className="truncate max-w-[150px] font-medium">{ad.title || "Ads Without Title"}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(ad.id!)}
                  className="p-0.5 hover:bg-destructive/20 rounded-full transition-colors opacity-70 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
