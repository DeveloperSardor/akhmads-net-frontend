import { useState, useEffect } from "react";
import { Bot as BotIcon, ArrowRight, TrendingUp } from "lucide-react";
import botService from "../../services/bot.service";
import { useTranslations } from "../../hooks/useTranslations";

const FeaturedBots = () => {
  const t = useTranslations();
  const fb = t.featuredBots;
  
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    botService.searchBots("bot").then(res => {
      setBots(res.data.bots.slice(0, 3));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || bots.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
           <TrendingUp className="w-3 h-3 text-primary" /> {fb?.title ?? 'Ommabop Botlar'}
        </h3>
        <button className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
          {fb?.viewAll ?? 'Barchasi'} <ArrowRight className="w-2.5 h-2.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {bots.map((bot) => (
          <div key={bot.id} className="p-3 bg-card border border-border rounded-xl flex items-center gap-3 hover:border-primary/30 transition-all group">
             {bot.avatarUrl ? (
                <img src={bot.avatarUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
             ) : (
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                   <BotIcon className="w-5 h-5 text-primary" />
                </div>
             )}
             <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{bot.firstName}</p>
                <p className="text-[10px] text-muted-foreground truncate font-mono opacity-60">@{bot.username}</p>
             </div>
             <div className="text-right">
                <div className="text-xs font-black text-primary tabular-nums">
                   {(bot.activeUsers30d || 0) >= 1000 ? `${((bot.activeUsers30d || 0) / 1000).toFixed(1)}K` : (bot.activeUsers30d || 0)}
                </div>
                <div className="text-[8px] text-muted-foreground uppercase font-bold opacity-50">{fb?.users ?? 'Active Users'}</div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedBots;
