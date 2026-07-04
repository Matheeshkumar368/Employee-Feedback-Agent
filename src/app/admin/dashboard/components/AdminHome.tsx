"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users, MessageSquare, TrendingUp, TrendingDown, Minus,
  Star, Clock, CheckCircle2, Shield, Building2, ArrowRight,
  Sparkles, FileBarChart, BarChart3, UserPlus, Download,
  Eye, Calendar, RefreshCw,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthUser {
  id: string; employeeId: string; name: string; email: string;
  role: "employee" | "admin"; department: string; position: string; avatar?: string;
}

interface FeedbackItem {
  _id: string; employeeName: string; employeeId: string; department: string;
  category: string; rating: number; status: "pending" | "reviewed" | "resolved";
  createdAt: string;
  aiAnalysis?: { sentiment: "positive" | "neutral" | "negative" };
}

interface DeptStat {
  name: string; count: number; avgRating: number;
  positive: number; negative: number; neutral: number;
  positivePercent: number; negativePercent: number;
}

interface EmployeeStat {
  _id: unknown; employeeId: string; name: string;
  department: string; position: string; createdAt: string;
  feedbackCount: number; avgRating: number;
}

interface AdminStats {
  totalEmployees: number; newEmployeesThisMonth: number;
  totalFeedback: number; feedbackThisMonth: number; feedbackTrend: number;
  positive: number; neutral: number; negative: number;
  avgRating: number; pendingReviews: number; resolved: number; reviewed: number;
}

interface DashboardData {
  stats: AdminStats;
  recentFeedback: FeedbackItem[];
  departmentStats: DeptStat[];
  recentEmployees: EmployeeStat[];
}

// ─── Static config ────────────────────────────────────────────────────────────
const SENTIMENT_CFG = {
  positive: { label: "Positive", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  neutral:  { label: "Neutral",  cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  negative: { label: "Negative", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
} as const;

const STATUS_CFG = {
  pending:  { label: "Pending",  cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  reviewed: { label: "Reviewed", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  resolved: { label: "Resolved", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
} as const;

const QUICK_ACTIONS = [
  { icon: UserPlus,    label: "Add Employee",  desc: "Register new member",    href: "/admin/employees",  gradient: "from-blue-500 to-indigo-600",  glow: "hover:shadow-blue-500/20" },
  { icon: Download,    label: "Export Report", desc: "Download feedback CSV",  href: "/admin/reports",    gradient: "from-violet-500 to-purple-600", glow: "hover:shadow-violet-500/20" },
  { icon: FileBarChart,label: "View Reports",  desc: "Detailed HR reports",    href: "/admin/reports",    gradient: "from-pink-500 to-rose-500",    glow: "hover:shadow-pink-500/20" },
  { icon: Users,       label: "Employees",     desc: "Manage team",            href: "/admin/employees",  gradient: "from-emerald-500 to-teal-600", glow: "hover:shadow-emerald-500/20" },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn("w-2.5 h-2.5", s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-white/15")} />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d1f] p-5 animate-pulse">
      <div className="h-2.5 w-20 bg-white/[0.06] rounded mb-3" />
      <div className="h-7 w-14 bg-white/[0.08] rounded mb-2" />
      <div className="h-2 w-24 bg-white/[0.05] rounded" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminHome({ user }: { user: AuthUser }) {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/admin", {
        headers: { Authorization: `Bearer ${token ?? ""}` },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load dashboard");
      const json = (await res.json()) as DashboardData;
      setData(json);
    } catch {
      setError("Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const s = data?.stats;
  const stagger = { visible: { transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

  // Build stat cards from live data
  const STATS = s ? [
    { title: "Total Employees",  value: s.totalEmployees,  icon: Users,        color: "blue" as const,    trend: s.newEmployeesThisMonth > 0 ? undefined : undefined, subtitle: `${s.newEmployeesThisMonth} joined this month` },
    { title: "Total Feedback",   value: s.totalFeedback,   icon: MessageSquare,color: "violet" as const,  trend: s.feedbackTrend, subtitle: `${s.feedbackThisMonth} this month` },
    { title: "Positive",         value: s.positive,        icon: TrendingUp,   color: "emerald" as const, subtitle: s.totalFeedback > 0 ? `${Math.round((s.positive / s.totalFeedback) * 100)}% of total` : "No feedback" },
    { title: "Neutral",          value: s.neutral,         icon: Minus,        color: "yellow" as const,  subtitle: s.totalFeedback > 0 ? `${Math.round((s.neutral / s.totalFeedback) * 100)}% of total` : undefined },
    { title: "Negative",         value: s.negative,        icon: TrendingDown, color: "red" as const,     subtitle: s.totalFeedback > 0 ? `${Math.round((s.negative / s.totalFeedback) * 100)}% of total` : undefined },
    { title: "Avg Rating",       value: s.avgRating ? `${s.avgRating}★` : "—", icon: Star, color: "indigo" as const, subtitle: "Out of 5 stars" },
  ] : [];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-7xl">

      {/* ── Header banner ── */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-[#0d0d20] to-indigo-500/5 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-blue-500/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-32 w-48 h-48 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30 flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white mb-1">HR Command Center</h1>
              <p className="text-white/50 text-sm">
                Welcome back, <span className="text-blue-400 font-medium">{user.name}</span> · {user.department}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button onClick={() => void fetchData()} disabled={loading}
              className="p-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all" title="Refresh">
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            </button>
            <div className="flex items-center gap-2 border border-white/[0.08] bg-white/[0.04] rounded-xl px-3 py-2">
              <Calendar className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span className="text-xs text-white/50 hidden sm:block">{today}</span>
            </div>
          </div>
        </div>
        <div className="relative mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-xs text-white/40">
              <span className="text-yellow-400 font-semibold">
                {loading ? "—" : s?.pendingReviews ?? 0} items
              </span> pending your review
            </span>
          </div>
          <Link href="/admin/feedback" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
            Review now <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </motion.div>

      {/* ── Error ── */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => void fetchData()} className="text-xs underline hover:no-underline">Retry</button>
        </motion.div>
      )}

      {/* ── Stat cards ── */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : STATS.map((stat, i) => (
            <StatCard key={stat.title} title={stat.title} value={stat.value}
              icon={stat.icon} color={stat.color} trend={stat.trend}
              subtitle={stat.subtitle} index={i} />
          ))
        }
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div variants={item}>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((a, i) => (
            <motion.div key={a.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.07 }} whileHover={{ y: -2 }}>
              <Link href={a.href} className={cn("group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#0d0d1f] p-3.5 transition-all duration-300 shadow-lg", a.glow)}>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${a.gradient} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                  <a.icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{a.label}</p>
                  <p className="text-[10px] text-white/35 truncate">{a.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Pending stat bar ── */}
      {!loading && s && s.totalFeedback > 0 && (
        <motion.div variants={item}
          className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Feedback Overview</h2>
            <span className="text-xs text-white/40">{s.totalFeedback} total</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((s.positive / s.totalFeedback) * 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }} className="bg-emerald-500 rounded-l-full" />
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((s.neutral / s.totalFeedback) * 100)}%` }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }} className="bg-yellow-500" />
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((s.negative / s.totalFeedback) * 100)}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="bg-red-500 rounded-r-full flex-1 min-w-0" />
          </div>
          <div className="flex gap-4 mt-2">
            {[["Positive", s.positive, "text-emerald-400"], ["Neutral", s.neutral, "text-yellow-400"], ["Negative", s.negative, "text-red-400"]].map(([l, v, c]) => (
              <div key={String(l)} className="flex items-center gap-1.5">
                <div className={cn("w-1.5 h-1.5 rounded-full", String(c).replace("text-", "bg-"))} />
                <span className="text-xs text-white/40">{l}</span>
                <span className={cn("text-xs font-semibold", c)}>{v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Recent Feedback Table ── */}
      <motion.div variants={item} className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Recent Feedback</h2>
          <Link href="/admin/feedback" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-6 h-6 rounded-lg bg-white/[0.06] flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 bg-white/[0.06] rounded w-32" />
                  <div className="h-2 bg-white/[0.04] rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : (data?.recentFeedback ?? []).length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-8 h-8 text-white/15 mx-auto mb-3" />
            <p className="text-sm text-white/40">No feedback yet. Seed the database to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["Employee", "Department", "Category", "Rating", "Sentiment", "Status", "Date", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-white/25 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.recentFeedback ?? []).map((fb, i) => (
                  <motion.tr key={fb._id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {fb.employeeName === "Anonymous" ? "?" : fb.employeeName.charAt(0)}
                        </div>
                        <span className="font-medium text-white/80 whitespace-nowrap">{fb.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/50 whitespace-nowrap">{fb.department}</td>
                    <td className="px-4 py-3">
                      <span className="text-white/60 bg-white/[0.05] px-2 py-0.5 rounded-lg whitespace-nowrap">{fb.category}</span>
                    </td>
                    <td className="px-4 py-3"><StarRow rating={fb.rating} /></td>
                    <td className="px-4 py-3">
                      {fb.aiAnalysis?.sentiment ? (
                        <span className={cn("px-2 py-0.5 rounded-full border text-[10px] font-semibold whitespace-nowrap", SENTIMENT_CFG[fb.aiAnalysis.sentiment].cls)}>
                          {SENTIMENT_CFG[fb.aiAnalysis.sentiment].label}
                        </span>
                      ) : <span className="text-white/20 text-[10px]">Pending</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 rounded-full border text-[10px] font-semibold whitespace-nowrap", STATUS_CFG[fb.status].cls)}>
                        {STATUS_CFG[fb.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/30 whitespace-nowrap">{formatDate(fb.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── Three-col bottom ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Employee list */}
        <motion.div variants={item} className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">Recent Employees</h2>
            <Link href="/admin/employees" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-2.5 bg-white/[0.06] rounded w-28" />
                  <div className="h-2 bg-white/[0.04] rounded w-20" />
                </div>
              </div>
            )) : (data?.recentEmployees ?? []).map((emp, i) => (
              <motion.div key={String(emp.employeeId)} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {emp.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/80 truncate">{emp.name}</p>
                  <p className="text-[10px] text-white/35 truncate">{emp.department}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-white/70">{emp.avgRating > 0 ? `${emp.avgRating}★` : "—"}</p>
                  <p className="text-[10px] text-white/25">{emp.feedbackCount} fb</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Department summary */}
        <motion.div variants={item} className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">Departments</h2>
            <Link href="/admin/departments" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-3 animate-pulse">
                <div className="flex justify-between mb-2"><div className="h-2.5 bg-white/[0.06] rounded w-24" /><div className="h-2.5 bg-white/[0.05] rounded w-8" /></div>
                <div className="h-1.5 bg-white/[0.04] rounded-full" />
              </div>
            )) : (data?.departmentStats ?? []).map((dept, i) => (
              <motion.div key={dept.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.45 + i * 0.06 }}
                className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3 h-3 text-white/30" />
                    <span className="text-xs font-medium text-white/75">{dept.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white/60">{dept.avgRating}★</span>
                    {dept.positivePercent >= 60 && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                    {dept.negativePercent >= 40 && <TrendingDown className="w-3 h-3 text-red-400" />}
                    {dept.positivePercent < 60 && dept.negativePercent < 40 && <Minus className="w-3 h-3 text-yellow-400" />}
                  </div>
                </div>
                <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
                  <div className="bg-emerald-500 rounded-l-full" style={{ width: `${dept.positivePercent}%` }} />
                  <div className="bg-red-500/70 rounded-r-full" style={{ width: `${dept.negativePercent}%` }} />
                  <div className="flex-1 bg-white/[0.06] rounded-full" />
                </div>
                <p className="text-[10px] text-white/25 mt-1">{dept.count} feedback items</p>
              </motion.div>
            ))}
            {!loading && (data?.departmentStats ?? []).length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-xs text-white/30">No department data yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Activity / recent employee signups */}
          <motion.div variants={item} className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {loading ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-3.5 h-3.5 rounded-full bg-white/[0.06] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-1"><div className="h-2.5 bg-white/[0.06] rounded w-full" /><div className="h-2 bg-white/[0.04] rounded w-16" /></div>
                </div>
              )) : (data?.recentFeedback ?? []).slice(0, 5).map((fb, i) => {
                const icons = [CheckCircle2, MessageSquare, Shield, UserPlus];
                const colors = ["text-emerald-400", "text-blue-400", "text-yellow-400", "text-violet-400"];
                const Icon = icons[i % icons.length];
                return (
                  <div key={fb._id} className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Icon className={cn("w-3.5 h-3.5", colors[i % colors.length])} />
                    </div>
                    <div>
                      <p className="text-xs text-white/60 leading-relaxed">
                        {fb.status === "resolved" ? `Resolved: ${fb.category}` : fb.status === "reviewed" ? `Reviewed feedback from ${fb.department}` : `New ${fb.department} feedback submitted`}
                      </p>
                      <p className="text-[10px] text-white/25 mt-0.5">{formatDate(fb.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              {!loading && (data?.recentFeedback ?? []).length === 0 && (
                <p className="text-xs text-white/30 text-center py-2">No activity yet</p>
              )}
            </div>
          </motion.div>

          {/* Analytics placeholder */}
          <motion.div variants={item} className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-5">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Analytics</span>
              <span className="text-[9px] font-semibold text-blue-400/60 border border-blue-500/30 rounded-full px-1.5 py-0.5">Coming Soon</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">Interactive charts and sentiment trend analysis.</p>
          </motion.div>

          {/* AI Insights placeholder */}
          <motion.div variants={item} className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-5">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-violet-500/15 blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">AI Insights</span>
              <span className="text-[9px] font-semibold text-violet-400/60 border border-violet-500/30 rounded-full px-1.5 py-0.5">Coming Soon</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">Gemini-powered HR recommendations and pattern analysis.</p>
          </motion.div>

          {/* Pending card */}
          <motion.div variants={item} className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{loading ? "—" : s?.pendingReviews ?? 0} Pending</p>
                <p className="text-xs text-white/40">Awaiting review</p>
              </div>
              <Link href="/admin/feedback" className="ml-auto p-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors">
                <ArrowRight className="w-3.5 h-3.5 text-yellow-400" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
