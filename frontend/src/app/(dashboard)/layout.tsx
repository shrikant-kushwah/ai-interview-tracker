"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { BsBriefcase, BsList } from "react-icons/bs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, checkAuth } = useAuthStore();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <div className="hidden lg:block lg:shrink-0">
        <Sidebar className="sticky top-0 h-screen w-64" />
      </div>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <BsBriefcase className="h-5 w-5 text-slate-700" />
          <span className="font-semibold text-slate-900">InterviewAI</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setMobileNavOpen(true)}
          className="px-2"
        >
          <BsList className="h-5 w-5" />
        </Button>
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative h-full w-72 max-w-[85vw]">
            <Sidebar
              className="h-full w-full"
              onNavigate={() => setMobileNavOpen(false)}
              showClose
            />
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
