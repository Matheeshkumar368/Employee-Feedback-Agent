"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Loader2,
  LayoutDashboard,
  Users,
  MessageSquare,
  Building2,
  FileBarChart,
  BarChart3,
  Sparkles,
  Settings,
  Brain,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { NavItem } from "@/components/dashboard/Sidebar";
import AdminHome from "./components/AdminHome";

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Employees", href: "/admin/employees", icon: Users },
  { label: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  { label: "Departments", href: "/admin/departments", icon: Building2 },
  { label: "Reports", href: "/admin/reports", icon: FileBarChart },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "AI Insights", href: "/admin/ai-insights", icon: Sparkles },
  { label: "AI Chat", href: "/admin/ai-chat", icon: Brain },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login/admin");
    if (!isLoading && user && user.role !== "admin") router.push("/employee/dashboard");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="admin">
      <AdminHome user={user} />
    </DashboardLayout>
  );
}
