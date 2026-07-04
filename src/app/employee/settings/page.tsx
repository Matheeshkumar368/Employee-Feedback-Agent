"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, LayoutDashboard, ClipboardList, History, Sparkles, Bell, UserCircle, Settings } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { NavItem } from "@/components/dashboard/Sidebar";
import { motion } from "framer-motion";

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",           href: "/employee/dashboard",        icon: LayoutDashboard },
  { label: "Submit Feedback",     href: "/employee/feedback/submit",  icon: ClipboardList },
  { label: "My Feedback",         href: "/employee/feedback/history", icon: History },
  { label: "AI Feedback History", href: "/employee/ai-history",       icon: Sparkles, placeholder: true },
  { label: "Notifications",       href: "/employee/notifications",    icon: Bell, badge: "2" },
  { label: "Profile",             href: "/employee/profile",          icon: UserCircle },
  { label: "Settings",            href: "/employee/settings",         icon: Settings },
];

export default function EmployeeSettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login/employee");
    if (!isLoading && user && user.role !== "employee") router.push("/admin/dashboard");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-violet-500 animate-spin" /></div>;
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="employee">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-8 text-center">
          <Settings className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/40 text-sm">Account settings and preferences will be available soon.</p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
