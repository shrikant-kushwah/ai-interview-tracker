"use client";

import { useEffect } from "react";
import { useApplicationStore } from "@/store/applicationStore";
import { useAuthStore } from "@/store/authStore";
import StatsCard from "@/components/dashboard/StatsCard";
import StatusBadge from "@/components/applications/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BsBriefcase,
  BsCheckCircle,
  BsXCircle,
  BsClock,
} from "react-icons/bs";
import { Status } from "@/types";
import Link from "next/link";

const COLORS = {
  applied: "#3b82f6",
  screening: "#eab308",
  interview: "#a855f7",
  offer: "#22c55e",
  rejected: "#ef4444",
  ghosted: "#94a3b8",
};

export default function DashboardPage() {
  const { stats, fetchStats } = useApplicationStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const getCount = (status: Status) =>
    stats?.byStatus.find((s) => s._id === status)?.count || 0;

  const pieData = stats?.byStatus.map((s) => ({
    name: s._id,
    value: s.count,
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Here&apos;s your job search overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Applications"
          value={stats?.total || 0}
          icon={BsBriefcase}
          description="All time"
        />
        <StatsCard
          title="Interviews"
          value={getCount("interview")}
          icon={BsClock}
          description="Active interviews"
        />
        <StatsCard
          title="Offers"
          value={getCount("offer")}
          icon={BsCheckCircle}
          description="Offers received"
        />
        <StatsCard
          title="Rejected"
          value={getCount("rejected")}
          icon={BsXCircle}
          description="Total rejections"
        />
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Applications by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[entry.name as Status]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm">
                No data yet — add your first application
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recent.length ? (
              <div className="space-y-3">
                {stats.recent.map((app) => (
                  <Link key={app._id} href={`/applications/${app._id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {app.company}
                        </p>
                        <p className="text-xs text-slate-500">{app.role}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
                No applications yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}