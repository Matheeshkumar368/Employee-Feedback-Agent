"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, LayoutDashboard, Users, MessageSquare, Building2,
  FileBarChart, BarChart3, Sparkles, Settings, Star, Search,
  Filter, X, Eye, Trash2, ChevronLeft, ChevronRight,
  Calendar, Tag, CheckCircle2, Clock, RefreshCw,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { NavItem } from "@/components/dashboard/Sidebar";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

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
const DEPARTMENTS = [
  "Engineering", "Human Resources", "Marketing", "Sales",
  "Finance", "Operations", "Design", "Product", "Legal", "Customer Support",
];
const PAGE_SIZE = 10;

interface FbItem {
  _id: string; employeeName: string; employeeId: string; department: string;
  category: string; rating: number; message: string; isAnonymous: boolean;
  status: "pending" | "reviewed" | "resolved"; createdAt: string; updatedAt: string;
  aiAnalysis?: {
    sentiment: "positive" | "neutral" | "negative";
    summary?: string; keywords?: string[]; priority?: "high" | "medium" | "low";
    recommendedAction?: string;
  };
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn("w-2.5 h-2.5", s <= rating ? "text-yellow-400 fill-yellow-400" : "text-white/15")} />
      ))}
    </div>
  );
}

function DetailModal({ fb, onClose, onStatusChange }: {
  fb: FbItem;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);
  const update = async (status: string) => {
    setUpdating(true);
    await onStatusChange(fb._id, status);
    setUpdating(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f0f1e] shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}>

          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-blue-500/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
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
            {/* Employee row */}
            <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {fb.isAnonymous ? "?" : fb.employeeName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{fb.employeeName}</p>
                <p className="text-[10px] text-white/35 font-mono">{fb.employeeId} · {fb.department}</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-white bg-white/[0.07] border border-white/10 px-2.5 py-1 rounded-lg">{fb.category}</span>
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
              <div className="flex gap-1">
                {[1,2,3,4,5].map((s) => <Star key={s} className={cn("w-4 h-4", s <= fb.rating ? "text-yellow-400 fill-yellow-400" : "text-white/15")} />)}
              </div>
              <span className="text-sm font-bold text-white">{fb.rating}/5</span>
            </div>

            {/* Message */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
              <p className="text-xs text-white/35 mb-2 uppercase tracking-wider font-medium">Message</p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{fb.message}</p>
            </div>

            {/* AI */}
            {fb.aiAnalysis?.summary && (
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                <p className="text-[10px] text-violet-400 uppercase tracking-wider font-semibold mb-2">AI Analysis</p>
                <p className="text-xs text-white/60 leading-relaxed italic mb-3">{fb.aiAnalysis.summary}</p>
                {fb.aiAnalysis.recommendedAction && (
                  <p className="text-xs text-white/50"><span className="text-violet-400 font-medium">Action: </span>{fb.aiAnalysis.recommendedAction}</p>
                )}
                {fb.aiAnalysis.keywords && fb.aiAnalysis.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {fb.aiAnalysis.keywords.map((k) => (
                      <span key={k} className="text-[10px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">{k}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Status actions */}
            <div>
              <p className="text-xs text-white/35 mb-2 uppercase tracking-wider font-medium">Update Status</p>
              <div className="flex gap-2">
                {(["pending", "reviewed", "resolved"] as const).map((s) => (
                  <button key={s} onClick={() => void update(s)} disabled={updating || fb.status === s}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all",
                      fb.status === s
                        ? cn(STAT_CFG[s].cls, "cursor-default")
                        : "border-white/10 text-white/40 hover:text-white hover:bg-white/[0.07]"
                    )}>
                    {updating && fb.status !== s ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : STAT_CFG[s].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AdminFeedbackPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();

  const [items, setItems]       = useState<FbItem[]>([]);
  const [total, setTotal]       = useState(0);
  const [fetching, setFetching] = useState(true);
  const [page, setPage]         = useState(1);

  const [search, setSearch]               = useState("");
  const [filterDept, setFilterDept]       = useState("");
  const [filterCat, setFilterCat]         = useState("");
  const [filterStat, setFilterStat]       = useState("");
  const [filterSent, setFilterSent]       = useState("");
  const [sortOrder, setSortOrder]         = useState<"desc"|"asc">("desc");
  const [showFilters, setShowFilters]     = useState(false);
  const [detailItem, setDetailItem]       = useState<FbItem | null>(null);
  const [deleting, setDeleting]           = useState<string | null>(null);

  const buildQuery = useCallback(() => {
    const p = new URLSearchParams();
    p.set("page", String(page)); p.set("limit", String(PAGE_SIZE));
    if (search)      p.set("search", search);
    if (filterDept)  p.set("department", filterDept);
    if (filterCat)   p.set("category", filterCat);
    if (filterStat)  p.set("status", filterStat);
    if (filterSent)  p.set("sentiment", filterSent);
    p.set("sort", sortOrder === "asc" ? "createdAt" : "-createdAt");
    return p.toString();
  }, [page, search, filterDept, filterCat, filterStat, filterSent, sortOrder]);

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch(`/api/feedback?${buildQuery()}`, { headers: { Authorization: `Bearer ${token ?? ""}` } });
      const d = await res.json() as { feedbacks?: FbItem[]; pagination?: { total: number } };
      setItems(d.feedbacks ?? []);
      setTotal(d.pagination?.total ?? 0);
    } catch { /* silent */ } finally { setFetching(false); }
  }, [token, buildQuery]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login/admin");
    if (!isLoading && user && user.role !== "admin") router.push("/employee/dashboard");
    if (user?.role === "admin") void load();
  }, [user, isLoading, router, load]);

  useEffect(() => { setPage(1); }, [search, filterDept, filterCat, filterStat, filterSent, sortOrder]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const activeFilters = [filterDept, filterCat, filterStat, filterSent].filter(Boolean).length;

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
      body: JSON.stringify({ status }),
    });
    void load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this feedback permanently?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/feedback/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token ?? ""}` } });
      const d = await res.json() as { error?: string };
      if (!res.ok) throw new Error(d.error ?? "Delete failed");
      toast({ title: "Deleted", description: "Feedback removed." });
      void load();
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Delete failed", variant: "destructive" });
    } finally { setDeleting(null); }
  };

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="admin">
      {detailItem && (
        <DetailModal
          fb={detailItem}
          onClose={() => { setDetailItem(null); void load(); }}
          onStatusChange={updateStatus}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">All Feedback</h1>
            <p className="text-xs text-white/35 mt-0.5">
              {fetching ? "Loading…" : `${total} submission${total !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button onClick={() => void load()} disabled={fetching}
            className="p-2 rounded-xl border border-white/10 bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.07] transition-all">
            <RefreshCw className={cn("w-4 h-4", fetching && "animate-spin")} />
          </button>
        </div>

        {/* Search + filter bar */}
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 h-10">
              <Search className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, message, category…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none" />
              {search && <button onClick={() => setSearch("")} className="text-white/30 hover:text-white"><X className="w-3.5 h-3.5" /></button>}
            </div>

            <button onClick={() => setSortOrder((s) => s === "desc" ? "asc" : "desc")}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 h-10 text-xs text-white/50 hover:text-white hover:bg-white/[0.07] transition-all">
              <Calendar className="w-3.5 h-3.5" />
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </button>

            <button onClick={() => setShowFilters((f) => !f)}
              className={cn("relative flex items-center gap-1.5 rounded-xl border px-3 h-10 text-xs transition-all",
                showFilters || activeFilters > 0 ? "border-blue-500/40 bg-blue-500/10 text-blue-400" : "border-white/10 bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.07]")}>
              <Filter className="w-3.5 h-3.5" /> Filters
              {activeFilters > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">{activeFilters}</span>
              )}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                  {/* Dept */}
                  <div className="relative">
                    <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/25 pointer-events-none" />
                    <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
                      className="h-8 pl-7 pr-3 text-xs rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none">
                      <option value="" className="bg-[#0d0d1f]">All Depts</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d} className="bg-[#0d0d1f]">{d}</option>)}
                    </select>
                  </div>
                  {/* Category */}
                  <div className="relative">
                    <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/25 pointer-events-none" />
                    <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
                      className="h-8 pl-7 pr-3 text-xs rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none">
                      <option value="" className="bg-[#0d0d1f]">All Categories</option>
                      {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0d0d1f]">{c}</option>)}
                    </select>
                  </div>
                  {/* Status */}
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/25 pointer-events-none" />
                    <select value={filterStat} onChange={(e) => setFilterStat(e.target.value)}
                      className="h-8 pl-7 pr-3 text-xs rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none">
                      <option value="" className="bg-[#0d0d1f]">All Statuses</option>
                      <option value="pending"  className="bg-[#0d0d1f]">Pending</option>
                      <option value="reviewed" className="bg-[#0d0d1f]">Reviewed</option>
                      <option value="resolved" className="bg-[#0d0d1f]">Resolved</option>
                    </select>
                  </div>
                  {/* Sentiment */}
                  <div className="relative">
                    <CheckCircle2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/25 pointer-events-none" />
                    <select value={filterSent} onChange={(e) => setFilterSent(e.target.value)}
                      className="h-8 pl-7 pr-3 text-xs rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none">
                      <option value="" className="bg-[#0d0d1f]">All Sentiments</option>
                      <option value="positive" className="bg-[#0d0d1f]">Positive</option>
                      <option value="neutral"  className="bg-[#0d0d1f]">Neutral</option>
                      <option value="negative" className="bg-[#0d0d1f]">Negative</option>
                    </select>
                  </div>
                  {activeFilters > 0 && (
                    <button onClick={() => { setFilterDept(""); setFilterCat(""); setFilterStat(""); setFilterSent(""); }}
                      className="flex items-center gap-1 h-8 px-3 text-xs rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/15">
                      <X className="w-3 h-3" /> Clear All
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  {["Employee", "Department", "Category", "Rating", "Sentiment", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-white/25 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fetching ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.03] animate-pulse">
                      {[...Array(8)].map((__, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-white/[0.05] rounded w-16" /></td>)}
                    </tr>
                  ))
                ) : items.map((fb, i) => (
                  <motion.tr key={fb._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {fb.isAnonymous ? "?" : fb.employeeName.charAt(0)}
                        </div>
                        <span className="font-medium text-white/80 whitespace-nowrap">{fb.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/50 whitespace-nowrap">{fb.department}</td>
                    <td className="px-4 py-3"><span className="text-white/60 bg-white/[0.05] px-2 py-0.5 rounded-lg whitespace-nowrap">{fb.category}</span></td>
                    <td className="px-4 py-3"><StarRow rating={fb.rating} /></td>
                    <td className="px-4 py-3">
                      {fb.aiAnalysis?.sentiment
                        ? <span className={cn("px-2 py-0.5 rounded-full border text-[10px] font-semibold whitespace-nowrap", SENT_CFG[fb.aiAnalysis.sentiment].cls)}>{SENT_CFG[fb.aiAnalysis.sentiment].label}</span>
                        : <span className="text-white/20 text-[10px]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <select value={fb.status} onChange={(e) => void updateStatus(fb._id, e.target.value)}
                        className={cn("text-[10px] border rounded-lg px-2 py-1 focus:outline-none cursor-pointer", STAT_CFG[fb.status].cls, "bg-transparent")}>
                        <option value="pending"  className="bg-[#0d0d1f] text-white">Pending</option>
                        <option value="reviewed" className="bg-[#0d0d1f] text-white">Reviewed</option>
                        <option value="resolved" className="bg-[#0d0d1f] text-white">Resolved</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-white/30 whitespace-nowrap">{formatDate(fb.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setDetailItem(fb)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.07] text-white/40 hover:text-white transition-all" title="View details">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => void handleDelete(fb._id)} disabled={deleting === fb._id}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400/40 hover:text-red-400 transition-all disabled:opacity-40" title="Delete">
                          {deleting === fb._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {!fetching && items.length === 0 && (
              <div className="py-12 text-center">
                <MessageSquare className="w-8 h-8 text-white/15 mx-auto mb-3" />
                <p className="text-sm text-white/30">{search || activeFilters > 0 ? "No results match your filters" : "No feedback yet. Seed the database to get started."}</p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30">Page {page} of {totalPages} · {total} items</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || fetching} className="h-8 px-2">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pg = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={cn("h-8 w-8 rounded-lg text-xs font-medium transition-all",
                      pg === page ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" : "text-white/40 hover:text-white hover:bg-white/[0.07]")}>
                    {pg}
                  </button>
                );
              })}
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || fetching} className="h-8 px-2">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
