// src/components/ad/AdStatusBadge.tsx
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Pause, 
  Play, 
  AlertCircle,
  Archive,
  Send 
} from "lucide-react";

interface AdStatusBadgeProps {
  status: string;
}

const AdStatusBadge = ({ status }: AdStatusBadgeProps) => {
  const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
    DRAFT: {
      label: "Draft",
      icon: Clock,
      className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    },
    SUBMITTED: {
      label: "Pending Review",
      icon: Send,
      className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    APPROVED: {
      label: "Approved",
      icon: CheckCircle,
      className: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    REJECTED: {
      label: "Rejected",
      icon: XCircle,
      className: "bg-red-500/10 text-red-400 border-red-500/20",
    },
    SCHEDULED: {
      label: "Scheduled",
      icon: Clock,
      className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    RUNNING: {
      label: "Running",
      icon: Play,
      className: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    PAUSED: {
      label: "Paused",
      icon: Pause,
      className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    COMPLETED: {
      label: "Completed",
      icon: CheckCircle,
      className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    ARCHIVED: {
      label: "Archived",
      icon: Archive,
      className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    },
  };

  const config = statusConfig[status] || statusConfig.DRAFT;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

export default AdStatusBadge;