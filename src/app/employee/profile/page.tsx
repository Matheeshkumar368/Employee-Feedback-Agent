"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Loader2, LayoutDashboard, ClipboardList,
  History, Sparkles, Bell, UserCircle, Settings,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { NavItem } from "@/components/dashboard/Sidebar";
import { Building2, BadgeCheck, Briefcase, Mail } from "lucide-react";

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",           href: "/employee/dashboard",        icon: LayoutDashboard },
  { label: "Submit Feedback",     href: "/employee/feedback/submit",  icon: ClipboardList },
  { label: "My Feedback",         href: "/employee/feedback/history", icon: History },
  { label: "AI Feedback History", href: "/employee/ai-history",       icon: Sparkles, placeholder: true },
  { label: "Notifications",       href: "/employee/notifications",    icon: Bell, badge: "2" },
  { label: "Profile",             href: "/employee/profile",          icon: UserCircle },
  { label: "Settings",            href: "/employee/settings",         icon: Settings },
];

export default function EmployeeProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login/employee");
    if (!isLoading && user && user.role !== "employee") router.push("/admin/dashboard");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="employee">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-[#0d0d20] to-purple-500/5 p-8">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-violet-500/8 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-6 relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-violet-500/30 flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-violet-400 font-medium mt-0.5">{user.position}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Profile Details</h2>
          <div className="space-y-4">
            {[
              { icon: BadgeCheck, label: "Employee ID", value: user.employeeId, accent: "text-violet-400" },
              { icon: Mail,       label: "Email",       value: user.email,       accent: "text-blue-400" },
              { icon: Building2,  label: "Department",  value: user.department,  accent: "text-emerald-400" },
              { icon: Briefcase,  label: "Position",    value: user.position,    accent: "text-orange-400" },
            ].map(({ icon: Icon, label, value, accent }) => (
              <div key={label} className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-3.5 h-3.5 ${accent}`} />
                </div>
                <div>
                  <p className="text-xs text-white/35">{label}</p>
                  <p className="text-sm font-medium text-white/80 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-6 text-center">
          <p className="text-sm text-white/40">Profile editing will be available in the next release.</p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
