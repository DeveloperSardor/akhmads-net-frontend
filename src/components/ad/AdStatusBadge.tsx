// src/components/ad/AdStatusBadge.tsx - FIXED
import {
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Send,
  Archive,
} from "lucide-react";
import { useTranslations } from "../../hooks/useTranslations";

interface AdStatusBadgeProps {
  status: string;
}

const AdStatusBadge = ({ status }: AdStatusBadgeProps) => {
  const t = useTranslations();
  const adStatus = t.adStatus || {};

  const statusConfig: Record<
    string,
    { label: string; icon: any; className: string }
  > = {
    DRAFT: {
      label: adStatus.DRAFT || "Draft",
      icon: Clock,
      className: "bg-muted text-muted-foreground border-border",
    },
    PENDING_REVIEW: {
      label: adStatus.PENDING_REVIEW || "Pending Review",
      icon: Send,
      className:
        "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    },
    SUBMITTED: {
      label: adStatus.SUBMITTED || "Pending Review",
      icon: Send,
      className:
        "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    },
    APPROVED: {
      label: adStatus.APPROVED || "Approved",
      icon: CheckCircle,
      className:
        "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    },
    REJECTED: {
      label: adStatus.REJECTED || "Rejected",
      icon: XCircle,
      className:
        "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    },
    SCHEDULED: {
      label: adStatus.SCHEDULED || "Scheduled",
      icon: Clock,
      className: "bg-primary/10 text-primary border-primary/20",
    },
    RUNNING: {
      label: adStatus.RUNNING || "Running",
      icon: Play,
      className:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    PAUSED: {
      label: adStatus.PAUSED || "Paused",
      icon: Pause,
      className:
        "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    },
    COMPLETED: {
      label: adStatus.COMPLETED || "Completed",
      icon: CheckCircle,
      className:
        "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    },
    ARCHIVED: {
      label: adStatus.ARCHIVED || "Archived",
      icon: Archive,
      className: "bg-muted text-muted-foreground border-border",
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
