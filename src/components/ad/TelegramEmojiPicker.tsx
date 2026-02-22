// src/components/ad/TelegramEmojiPicker.tsx
import { useState } from "react";
import { Sparkles, X, Star } from "lucide-react";

interface TelegramEmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

// Standard emojis (free)
const STANDARD_EMOJIS = [
  '😊', '😂', '😍', '😎', '🥳', '🤩', '😇', '🙃',
  '❤️', '💙', '💚', '💛', '💜', '🖤', '🤍', '🤎',
  '👍', '👏', '🙌', '💪', '🤝', '✌️', '🤞', '👌',
  '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🎯', '🎪',
  '🔥', '✨', '💫', '⭐', '🌟', '💥', '💯', '✅',
  '🚀', '💎', '👑', '🏆', '🥇', '🥈', '🥉', '🎖️',
  '📢', '📣', '📲', '💬', '💭', '🗨️', '💡', '🔔',
];

// Premium animated emojis
const PREMIUM_EMOJIS = [
  { emoji: '🔥', name: 'Fire' },
  { emoji: '❤️', name: 'Heart' },
  { emoji: '🎉', name: 'Party' },
  { emoji: '👍', name: 'Thumbs Up' },
  { emoji: '⭐', name: 'Star' },
  { emoji: '💯', name: 'Hundred' },
  { emoji: '✨', name: 'Sparkles' },
  { emoji: '🚀', name: 'Rocket' },
  { emoji: '💎', name: 'Gem' },
  { emoji: '⚡', name: 'Lightning' },
  { emoji: '🎯', name: 'Target' },
  { emoji: '🏆', name: 'Trophy' },
  { emoji: '💰', name: 'Money Bag' },
  { emoji: '🤑', name: 'Money Face' },
  { emoji: '🎁', name: 'Gift' },
  { emoji: '🔔', name: 'Bell' },
];

const TelegramEmojiPicker = ({ onSelect, onClose }: TelegramEmojiPickerProps) => {
  const [tab, setTab] = useState<'standard' | 'premium'>('standard');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Telegram Emojis</h3>
              <p className="text-xs text-muted-foreground">
                {tab === 'premium' ? 'Premium Animated' : 'Standard Emojis'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
          <button
            onClick={() => setTab('standard')}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
              tab === 'standard'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setTab('premium')}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1.5 ${
              tab === 'premium'
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            Premium
          </button>
        </div>

        {/* Premium Notice */}
        {tab === 'premium' && (
          <div className="mx-4 mt-3 p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Telegram Premium Animated Emojis
                </p>
                <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-0.5">
                  These emojis will be animated in Telegram for Premium users
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Emoji Grid */}
        <div className="p-4 max-h-[320px] overflow-y-auto">
          {tab === 'standard' ? (
            <div className="grid grid-cols-8 gap-1.5">
              {STANDARD_EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(emoji)}
                  className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-muted rounded-lg transition-all hover:scale-110"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {PREMIUM_EMOJIS.map((item, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(item.emoji)}
                  className="relative p-3 bg-muted/50 hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-blue-600/20 border border-border hover:border-blue-500/30 rounded-xl transition-all group"
                  title={item.name}
                >
                  <div className="text-3xl mb-1">{item.emoji}</div>
                  <div className="text-xs text-muted-foreground group-hover:text-foreground font-medium">
                    {item.name}
                  </div>
                  <div className="absolute top-1 right-1">
                    <Sparkles className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {tab === 'premium' 
                ? `${PREMIUM_EMOJIS.length} Premium Emojis`
                : `${STANDARD_EMOJIS.length} Standard Emojis`
              }
            </span>
            {tab === 'premium' && (
              <div className="flex items-center gap-1 text-blue-500">
                <Star className="w-3 h-3 fill-current" />
                <span>Animated in Telegram</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramEmojiPicker;