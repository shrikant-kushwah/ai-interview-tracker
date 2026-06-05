"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  BsArrowLeft,
  BsBuilding,
  BsCalendar,
  BsLink45Deg,
} from "react-icons/bs";

import { useApplicationStore } from "@/store/applicationStore";
import InterviewRoundsSection from "@/components/applications/InterviewRoundsSection";
import ApplicationAISection from "@/components/applications/ApplicationAISection";
import StatusBadge from "@/components/applications/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Status } from "@/types";

const statusLabels: Record<Status, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  ghosted: "Ghosted",
};

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentApplication, fetchApplication, updateApplication } =
    useApplicationStore();

  useEffect(() => {
    if (id) {
      fetchApplication(id);
    }
  }, [id, fetchApplication]);

  if (!currentApplication) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Loading...
      </div>
    );
  }

  const application = currentApplication;

  const handleStatusChange = async (status: Status) => {
    await updateApplication(application._id, { status });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-slate-500"
      >
        <BsArrowLeft className="mr-1 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BsBuilding className="h-5 w-5 text-slate-400" />
                <h1 className="text-2xl font-bold text-slate-900">
                  {application.company}
                </h1>
              </div>
              <p className="text-lg text-slate-600">{application.role}</p>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <BsCalendar className="h-3 w-3" />
                  Applied {format(new Date(application.appliedDate), "dd MMM yyyy")}
                </span>
                {application.salary && <span>₹ {application.salary}</span>}
                {application.jobDescriptionUrl && (
                  <a
                    href={application.jobDescriptionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-500 hover:underline"
                  >
                    <BsLink45Deg className="h-3 w-3" />
                    Job Posting
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <StatusBadge status={application.status} />
              <Select
                value={application.status}
                onValueChange={(value) => handleStatusChange(value as Status)}
              >
                <SelectTrigger className="w-full sm:w-40 text-sm">
                  <SelectValue>{statusLabels[application.status]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {application.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-slate-600">
                  {application.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {application.jobDescriptionText && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 overflow-y-auto pr-1">
                  <p className="whitespace-pre-wrap text-sm text-slate-600">
                    {application.jobDescriptionText}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <InterviewRoundsSection
            application={application}
            onRefresh={() => fetchApplication(application._id)}
            onUpdate={updateApplication}
          />
        </div>

        <ApplicationAISection application={application} />
      </div>
    </div>
  );
}
