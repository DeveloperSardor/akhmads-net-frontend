// src/components/ad/AdCardSkeleton.tsx
const AdCardSkeleton = () => {
  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-5 bg-muted rounded w-3/4 mb-2" />
          <div className="h-6 bg-muted rounded-lg w-24" />
        </div>
        <div className="w-16 h-16 bg-muted rounded-lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-5 bg-muted rounded" />
        <div className="h-5 bg-muted rounded" />
        <div className="h-5 bg-muted rounded" />
        <div className="h-5 bg-muted rounded" />
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="h-2 bg-muted rounded-full" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <div className="flex-1 h-9 bg-muted rounded-lg" />
        <div className="h-9 w-9 bg-muted rounded-lg" />
        <div className="h-9 w-9 bg-muted rounded-lg" />
      </div>
    </div>
  );
};

export default AdCardSkeleton;