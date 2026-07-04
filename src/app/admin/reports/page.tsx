"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, LayoutDashboard, Users, MessageSquare, Building2, FileBarChart, BarChart3, Sparkles, Settings } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { NavItem } from "@/components/dashboard/Sidebar";
import { motion } from "framer-motion";

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",   href: "/admin/dashboard",   icon: LayoutDashboard },
  { label: "Employees",   href: "/admin/employees",   icon: Users },
  { label: "Feedback",    href: "/admin/feedback",    icon: MessageSquare },
  { label: "Departments", href: "/admin/departments", icon: Building2 },
  { label: "Reports",     href: "/admin/reports",     icon: FileBarChart },
  { label: "Analytics",   href: "/admin/analytics",   icon: BarChart3 },
  { label: "AI Insights", href: "/admin/ai-insights", icon: Sparkles, placeholder: true },
  { label: "Settings",    href: "/admin/settings",    icon: Settings },
];

export default function ReportsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login/admin");
    if (!isLoading && user && user.role !== "admin") router.push("/employee/dashboard");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="admin">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-10 text-center">
          <FileBarChart className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Reports</h1>
          <p className="text-white/40 text-sm">Detailed HR reports and CSV exports will be available in the next release.</p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
