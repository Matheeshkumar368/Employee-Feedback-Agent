"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Loader2, LayoutDashboard, Users, MessageSquare, Building2, FileBarChart, BarChart3, Sparkles, Settings, Search } from "lucide-react";
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

interface EmpUser {
  _id: string; employeeId: string; name: string; email: string;
  department: string; position: string; isActive: boolean; createdAt: string;
}

export default function AdminEmployeesPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState<EmpUser[]>([]);
  const [search, setSearch] = useState("");
  const [fetching, setFetching] = useState(true);

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/dashboard/admin", { headers: { Authorization: `Bearer ${token ?? ""}` } });
      const d = await res.json() as { recentEmployees?: EmpUser[] };
      setEmployees(d.recentEmployees ?? []);
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

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="admin">
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-white">Employees</h1>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-9 max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..." className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {["Employee", "Department", "Position", "ID", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-white/25 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fetching ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.03] animate-pulse">
                  {[...Array(5)].map((__, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3 bg-white/[0.05] rounded w-24" /></td>
                  ))}
                </tr>
              )) : filtered.map((emp, i) => (
                <motion.tr key={emp._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{emp.name.charAt(0)}</div>
                      <div>
                        <p className="font-medium text-white/80">{emp.name}</p>
                        <p className="text-[10px] text-white/35">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50">{emp.department}</td>
                  <td className="px-4 py-3 text-white/50">{emp.position}</td>
                  <td className="px-4 py-3 font-mono text-white/40">{emp.employeeId}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-0.5 rounded-full border text-[10px] font-semibold", emp.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20")}>
                      {emp.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {!fetching && filtered.length === 0 && (
            <div className="py-12 text-center"><p className="text-sm text-white/30">No employees found</p></div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
