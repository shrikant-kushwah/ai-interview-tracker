"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BsBriefcase,
  BsGrid1X2,
  BsPlusCircle,
  BsRobot,
  BsBoxArrowRight,
  BsX,
} from "react-icons/bs";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: BsGrid1X2,
  },
  {
    label: "Applications",
    href: "/applications",
    icon: BsBriefcase,
  },
  {
    label: "Add Application",
    href: "/applications/new",
    icon: BsPlusCircle,
  },
  {
    label: "AI Assistant",
    href: "/ai",
    icon: BsRobot,
  },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
  showClose?: boolean;
}

export default function Sidebar({
  className,
  onNavigate,
  showClose = false,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    onNavigate?.();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "bg-white border-r border-slate-200 flex flex-col",
        className,
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <BsBriefcase className="w-6 h-6 text-slate-700" />
          <span className="font-bold text-slate-900 text-lg">InterviewAI</span>
        </div>
        {showClose && (
          <button
            type="button"
            onClick={onNavigate}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close menu"
          >
            <BsX className="h-5 w-5" />
          </button>
        )}
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User + Logout */}
      <div className="p-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <BsBoxArrowRight className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
