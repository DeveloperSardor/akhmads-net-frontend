// src/components/ad/ScheduleModal.tsx
import { useState } from "react";
import { X, Calendar, Clock, Globe } from "lucide-react";
import adService from "../../services/ad.service";

interface ScheduleModalProps {
  ad: any;
  onClose: () => void;
}

const ScheduleModal = ({ ad, onClose }: ScheduleModalProps) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timezone, setTimezone] = useState("Asia/Tashkent");
  const [activeDays, setActiveDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [activeHours, setActiveHours] = useState({ start: 9, end: 18 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const days = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
  ];

  const timezones = [
    "Asia/Tashkent",
    "Asia/Dubai",
    "Europe/Moscow",
    "Europe/London",
    "America/New_York",
  ];

  const toggleDay = (day: number) => {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await adService.setSchedule(ad.id, {
        startDate,
        endDate,
        timezone,
        activeDays,
        activeHours: [activeHours],
      });

      alert("Schedule set successfully!");
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to set schedule");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Schedule Ad</h2>
            <p className="text-sm text-muted-foreground mt-1">{ad.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Start Date
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                End Date
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              <Globe className="w-4 h-4 inline mr-2" />
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {/* Active Days */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Active Days
            </label>
            <div className="flex gap-2">
              {days.map((day) => (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    activeDays.includes(day.value)
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Hours */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              <Clock className="w-4 h-4 inline mr-2" />
              Active Hours
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Start</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={activeHours.start}
                  onChange={(e) =>
                    setActiveHours((prev) => ({ ...prev, start: parseInt(e.target.value) }))
                  }
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">End</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={activeHours.end}
                  onChange={(e) =>
                    setActiveHours((prev) => ({ ...prev, end: parseInt(e.target.value) }))
                  }
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ad will run from {activeHours.start}:00 to {activeHours.end}:00 daily
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border sticky bottom-0 bg-card">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-card border border-border hover:bg-muted text-foreground rounded-lg font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !startDate || !endDate}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground rounded-lg font-semibold transition-all shadow-lg shadow-primary/25 disabled:shadow-none"
          >
            {isSubmitting ? "Setting..." : "Set Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;