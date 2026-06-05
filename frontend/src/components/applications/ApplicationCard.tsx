"use client";

import { Application } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge";
import { BsBuilding, BsCalendar, BsTrash } from "react-icons/bs";
import { useApplicationStore } from "@/store/applicationStore";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

// install date-fns
// npm install date-fns

interface Props {
  application: Application;
}

export default function ApplicationCard({ application }: Props) {
  const { deleteApplication } = useApplicationStore();
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click
    if (confirm(`Delete ${application.company} application?`)) {
      await deleteApplication(application._id);
    }
  };

  const handleClick = () => {
    router.push(`/applications/${application._id}`);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          {/* Left */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <BsBuilding className="w-4 h-4 text-slate-400" />
              <h3 className="font-semibold text-slate-900">
                {application.company}
              </h3>
            </div>
            <p className="text-sm text-slate-600">{application.role}</p>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <BsCalendar className="w-3 h-3" />
                {format(new Date(application.appliedDate), "dd MMM yyyy")}
              </span>
              {application.salary && (
                <span className="flex items-center gap-1">
                  <span className="text-xs font-semibold">₹</span>
                  {application.salary}
                </span>
              )}
              {application.interviews?.length > 0 && (
                <span className="text-purple-500">
                  {application.interviews.length} interview round
                  {application.interviews.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-end gap-3">
            <StatusBadge status={application.status} />
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 h-auto"
              onClick={handleDelete}
            >
              <BsTrash className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
