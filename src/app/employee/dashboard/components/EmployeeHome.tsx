"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  ClipboardList,
  History,
  UserCircle,
  TrendingUp,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Calendar,
  Building2,
  BadgeCheck,
  Briefcase,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: "employee" | "admin";
  department: string;
  position: string;
  avatar?: string;
}

interface FeedbackItem {
  _id: string;
  category: string;
  rating: number;
  message: string;
  isAnonymous: boolean;
  status: "pending" | "reviewed" | "resolved";
  createdAt: string;
  aiAnalysis?: {
    sentiment: "positive" | "neutral" | "negative";
  };
}

interface DashboardStats {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  avgRating: number;
  pending: number;
  thisMonth: number;
  lastMonth: number;
  monthlyGoal: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentFeedback: FeedbackItem[];
}

// ─── Config ───────────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    icon: ClipboardList,
    label: "Submit Feedback",
    desc: "Share your thoughts",
    href: "/employee/feedback/submit",
    gradient: "from-violet-500 to-purple-600",
    glow: "hover:shadow-violet-500/20",
  },
  {
    icon: History,
    label: "View Feedback",
    desc: "Review your history",
    href: "/employee/feedback/history",
    gradient: "from-blue-500 to-indigo-600",
    glow: "hover:shadow-blue-500/20",
  },
  {
    icon: UserCircle,
    label: "Update Profile",
    desc: "Edit your details",
    href: "/employee/profile",
    gradient: "from-emerald-500 to-teal-600",
    glow: "hover:shadow-emerald-500/20",
  },
];

const SENTIMENT_CFG = {
  positive: { label: "Positive", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  neutral: { label: "Neutral", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  negative: { label: "Negative", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
} as const;

const STATUS_CFG = {
  pending: { label: "Pending", bg: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" },
  reviewed: { label: "Reviewed", bg: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  resolved: { label: "Resolved", bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "w-3 h-3",
            s <= rating ? "text-yellow-400 fill-yellow-400" : "text-white/15"
          )}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-white/[0.06] bg-[#0d0d1f] p-5 animate-pulse", className)}>
      <div className="h-3 w-20 bg-white/[0.06] rounded mb-3" />
      <div className="h-7 w-16 bg-white/[0.08] rounded mb-2" />
      <div className="h-2 w-24 bg-white/[0.05] rounded" />
    </div>
  );
}

function SkeletonFeedback() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d1f] p-4 animate-pulse">
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-24 bg-white/[0.06] rounded-lg" />
        <div className="h-5 w-16 bg-white/[0.05] rounded-full" />
      </div>
      <div className="h-3 w-full bg-white/[0.05] rounded mb-1.5" />
      <div className="h-3 w-3/4 bg-white/[0.04] rounded" />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EmployeeHome({ user }: { user: AuthUser }) {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/employee", {
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

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const s = data?.stats;
  const monthProgress = s
    ? Math.min(Math.round((s.thisMonth / s.monthlyGoal) * 100), 100)
    : 0;

  const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
  const item = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-6 max-w-7xl"
    >
      {/* ── Welcome card ── */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-[#0d0d20] to-purple-500/5 p-6 md:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-violet-500/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-48 h-48 rounded-full bg-purple-500/6 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-violet-500/30 flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  Good {getGreeting()}, {user.name.split(" ")[0]}
                </h1>
                <span className="text-lg">👋</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1 text-xs text-white/40">
                  <BadgeCheck className="w-3 h-3 text-violet-400" />
                  <span className="text-white/60">{user.employeeId}</span>
                </span>
                <span className="flex items-center gap-1 text-xs text-white/40">
                  <Building2 className="w-3 h-3" />
                  <span className="text-white/60">{user.department}</span>
                </span>
                <span className="flex items-center gap-1 text-xs text-white/40">
                  <Briefcase className="w-3 h-3 text-orange-400" />
                  <span className="text-white/60">{user.position}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Refresh */}
            <button
              onClick={() => void fetchData()}
              disabled={loading}
              className="p-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
              title="Refresh"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            </button>
            <div className="flex items-center gap-2 border border-white/[0.08] bg-white/[0.04] rounded-xl px-3 py-2">
              <Calendar className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
              <span className="text-xs text-white/50 hidden sm:block">{today}</span>
            </div>
          </div>
        </div>

        {/* Monthly progress bar */}
        <div className="relative mt-6 pt-5 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/40">Feedback this month</span>
            <span className="text-xs font-semibold text-violet-400">
              {loading ? "—" : `${s?.thisMonth ?? 0} / ${s?.monthlyGoal ?? 5}`}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: loading ? "0%" : `${monthProgress}%` }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
            />
          </div>
        </div>
      </motion.div>

      {/* ── Error banner ── */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center justify-between"
        >
          <span>{error}</span>
          <button
            onClick={() => void fetchData()}
            className="text-xs underline hover:no-underline"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* ── Stat cards ── */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Total Submitted" value={s?.total ?? 0} icon={ClipboardList} trend={s && s.lastMonth > 0 ? Math.round(((s.thisMonth - s.lastMonth) / s.lastMonth) * 100) : undefined} color="violet" index={0} />
            <StatCard title="Avg Rating" value={s?.avgRating ? `${s.avgRating}★` : "—"} icon={Star} color="yellow" index={1} subtitle="Out of 5 stars" />
            <StatCard title="Positive" value={s?.positive ?? 0} icon={TrendingUp} subtitle={s?.total ? `${Math.round((s.positive / s.total) * 100)}% of feedback` : "No feedback yet"} color="emerald" index={2} />
            <StatCard title="Pending Review" value={s?.pending ?? 0} icon={Clock} subtitle="Awaiting HR action" color="blue" index={3} />
          </>
        )}
      </motion.div>

      {/* ── Quick actions ── */}
      <motion.div variants={item}>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              whileHover={{ y: -3 }}
            >
              <Link
                href={action.href}
                className={cn(
                  "group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-4 transition-all duration-300 shadow-lg",
                  action.glow
                )}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}
                >
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{action.label}</p>
                  <p className="text-xs text-white/35">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Bottom grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent feedback (2/3 width) */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
              Recent Feedback
            </h2>
            <Link
              href="/employee/feedback/history"
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonFeedback key={i} />)
            ) : (data?.recentFeedback ?? []).length === 0 ? (
              <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-8 text-center">
                <MessageSquare className="w-8 h-8 text-white/15 mx-auto mb-3" />
                <p className="text-sm text-white/40">No feedback submitted yet</p>
                <Link
                  href="/employee/feedback/submit"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Submit your first feedback <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              (data?.recentFeedback ?? []).map((fb, i) => {
                const sent = fb.aiAnalysis?.sentiment;
                return (
                  <motion.div
                    key={fb._id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className="group rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-4 hover:border-violet-500/20 hover:bg-violet-500/[0.03] transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-white bg-white/[0.06] px-2 py-0.5 rounded-lg">
                          {fb.category}
                        </span>
                        {sent && (
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                              SENTIMENT_CFG[sent].bg,
                              SENTIMENT_CFG[sent].color
                            )}
                          >
                            {SENTIMENT_CFG[sent].label}
                          </span>
                        )}
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                            STATUS_CFG[fb.status].bg
                          )}
                        >
                          {STATUS_CFG[fb.status].label}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/30 flex-shrink-0">
                        {formatDate(fb.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed line-clamp-2">
                      {fb.message}
                    </p>
                    <div className="mt-2">
                      <StarRow rating={fb.rating} />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Right column (1/3) */}
        <div className="space-y-4">
          {/* Profile card */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-5"
          >
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
              Profile
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-violet-500/20 flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-white/40 truncate">{user.email}</p>
              </div>
            </div>
            <div className="space-y-0">
              {(
                [
                  ["Employee ID", user.employeeId],
                  ["Department", user.department],
                  ["Position", user.position],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
                >
                  <span className="text-xs text-white/35">{k}</span>
                  <span className="text-xs text-white/70 font-medium truncate max-w-[140px] text-right">
                    {v}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/employee/profile"
              className="mt-3 flex items-center justify-center gap-2 w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <UserCircle className="w-3.5 h-3.5" />
              Edit Profile
            </Link>
          </motion.div>

          {/* Feedback status summary */}
          {!loading && s && s.total > 0 && (
            <motion.div
              variants={item}
              className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-5"
            >
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
                Feedback Status
              </h2>
              <div className="space-y-2.5">
                {[
                  { label: "Positive", value: s.positive, color: "bg-emerald-500", total: s.total },
                  { label: "Neutral", value: s.neutral, color: "bg-yellow-500", total: s.total },
                  { label: "Negative", value: s.negative, color: "bg-red-500", total: s.total },
                ].map((item) => {
                  const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/50">{item.label}</span>
                        <span className="text-white/60 font-medium">{item.value} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={cn("h-full rounded-full", item.color)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Activity */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-5"
          >
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
              Activity
            </h2>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-3.5 h-3.5 rounded-full bg-white/[0.06] mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-2.5 bg-white/[0.06] rounded w-full mb-1" />
                      <div className="h-2 bg-white/[0.04] rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (data?.recentFeedback ?? []).length === 0 ? (
              <p className="text-xs text-white/30 text-center py-2">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {(data?.recentFeedback ?? []).slice(0, 4).map((fb, i) => {
                  const icons = [CheckCircle2, MessageSquare, Star, AlertCircle];
                  const colors = ["text-emerald-400", "text-blue-400", "text-yellow-400", "text-violet-400"];
                  const Icon = icons[i % icons.length];
                  return (
                    <div key={fb._id} className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Icon className={cn("w-3.5 h-3.5", colors[i % colors.length])} />
                      </div>
                      <div>
                        <p className="text-xs text-white/60 leading-relaxed">
                          {fb.status === "reviewed"
                            ? "HR reviewed your feedback"
                            : fb.status === "resolved"
                            ? "Feedback resolved by HR"
                            : `Submitted ${fb.category} feedback`}
                        </p>
                        <p className="text-[10px] text-white/25 mt-0.5">
                          {formatDate(fb.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* AI placeholder */}
          <motion.div
            variants={item}
            className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-5"
          >
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-violet-500/15 blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                AI Insights
              </span>
              <span className="text-[9px] font-semibold text-violet-400/60 border border-violet-500/30 rounded-full px-1.5 py-0.5">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              AI-powered sentiment analysis and personalized HR recommendations will appear here.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
