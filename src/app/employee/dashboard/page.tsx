"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Loader2, LayoutDashboard, ClipboardList, History, Sparkles, Bell, UserCircle, Settings } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { NavItem } from "@/components/dashboard/Sidebar";
import EmployeeHome from "./components/EmployeeHome";

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { label: "Submit Feedback", href: "/employee/feedback/submit", icon: ClipboardList },
  { label: "My Feedback", href: "/employee/feedback/history", icon: History },
  { label: "AI Feedback History", href: "/employee/ai-history", icon: Sparkles },
  { label: "Notifications", href: "/employee/notifications", icon: Bell, badge: "2" },
  { label: "Profile", href: "/employee/profile", icon: UserCircle },
  { label: "Settings", href: "/employee/settings", icon: Settings },
];

export default function EmployeeDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login/employee");
    if (!isLoading && user && user.role !== "employee") router.push("/admin/dashboard");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-violet-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="employee">
      <EmployeeHome user={user} />
    </DashboardLayout>
  );
}
