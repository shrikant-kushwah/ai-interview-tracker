import { Badge } from "@/components/ui/badge";
import { Status } from "@/types";

const statusConfig: Record<Status, { label: string; className: string }> = {
  applied: {
    label: "Applied",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },
  screening: {
    label: "Screening",
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  },
  interview: {
    label: "Interview",
    className: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  },
  offer: {
    label: "Offer",
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
  ghosted: {
    label: "Ghosted",
    className: "bg-slate-100 text-slate-600 hover:bg-slate-100",
  },
};

export default function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}