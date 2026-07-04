"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, LayoutDashboard, ClipboardList, History, Sparkles, Bell,
  UserCircle, Settings, Star, MessageSquare, ArrowRight, Search,
  Filter, ChevronDown, ChevronLeft, ChevronRight, Trash2,
  Eye, X, Calendar, Tag, Building2,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { NavItem } from "@/components/dashboard/Sidebar";
import Link from "next/link";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",           href: "/employee/dashboard",        icon: LayoutDashboard },
  { label: "Submit Feedback",     href: "/employee/feedback/submit",  icon: ClipboardList },
  { label: "My Feedback",         href: "/employee/feedback/history", icon: History },
  { label: "AI Feedback History", href: "/employee/ai-history",       icon: Sparkles, placeholder: true },
  { label: "Notifications",       href: "/employee/notifications",    icon: Bell, badge: "2" },
  { label: "Profile",             href: "/employee/profile",          icon: UserCircle },
  { label: "Settings",            href: "/employee/settings",         icon: Settings },
];

const SENT_CFG = {
  positive: { label: "Positive", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  neutral:  { label: "Neutral",  cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  negative: { label: "Negative", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
} as const;
const STAT_CFG = {
  pending:  { label: "Pending",  cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  reviewed: { label: "Reviewed", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  resolved: { label: "Resolved", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
} as const;

const CATEGORIES = [
  "Work Environment", "Management", "Salary",
  "Workload", "Career Growth", "Others",
];
const PAGE_SIZE = 6;

interface FbItem {
  _id: string;
  category: string;
  rating: number;
  message: string;
  department: string;
  isAnonymous: boolean;
  status: "pending" | "reviewed" | "resolved";
  createdAt: string;
  updatedAt: string;
  aiAnalysis?: {
    sentiment: "positive" | "neutral" | "negative";
    summary?: string;
    keywords?: string[];
    priority?: "high" | "medium" | "low";
    recommendedAction?: string;
  };
}

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-4 h-4" : "w-3 h-3";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn(cls, s <= rating ? "text-yellow-400 fill-yellow-400" : "text-white/15")} />
      ))}
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ fb, onClose }: { fb: FbItem; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f0f1e] shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-violet-500/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Feedback Details</h3>
                <p className="text-[10px] text-white/35">{formatDateTime(fb.createdAt)}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-white bg-white/[0.07] border border-white/10 px-2.5 py-1 rounded-lg">{fb.category}</span>
              <span className="text-xs font-semibold text-white/60 bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-lg">{fb.department}</span>
              {fb.aiAnalysis?.sentiment && (
                <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full border", SENT_CFG[fb.aiAnalysis.sentiment].cls)}>
                  {SENT_CFG[fb.aiAnalysis.sentiment].label}
                </span>
              )}
              <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full border", STAT_CFG[fb.status].cls)}>
                {STAT_CFG[fb.status].label}
              </span>
              {fb.isAnonymous && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-white/5 border-white/10 text-white/40">Anonymous</span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40">Rating</span>
              <StarRow rating={fb.rating} size="md" />
              <span className="text-sm font-bold text-white">{fb.rating}/5</span>
            </div>

            {/* Message */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
              <p className="text-xs text-white/35 mb-2 uppercase tracking-wider font-medium">Message</p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{fb.message}</p>
            </div>

            {/* AI Analysis */}
            {fb.aiAnalysis?.summary && (
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                <p className="text-[10px] text-violet-400 uppercase tracking-wider font-semibold mb-2">AI Summary</p>
                <p className="text-xs text-white/60 leading-relaxed italic">{fb.aiAnalysis.summary}</p>
                {fb.aiAnalysis.keywords && fb.aiAnalysis.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {fb.aiAnalysis.keywords.map((k) => (
                      <span key={k} className="text-[10px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">{k}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-3">
                <p className="text-white/30 mb-1">Submitted</p>
                <p className="text-white/60 font-medium">{formatDate(fb.createdAt)}</p>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-3">
                <p className="text-white/30 mb-1">Last Updated</p>
                <p className="text-white/60 font-medium">{formatDate(fb.updatedAt)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FeedbackHistoryPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();

  const [allItems, setAllItems]     = useState<FbItem[]>([]);
  const [total, setTotal]           = useState(0);
  const [fetching, setFetching]     = useState(true);
  const [page, setPage]             = useState(1);

  // filters
  const [search, setSearch]           = useState("");
  const [filterCategory, setFilterCat]= useState("");
  const [filterStatus, setFilterStat] = useState("");
  const [sortOrder, setSortOrder]     = useState<"desc" | "asc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  // detail modal
  const [detailItem, setDetailItem] = useState<FbItem | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);

  const buildQuery = useCallback(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", String(PAGE_SIZE));
    if (search)         p.set("search", search);
    if (filterCategory) p.set("category", filterCategory);
    if (filterStatus)   p.set("status", filterStatus);
    p.set("sort", sortOrder === "asc" ? "createdAt" : "-createdAt");
    return p.toString();
  }, [page, search, filterCategory, filterStatus, sortOrder]);

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch(`/api/feedback?${buildQuery()}`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const d = await res.json() as {
        feedbacks?: FbItem[];
        pagination?: { total: number };
      };
      setAllItems(d.feedbacks ?? []);
      setTotal(d.pagination?.total ?? 0);
    } catch { /* silent */ }
    finally { setFetching(false); }
  }, [token, buildQuery]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login/employee");
    if (user) void load();
  }, [user, isLoading, router, load]);

  // reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, filterCategory, filterStatus, sortOrder]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this feedback? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      const d = await res.json() as { error?: string };
      if (!res.ok) throw new Error(d.error ?? "Delete failed");
      toast({ title: "Deleted", description: "Feedback removed." });
      void load();
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Delete failed", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const activeFilters = [filterCategory, filterStatus].filter(Boolean).length;

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="employee">
      {detailItem && <DetailModal fb={detailItem} onClose={() => setDetailItem(null)} />}

      <div className="max-w-4xl mx-auto space-y-5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">My Feedback</h1>
            <p className="text-xs text-white/35 mt-0.5">
              {fetching ? "Loading…" : `${total} submission${total !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <Link
            href="/employee/feedback/submit"
            className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 py-2 rounded-xl font-medium hover:from-violet-500 hover:to-purple-500 transition-all flex-shrink-0"
          >
            <ClipboardList className="w-3.5 h-3.5" /> New
          </Link>
        </div>

        {/* ── Search + Filter bar ── */}
        <div className="space-y-3">
          <div className="flex gap-2">
            {/* Search */}
            <div className="flex-1 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 h-10">
              <Search className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search feedback…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-white/30 hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort */}
            <button
              onClick={() => setSortOrder((s) => s === "desc" ? "asc" : "desc")}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 h-10 text-xs text-white/50 hover:text-white hover:bg-white/[0.07] transition-all flex-shrink-0"
              title="Toggle sort order"
            >
              <Calendar className="w-3.5 h-3.5" />
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </button>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((f) => !f)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-xl border px-3 h-10 text-xs transition-all flex-shrink-0",
                showFilters || activeFilters > 0
                  ? "border-violet-500/40 bg-violet-500/10 text-violet-400"
                  : "border-white/10 bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.07]"
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
              {activeFilters > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                  {/* Category filter */}
                  <div className="relative">
                    <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/25 pointer-events-none" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCat(e.target.value)}
                      className="h-8 pl-7 pr-3 text-xs rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500/50"
                    >
                      <option value="" className="bg-[#0d0d1f]">All Categories</option>
                      {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0d0d1f]">{c}</option>)}
                    </select>
                  </div>

                  {/* Status filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStat(e.target.value)}
                    className="h-8 px-3 text-xs rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500/50"
                  >
                    <option value="" className="bg-[#0d0d1f]">All Statuses</option>
                    <option value="pending"  className="bg-[#0d0d1f]">Pending</option>
                    <option value="reviewed" className="bg-[#0d0d1f]">Reviewed</option>
                    <option value="resolved" className="bg-[#0d0d1f]">Resolved</option>
                  </select>

                  {activeFilters > 0 && (
                    <button
                      onClick={() => { setFilterCat(""); setFilterStat(""); }}
                      className="flex items-center gap-1 h-8 px-3 text-xs rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/15 transition-colors"
                    >
                      <X className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Feedback cards ── */}
        <div className="space-y-3">
          {fetching ? (
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-[#0d0d1f] p-5 animate-pulse">
                <div className="flex gap-2 mb-3">
                  <div className="h-5 w-28 bg-white/[0.06] rounded-lg" />
                  <div className="h-5 w-16 bg-white/[0.05] rounded-full" />
                </div>
                <div className="h-3 w-full bg-white/[0.05] rounded mb-1.5" />
                <div className="h-3 w-2/3 bg-white/[0.04] rounded" />
              </div>
            ))
          ) : allItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-12 text-center"
            >
              <MessageSquare className="w-10 h-10 text-white/15 mx-auto mb-4" />
              <p className="text-sm text-white/40 mb-1">
                {search || activeFilters > 0 ? "No feedback matches your filters" : "No feedback submitted yet"}
              </p>
              {!search && !activeFilters && (
                <Link
                  href="/employee/feedback/submit"
                  className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors mt-2"
                >
                  Submit your first feedback <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </motion.div>
          ) : (
            allItems.map((fb, i) => (
              <motion.div
                key={fb._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-5 hover:border-violet-500/20 hover:bg-violet-500/[0.02] transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-white bg-white/[0.07] border border-white/10 px-2 py-0.5 rounded-lg">
                      {fb.category}
                    </span>
                    {fb.aiAnalysis?.sentiment && (
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", SENT_CFG[fb.aiAnalysis.sentiment].cls)}>
                        {SENT_CFG[fb.aiAnalysis.sentiment].label}
                      </span>
                    )}
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", STAT_CFG[fb.status].cls)}>
                      {STAT_CFG[fb.status].label}
                    </span>
                    {fb.isAnonymous && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-white/5 border-white/10 text-white/35">Anon</span>
                    )}
                  </div>
                  <span className="text-[10px] text-white/25 flex-shrink-0 mt-0.5">{formatDate(fb.createdAt)}</span>
                </div>

                <p className="text-sm text-white/60 leading-relaxed line-clamp-2 mb-3">{fb.message}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StarRow rating={fb.rating} />
                    <span className="text-[10px] text-white/25">{fb.department}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setDetailItem(fb)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] text-white/40 hover:text-white hover:bg-white/[0.07] transition-all"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                    <button
                      onClick={() => void handleDelete(fb._id)}
                      disabled={deleting === fb._id}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                    >
                      {deleting === fb._id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Trash2 className="w-3 h-3" />
                      }
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-white/30">
              Page {page} of {totalPages} · {total} items
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || fetching}
                className="h-8 px-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pg = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={cn(
                      "h-8 w-8 rounded-lg text-xs font-medium transition-all",
                      pg === page
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                        : "text-white/40 hover:text-white hover:bg-white/[0.07]"
                    )}
                  >
                    {pg}
                  </button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || fetching}
                className="h-8 px-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
