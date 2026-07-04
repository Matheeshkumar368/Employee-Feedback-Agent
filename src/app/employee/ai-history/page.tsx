"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Loader2, LayoutDashboard, ClipboardList, History, Sparkles,
  Bell, UserCircle, Settings, Star, ChevronLeft, ChevronRight, Brain,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { NavItem } from "@/components/dashboard/Sidebar";
import { cn, formatDate, getSentimentBg, getPriorityBg } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",           href: "/employee/dashboard",        icon: LayoutDashboard },
  { label: "Submit Feedback",     href: "/employee/feedback/submit",  icon: ClipboardList },
  { label: "My Feedback",         href: "/employee/feedback/history", icon: History },
  { label: "AI Feedback History", href: "/employee/ai-history",       icon: Sparkles },
  { label: "Notifications",       href: "/employee/notifications",    icon: Bell, badge: "2" },
  { label: "Profile",             href: "/employee/profile",          icon: UserCircle },
  { label: "Settings",            href: "/employee/settings",         icon: Settings },
];

interface AIFeedback {
  _id: string; category: string; department: string; rating: number;
  message: string; createdAt: string; status: string;
  aiAnalysis: {
    sentiment: "positive" | "neutral" | "negative";
    sentimentScore: number; summary: string; keywords: string[];
    priority: "high" | "medium" | "low";
    urgency: string; emotion: string;
    hrRecommendation: string; recommendedAction: string; analyzedAt: string;
  };
}

const PAGE_SIZE = 8;

export default function EmployeeAIHistoryPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const [items, setItems]     = useState<AIFeedback[]>([]);
  const [total, setTotal]     = useState(0);
  const [fetching, setFetching] = useState(true);
  const [page, setPage]       = useState(1);

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch(`/api/ai/history?page=${page}&limit=${PAGE_SIZE}`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const d = await res.json() as { feedbacks?: AIFeedback[]; pagination?: { total: number } };
      setItems(d.feedbacks ?? []);
      setTotal(d.pagination?.total ?? 0);
    } catch { /* silent */ } finally { setFetching(false); }
  }, [token, page]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login/employee");
    if (user) void load();
  }, [user, isLoading, router, load]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-violet-500 animate-spin" /></div>;
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="employee">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Feedback History</h1>
            <p className="text-xs text-white/35 mt-0.5">
              {fetching ? "Loading…" : `${total} analyzed submission${total !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {fetching ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-[#0d0d1f] p-5 animate-pulse">
                <div className="flex gap-2 mb-4"><div className="h-5 w-24 bg-white/[0.06] rounded" /><div className="h-5 w-16 bg-white/[0.05] rounded-full" /></div>
                <div className="h-3 w-full bg-white/[0.05] rounded mb-2" /><div className="h-3 w-2/3 bg-white/[0.04] rounded" />
              </div>
            ))
          ) : items.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-12 text-center">
              <Sparkles className="w-10 h-10 text-white/15 mx-auto mb-4" />
              <p className="text-sm text-white/40">No AI-analyzed feedback yet.</p>
              <p className="text-xs text-white/25 mt-1">Submit feedback to see AI analysis here.</p>
            </motion.div>
          ) : items.map((fb, i) => (
            <motion.div key={fb._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] overflow-hidden hover:border-violet-500/20 transition-all">
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05] bg-white/[0.01]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-white bg-white/[0.07] border border-white/10 px-2 py-0.5 rounded-lg">{fb.category}</span>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", getSentimentBg(fb.aiAnalysis.sentiment))}>
                    {fb.aiAnalysis.sentiment}
                  </span>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", getPriorityBg(fb.aiAnalysis.priority))}>
                    {fb.aiAnalysis.priority} priority
                  </span>
                  {fb.aiAnalysis.emotion && (
                    <span className="text-[10px] text-white/35 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full capitalize">{fb.aiAnalysis.emotion}</span>
                  )}
                </div>
                <span className="text-[10px] text-white/25 flex-shrink-0">{formatDate(fb.createdAt)}</span>
              </div>

              <div className="p-5 space-y-4">
                {/* Rating + message preview */}
                <div>
                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map((s) => <Star key={s} className={cn("w-3 h-3", s <= fb.rating ? "text-yellow-400 fill-yellow-400" : "text-white/15")} />)}
                  </div>
                  <p className="text-sm text-white/55 leading-relaxed line-clamp-2">{fb.message}</p>
                </div>

                {/* AI Summary */}
                <div className="rounded-xl bg-violet-500/5 border border-violet-500/15 p-4">
                  <p className="text-[10px] text-violet-400 uppercase tracking-wider font-semibold mb-1.5">AI Summary</p>
                  <p className="text-xs text-white/60 leading-relaxed">{fb.aiAnalysis.summary}</p>
                </div>

                {/* HR Recommendation */}
                {fb.aiAnalysis.hrRecommendation && (
                  <div className="rounded-xl bg-blue-500/5 border border-blue-500/15 p-4">
                    <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold mb-1.5">Suggestion</p>
                    <p className="text-xs text-white/55 leading-relaxed">{fb.aiAnalysis.hrRecommendation}</p>
                  </div>
                )}

                {/* Keywords */}
                {fb.aiAnalysis.keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {fb.aiAnalysis.keywords.map((k) => (
                      <span key={k} className="text-[10px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">{k}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-white/30">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-2">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 px-2">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
