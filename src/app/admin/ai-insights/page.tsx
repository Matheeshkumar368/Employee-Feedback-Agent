"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Loader2, LayoutDashboard, Users, MessageSquare, Building2, FileBarChart,
  BarChart3, Sparkles, Settings, Brain, TrendingUp, TrendingDown, Minus,
  AlertCircle, Star, RefreshCw, Clock,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { NavItem } from "@/components/dashboard/Sidebar";
import { cn, formatDate, getSentimentBg, getPriorityBg } from "@/lib/utils";

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

interface ReportData {
  period: { days: number; since: string };
  totals: { feedback: number; analyzed: number; coverage: number };
  sentiment: { positive: number; neutral: number; negative: number };
  priority: { high: number; medium: number; low: number };
  urgency: { immediate: number; soon: number; monitor: number; none: number };
  departmentSentiment: {
    department: string; positive: number; neutral: number; negative: number;
    total: number; avgRating: number; satisfactionScore: number; positivePercent: number;
  }[];
  topKeywords: { word: string; count: number }[];
  emotionBreakdown: { emotion: string; count: number }[];
  recentHighPriority: {
    _id: string; employeeName: string; department: string; category: string;
    rating: number; message: string; status: string; createdAt: string;
    aiAnalysis?: { sentiment: string; priority: string; summary: string; urgency: string };
  }[];
}

const EMOTION_COLORS: Record<string, string> = {
  frustrated: "text-red-400 bg-red-500/10 border-red-500/20",
  satisfied:  "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  motivated:  "text-blue-400 bg-blue-500/10 border-blue-500/20",
  anxious:    "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  disappointed:"text-orange-400 bg-orange-500/10 border-orange-500/20",
  hopeful:    "text-teal-400 bg-teal-500/10 border-teal-500/20",
  angry:      "text-red-500 bg-red-500/10 border-red-500/20",
  content:    "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  disengaged: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  overwhelmed:"text-purple-400 bg-purple-500/10 border-purple-500/20",
  appreciated:"text-pink-400 bg-pink-500/10 border-pink-500/20",
  neutral:    "text-white/40 bg-white/5 border-white/10",
};

export default function AdminAIInsightsPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const [data, setData]       = useState<ReportData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [days, setDays]       = useState(30);

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch(`/api/ai/report?days=${days}`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const d = await res.json() as ReportData;
      setData(d);
    } catch { /* silent */ } finally { setFetching(false); }
  }, [token, days]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login/admin");
    if (!isLoading && user && user.role !== "admin") router.push("/employee/dashboard");
    if (user?.role === "admin") void load();
  }, [user, isLoading, router, load]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  const s = data?.sentiment;
  const sentimentTotal = s ? s.positive + s.neutral + s.negative : 0;

  const stagger = { visible: { transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="admin">
      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Insights</h1>
              <p className="text-xs text-white/35 mt-0.5">
                {data ? `${data.totals.analyzed} of ${data.totals.feedback} feedback items analyzed (${data.totals.coverage}% coverage)` : "Loading…"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map((d) => (
              <button key={d} onClick={() => setDays(d)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  days === d ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : "text-white/40 hover:text-white border border-white/10 hover:bg-white/[0.05]")}>
                {d}d
              </button>
            ))}
            <button onClick={() => void load()} disabled={fetching}
              className="p-2 rounded-lg border border-white/10 bg-white/[0.04] text-white/40 hover:text-white transition-all">
              <RefreshCw className={cn("w-3.5 h-3.5", fetching && "animate-spin")} />
            </button>
          </div>
        </motion.div>

        {/* Sentiment bar */}
        {!fetching && data && sentimentTotal > 0 && (
          <motion.div variants={item} className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-5">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Overall Sentiment Distribution</p>
            <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((data.sentiment.positive / sentimentTotal) * 100)}%` }}
                transition={{ duration: 0.8 }} className="bg-emerald-500 rounded-l-full" />
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((data.sentiment.neutral / sentimentTotal) * 100)}%` }}
                transition={{ duration: 0.8, delay: 0.1 }} className="bg-yellow-500" />
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((data.sentiment.negative / sentimentTotal) * 100)}%` }}
                transition={{ duration: 0.8, delay: 0.2 }} className="bg-red-500 flex-1 min-w-0 rounded-r-full" />
            </div>
            <div className="flex gap-6 mt-2">
              {[
                { label: "Positive", val: data.sentiment.positive, color: "text-emerald-400" },
                { label: "Neutral",  val: data.sentiment.neutral,  color: "text-yellow-400" },
                { label: "Negative", val: data.sentiment.negative, color: "text-red-400" },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full", color.replace("text-", "bg-"))} />
                  <span className="text-xs text-white/40">{label}</span>
                  <span className={cn("text-xs font-bold", color)}>{val}</span>
                  <span className="text-[10px] text-white/20">({sentimentTotal > 0 ? Math.round((val/sentimentTotal)*100) : 0}%)</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Priority + Urgency cards */}
        {!fetching && data && (
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "High Priority",  val: data.priority.high,      icon: AlertCircle, color: "from-red-500 to-rose-600",   border: "border-red-500/20" },
              { label: "Urgent / Soon",  val: data.urgency.immediate + data.urgency.soon, icon: Clock, color: "from-orange-500 to-amber-600", border: "border-orange-500/20" },
              { label: "Medium Priority",val: data.priority.medium,    icon: Minus,      color: "from-yellow-500 to-amber-600",border: "border-yellow-500/20" },
              { label: "Low Priority",   val: data.priority.low,       icon: TrendingUp, color: "from-emerald-500 to-teal-600",border: "border-emerald-500/20" },
            ].map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className={cn("rounded-2xl border bg-[#0d0d1f] p-4", c.border)}>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center mb-3`}>
                  <c.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{c.val}</p>
                <p className="text-xs text-white/35 mt-0.5">{c.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Bottom grid: department + keywords + emotions + high-priority */}
        {!fetching && data && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Department sentiment */}
            <motion.div variants={item} className="lg:col-span-2 rounded-2xl border border-white/[0.07] bg-[#0d0d1f] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <h2 className="text-sm font-semibold text-white">Department Sentiment</h2>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {data.departmentSentiment.length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-8">No data yet</p>
                ) : data.departmentSentiment.map((dept) => (
                  <div key={dept.department} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3 h-3 text-white/25" />
                        <span className="text-xs font-medium text-white/75">{dept.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white/55">{dept.avgRating}★</span>
                        {dept.positivePercent >= 60 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> :
                         dept.positivePercent < 40 ? <TrendingDown className="w-3 h-3 text-red-400" /> :
                         <Minus className="w-3 h-3 text-yellow-400" />}
                      </div>
                    </div>
                    <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
                      <div className="bg-emerald-500 rounded-l-full" style={{ width: `${dept.positivePercent}%` }} />
                      <div className="bg-yellow-500" style={{ width: `${dept.total > 0 ? Math.round((dept.neutral / dept.total) * 100) : 0}%` }} />
                      <div className="flex-1 bg-red-500 rounded-r-full min-w-0" />
                    </div>
                    <p className="text-[10px] text-white/25 mt-1">{dept.total} feedback · {dept.positivePercent}% positive</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Top keywords */}
              <motion.div variants={item} className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Top Keywords</h2>
                {data.topKeywords.length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-4">No keywords yet</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {data.topKeywords.map(({ word, count }) => (
                      <span key={word} className="flex items-center gap-1 text-[11px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full">
                        {word}
                        <span className="text-[9px] text-violet-400/60 font-bold">{count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Emotion breakdown */}
              <motion.div variants={item} className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Employee Emotions</h2>
                {data.emotionBreakdown.length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-4">No emotion data yet</p>
                ) : (
                  <div className="space-y-2">
                    {data.emotionBreakdown.slice(0, 6).map(({ emotion, count }) => (
                      <div key={emotion} className="flex items-center justify-between">
                        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize",
                          EMOTION_COLORS[emotion] ?? "text-white/40 bg-white/5 border-white/10")}>{emotion}</span>
                        <span className="text-xs text-white/40 font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}

        {/* High-priority items */}
        {!fetching && data && data.recentHighPriority.length > 0 && (
          <motion.div variants={item} className="rounded-2xl border border-red-500/20 bg-[#0d0d1f] overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] bg-red-500/5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <h2 className="text-sm font-semibold text-white">High Priority — Unresolved</h2>
              <span className="ml-auto text-xs text-red-400 font-semibold">{data.recentHighPriority.length} items</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {data.recentHighPriority.map((fb, i) => (
                <motion.div key={fb._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                  className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-[10px] font-bold">
                        {fb.employeeName === "Anonymous" ? "?" : fb.employeeName.charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-white/75">{fb.employeeName}</span>
                      <span className="text-[10px] text-white/35">{fb.department}</span>
                      <span className="text-[10px] font-semibold bg-white/[0.05] border border-white/10 px-2 py-0.5 rounded-lg text-white/60">{fb.category}</span>
                      {fb.aiAnalysis?.sentiment && (
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", getSentimentBg(fb.aiAnalysis.sentiment))}>
                          {fb.aiAnalysis.sentiment}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {[1,2,3,4,5].map((s) => <Star key={s} className={cn("w-2.5 h-2.5", s <= fb.rating ? "text-yellow-400 fill-yellow-400" : "text-white/15")} />)}
                    </div>
                  </div>
                  {fb.aiAnalysis?.summary && (
                    <p className="text-xs text-white/50 leading-relaxed pl-8">{fb.aiAnalysis.summary}</p>
                  )}
                  <p className="text-[10px] text-white/25 mt-1.5 pl-8">{formatDate(fb.createdAt)} · {fb.status}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {fetching && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <p className="text-sm text-white/35">Loading AI report…</p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
