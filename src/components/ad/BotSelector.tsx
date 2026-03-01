import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, Bot as BotIcon } from "lucide-react";
import botService from "../../services/bot.service";
import type { Bot } from "../../types/bot.types";

interface BotSelectorProps {
  label: string;
  description: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

const BotSelector = ({ label, description, selectedIds, onChange, placeholder = "Search bots..." }: BotSelectorProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Partial<Bot>[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBots, setSelectedBots] = useState<Partial<Bot>[]>([]);
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
        const res = await botService.searchBots(query);
        const fetchedBots = res.data.bots || [];
        // Filter out already selected bots
        setResults(fetchedBots.filter((b: any) => !selectedIds.includes(b.id)));
      } catch (err) {
        console.error("Failed to search bots", err);
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

  const handleSelect = (bot: Partial<Bot>) => {
    if (!bot.id) return;
    const newSelectedBots = [...selectedBots, bot];
    setSelectedBots(newSelectedBots);
    onChange([...selectedIds, bot.id]);
    setQuery("");
    setIsOpen(false);
  };

  const handleRemove = (botId: string) => {
    setSelectedBots(selectedBots.filter((b) => b.id !== botId));
    onChange(selectedIds.filter((id) => id !== botId));
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">{label}</label>
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
            className="w-full pl-9 pr-10 py-2.5 bg-input border border-border rounded-xl text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
          />
          {loading && (
            <div className="absolute right-3">
              <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
            </div>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && query.length >= 2 && (
          <div className="absolute top-12 left-0 right-0 max-h-[400px] overflow-y-auto bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl z-50 p-2 space-y-1 custom-scrollbar">
            <div className="px-3 py-2 text-[10px] uppercase font-bold text-muted-foreground tracking-widest border-b border-border mb-2">
              Qidiruv natijalari
            </div>
            {!loading && results.length === 0 ? (
              <div className="p-8 text-center">
                <BotIcon className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Hech qanday bot topilmadi</p>
              </div>
            ) : (
              results.map((bot) => (
                <button
                  key={bot.id}
                  onClick={() => handleSelect(bot)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-primary/10 rounded-xl transition-all text-left group"
                >
                  <div className="relative">
                    {bot.avatarUrl ? (
                      <img src={bot.avatarUrl} alt="" className="w-11 h-11 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-primary/30 transition-all" />
                    ) : (
                      <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
                        <BotIcon className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <p className="text-sm font-bold text-foreground truncate">{bot.firstName}</p>
                       {bot.totalMembers && bot.totalMembers > 10000 && (
                         <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 text-[8px] font-black uppercase rounded border border-yellow-500/20">Popular</span>
                       )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate opacity-70">@{bot.username}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-primary tabular-nums">
                      {(bot as any).activeUsers30d ? ((bot as any).activeUsers30d >= 1000 ? `${((bot as any).activeUsers30d / 1000).toFixed(1)}K` : (bot as any).activeUsers30d) : "0"}
                    </div>
                    <div className="text-[9px] text-muted-foreground uppercase font-bold opacity-60">Active Users</div>
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
            const botData = selectedBots.find((b) => b.id === id);
            return (
              <div
                key={id}
                className="flex items-center gap-2 pl-2 pr-1 py-1 bg-card border border-border rounded-lg"
              >
                <div className="text-sm font-medium">
                  {botData ? botData.firstName : <span>ID: {id.substring(0, 6)}...</span>}
                </div>
                <button
                  onClick={() => handleRemove(id)}
                  className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
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

export default BotSelector;
