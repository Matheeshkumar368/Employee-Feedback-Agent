"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Loader2, LayoutDashboard, Users, MessageSquare, Building2, FileBarChart, BarChart3, Sparkles, Settings, TrendingUp, TrendingDown, Minus } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { NavItem } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";

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

interface DeptStat { name: string; count: number; avgRating: number; positive: number; negative: number; neutral: number; positivePercent: number; negativePercent: number; }

export default function DepartmentsPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const [depts, setDepts] = useState<DeptStat[]>([]);
  const [fetching, setFetching] = useState(true);

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/dashboard/admin", { headers: { Authorization: `Bearer ${token ?? ""}` } });
      const d = await res.json() as { departmentStats?: DeptStat[] };
      setDepts(d.departmentStats ?? []);
    } catch { /* silent */ } finally { setFetching(false); }
  }, [token]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login/admin");
    if (!isLoading && user && user.role !== "admin") router.push("/employee/dashboard");
    if (user?.role === "admin") void load();
  }, [user, isLoading, router, load]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="admin">
      <div className="max-w-4xl mx-auto space-y-5">
        <h1 className="text-xl font-bold text-white">Departments</h1>
        <div className="grid md:grid-cols-2 gap-4">
          {fetching ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-[#0d0d1f] p-5 animate-pulse">
              <div className="h-4 w-28 bg-white/[0.06] rounded mb-3" />
              <div className="h-2 w-full bg-white/[0.04] rounded-full" />
            </div>
          )) : depts.length === 0 ? (
            <div className="col-span-2 text-center py-12 rounded-2xl border border-white/[0.07] bg-[#0d0d1f]">
              <p className="text-sm text-white/30">No department data yet. Seed the database first.</p>
            </div>
          ) : depts.map((dept, i) => (
            <motion.div key={dept.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white">{dept.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white/70">{dept.avgRating}★</span>
                  {dept.positivePercent >= 60 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> :
                   dept.negativePercent >= 40 ? <TrendingDown className="w-4 h-4 text-red-400" /> :
                   <Minus className="w-4 h-4 text-yellow-400" />}
                </div>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-3">
                <div className="bg-emerald-500 rounded-l-full" style={{ width: `${dept.positivePercent}%` }} />
                <div className="bg-yellow-500" style={{ width: `${dept.count > 0 ? Math.round((dept.neutral / dept.count) * 100) : 0}%` }} />
                <div className="bg-red-500 rounded-r-full flex-1 min-w-0" style={{ width: `${dept.negativePercent}%` }} />
              </div>
              <div className="flex gap-4 text-xs">
                {[["Positive", dept.positivePercent, "text-emerald-400"], ["Negative", dept.negativePercent, "text-red-400"]].map(([l, v, c]) => (
                  <span key={String(l)} className={cn("font-medium", c)}>{l}: {v}%</span>
                ))}
                <span className="text-white/30 ml-auto">{dept.count} feedback</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
