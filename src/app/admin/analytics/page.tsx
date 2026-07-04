"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Loader2, LayoutDashboard, Users, MessageSquare,
  Building2, FileBarChart, BarChart3, Sparkles, Settings,
  Brain, RefreshCw, Download, Printer,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { NavItem } from "@/components/dashboard/Sidebar";
import type { AnalyticsData } from "./types";
import type { Filters } from "./components/FiltersBar";

import StatCards          from "./components/StatCards";
import FiltersBar         from "./components/FiltersBar";
import AIInsightsPanel    from "./components/AIInsightsPanel";
import DepartmentTable    from "./components/DepartmentTable";
import KeywordsPanel      from "./components/KeywordsPanel";
import {
  MonthlyTrendChart,
  DepartmentBarChart,
  SentimentPieChart,
  CategoryDonutChart,
  SatisfactionAreaChart,
  PriorityStackedBar,
  RatingDistributionChart,
} from "./components/Charts";

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",   href: "/admin/dashboard",   icon: LayoutDashboard },
  { label: "Employees",   href: "/admin/employees",   icon: Users },
  { label: "Feedback",    href: "/admin/feedback",    icon: MessageSquare },
  { label: "Departments", href: "/admin/departments", icon: Building2 },
  { label: "Reports",     href: "/admin/reports",     icon: FileBarChart },
  { label: "Analytics",   href: "/admin/analytics",   icon: BarChart3 },
  { label: "AI Insights", href: "/admin/ai-insights", icon: Sparkles },
  { label: "AI Chat",     href: "/admin/ai-chat",     icon: Brain },
  { label: "Settings",    href: "/admin/settings",    icon: Settings },
];

const EMPTY: AnalyticsData = {
  overview: {
    totalFeedback: 0, totalEmployees: 0, positive: 0, neutral: 0, negative: 0,
    avgRating: 0, pendingReviews: 0, resolved: 0, reviewed: 0, currentMonth: 0,
    highPriority: 0, mediumPriority: 0, lowPriority: 0, satisfactionPct: 0,
  },
  departmentStats: [], monthlyData: [], satisfactionTrend: [],
  categoryStats: [], ratingDistribution: [], keywords: [], topIssues: [], aiInsights: [],
};

export default function AnalyticsPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const [data, setData]       = useState<AnalyticsData>(EMPTY);
  const [fetching, setFetching] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    department: "", category: "", sentiment: "", priority: "", dateFrom: "", dateTo: "",
  });

  const buildQuery = useCallback(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) p.set(k, v); });
    return p.toString();
  }, [filters]);

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const qs = buildQuery();
      const res = await fetch(`/api/analytics${qs ? `?${qs}` : ""}`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
        cache: "no-store",
      });
      const d = await res.json() as AnalyticsData;
      setData(d);
    } catch { /* keep empty state */ }
    finally { setFetching(false); }
  }, [token, buildQuery]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login/admin");
    if (!isLoading && user && user.role !== "admin") router.push("/employee/dashboard");
    if (user?.role === "admin") void load();
  }, [user, isLoading, router, load]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader2 className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  // ── CSV export ─────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Employees",    data.overview.totalEmployees],
      ["Total Feedback",     data.overview.totalFeedback],
      ["Positive Feedback",  data.overview.positive],
      ["Neutral Feedback",   data.overview.neutral],
      ["Negative Feedback",  data.overview.negative],
      ["Average Rating",     data.overview.avgRating],
      ["Pending Reviews",    data.overview.pendingReviews],
      ["Resolved",           data.overview.resolved],
      ["Current Month",      data.overview.currentMonth],
      ["Satisfaction %",     data.overview.satisfactionPct],
      [],
      ["Department", "Count", "Avg Rating", "Positive %", "Negative %", "Trend"],
      ...data.departmentStats.map((d) => [
        d.department, d.count, d.avgRating, `${d.positivePercent}%`, `${d.negativePercent}%`, d.trend,
      ]),
      [],
      ["Month", "Total", "Avg Rating", "Positive", "Negative"],
      ...data.monthlyData.map((m) => [m.month, m.total, m.avgRating, m.positive, m.negative]),
      [],
      ["Keyword", "Count"],
      ...data.keywords.map((k) => [k.word, k.count]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aurahr-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printDashboard = () => window.print();

  const stagger = { visible: { transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
  const ov = data.overview;

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="admin">
      <div ref={printRef} className="max-w-[1400px] mx-auto space-y-6">

        {/* ── Page header ── */}
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={item} className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Analytics</h1>
                <p className="text-xs text-white/35 mt-0.5">
                  {fetching ? "Loading data…" : `${ov.totalFeedback} feedback · ${ov.totalEmployees} employees`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter */}
              <FiltersBar filters={filters} onChange={setFilters} onApply={() => void load()} />

              {/* Refresh */}
              <button onClick={() => void load()} disabled={fetching}
                className="p-2 rounded-xl border border-white/10 bg-white/[0.04] text-white/40 hover:text-white transition-all" title="Refresh">
                <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} />
              </button>

              {/* Export CSV */}
              <button onClick={exportCSV} disabled={fetching || ov.totalFeedback === 0}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 h-9 text-xs text-white/50 hover:text-white hover:bg-white/[0.07] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <Download className="w-3.5 h-3.5" /> CSV
              </button>

              {/* Print */}
              <button onClick={printDashboard}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 h-9 text-xs text-white/50 hover:text-white hover:bg-white/[0.07] transition-all">
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>
          </motion.div>

          {/* ── Stat cards ── */}
          <motion.div variants={item} className="mt-6">
            <StatCards overview={ov} loading={fetching} />
          </motion.div>

          {/* ── AI Insights ── */}
          <motion.div variants={item} className="mt-6">
            <AIInsightsPanel insights={data.aiInsights} loading={fetching} />
          </motion.div>

          {/* ── Chart grid row 1 ── */}
          <motion.div variants={item} className="mt-6 grid lg:grid-cols-2 gap-6">
            <MonthlyTrendChart   data={data.monthlyData}    loading={fetching} />
            <SatisfactionAreaChart data={data.satisfactionTrend} loading={fetching} />
          </motion.div>

          {/* ── Chart grid row 2 ── */}
          <motion.div variants={item} className="mt-6 grid md:grid-cols-3 gap-6">
            <SentimentPieChart
              positive={ov.positive} neutral={ov.neutral} negative={ov.negative}
              loading={fetching}
            />
            <CategoryDonutChart  data={data.categoryStats}    loading={fetching} />
            <RatingDistributionChart data={data.ratingDistribution} loading={fetching} />
          </motion.div>

          {/* ── Chart grid row 3 ── */}
          <motion.div variants={item} className="mt-6 grid lg:grid-cols-2 gap-6">
            <DepartmentBarChart data={data.departmentStats} loading={fetching} />
            <PriorityStackedBar
              high={ov.highPriority} medium={ov.mediumPriority} low={ov.lowPriority}
              loading={fetching}
            />
          </motion.div>

          {/* ── Department table ── */}
          <motion.div variants={item} className="mt-6">
            <DepartmentTable data={data.departmentStats} loading={fetching} />
          </motion.div>

          {/* ── Keywords ── */}
          <motion.div variants={item} className="mt-6">
            <KeywordsPanel keywords={data.keywords} loading={fetching} />
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
