// src/components/ad/ButtonColorPicker.tsx
import { Check } from "lucide-react";

interface ButtonColorPickerProps {
  selectedColor?: string;
  onChange: (color: string) => void;
}

const BUTTON_COLORS = [
  { name: 'Green', value: 'green', bg: 'bg-green-600', hover: 'hover:bg-green-700', telegram: '#4CAF50' },
  { name: 'Red', value: 'red', bg: 'bg-red-600', hover: 'hover:bg-red-700', telegram: '#F44336' },
  { name: 'Blue', value: 'blue', bg: 'bg-blue-600', hover: 'hover:bg-blue-700', telegram: '#2196F3' },
];

const ButtonColorPicker = ({ selectedColor = 'blue', onChange }: ButtonColorPickerProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-foreground">
        Button Color
      </label>
      
      <div className="flex items-center gap-2">
        {BUTTON_COLORS.map((color) => {
          const isSelected = selectedColor === color.value;
          
          return (
            <button
              key={color.value}
              onClick={() => onChange(color.value)}
              className={`relative flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-primary shadow-lg shadow-primary/25'
                  : 'border-border hover:border-primary/50'
              } ${color.bg} ${color.hover}`}
              title={color.name}
            >
              {isSelected && (
                <Check className="w-5 h-5 text-white" />
              )}
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Color will appear in Telegram buttons
      </p>
    </div>
  );
};

export default ButtonColorPicker;

// Export colors for use in other components
export { BUTTON_COLORS };