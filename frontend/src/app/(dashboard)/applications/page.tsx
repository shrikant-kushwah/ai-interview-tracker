"use client";

import { useEffect, useState } from "react";
import { useApplicationStore } from "@/store/applicationStore";
import ApplicationCard from "@/components/applications/ApplicationCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BsPlus, BsSearch } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { Status } from "@/types";

const statusOptions: { label: string; value: Status | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Applied", value: "applied" },
  { label: "Screening", value: "screening" },
  { label: "Interview", value: "interview" },
  { label: "Offer", value: "offer" },
  { label: "Rejected", value: "rejected" },
  { label: "Ghosted", value: "ghosted" },
];

export default function ApplicationsPage() {
  const { applications, fetchApplications, loading } = useApplicationStore();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const selectedStatusLabel =
    statusOptions.find((opt) => opt.value === statusFilter)?.label ||
    "Filter status";

  useEffect(() => {
    fetchApplications();
  }, []);

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(search.toLowerCase()) ||
      app.role.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <p className="text-slate-500 mt-1">
            {applications.length} total application
            {applications.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => router.push("/applications/new")}>
          <BsPlus className="w-4 h-4 mr-2" />
          Add Application
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search company or role..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val as Status | "all")}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter status">
              {selectedStatusLabel}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center text-slate-400 py-20 text-sm">
          Loading applications...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-slate-400 py-20">
          <p className="text-sm">No applications found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/applications/new")}
          >
            Add your first application
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((app) => (
            <ApplicationCard key={app._id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
}
