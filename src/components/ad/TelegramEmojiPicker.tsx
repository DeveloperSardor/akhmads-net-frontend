// src/components/ad/TelegramEmojiPicker.tsx - SIMPLE VERSION
import { useState } from "react";
import { Sparkles, X } from "lucide-react";

interface TelegramEmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

// All emojis - available for everyone
const ALL_EMOJIS = [
  '😊', '😂', '😍', '😎', '🥳', '🤩', '😇', '🙃',
  '❤️', '💙', '💚', '💛', '💜', '🖤', '🤍', '🤎',
  '👍', '👏', '🙌', '💪', '🤝', '✌️', '🤞', '👌',
  '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🎯', '🎪',
  '🔥', '✨', '💫', '⭐', '🌟', '💥', '💯', '✅',
  '🚀', '💎', '👑', '🏆', '🥇', '🥈', '🥉', '🎖️',
  '📢', '📣', '📲', '💬', '💭', '🗨️', '💡', '🔔',
  '⚡', '💰', '🤑', '😈', '👻', '💀', '🤖', '👽',
];

const TelegramEmojiPicker = ({ onSelect, onClose }: TelegramEmojiPickerProps) => {
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
              <h3 className="text-sm font-semibold text-foreground">Add Emoji</h3>
              <p className="text-xs text-muted-foreground">
                Choose an emoji for your ad
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

        {/* Emoji Grid */}
        <div className="p-4 max-h-[400px] overflow-y-auto">
          <div className="grid grid-cols-8 gap-1.5">
            {ALL_EMOJIS.map((emoji, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-muted rounded-lg transition-all hover:scale-110"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground text-center">
            {ALL_EMOJIS.length} emojis available
          </p>
        </div>
      </div>
    </div>
  );
};

export default TelegramEmojiPicker;