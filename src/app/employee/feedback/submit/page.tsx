"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, LayoutDashboard, ClipboardList, History, Sparkles,
  Bell, UserCircle, Settings, Send, Star, CheckCircle2,
  AlertCircle, User, Building2, Tag, MessageSquare, Eye, EyeOff,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { NavItem } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",           href: "/employee/dashboard",        icon: LayoutDashboard },
  { label: "Submit Feedback",     href: "/employee/feedback/submit",  icon: ClipboardList },
  { label: "My Feedback",         href: "/employee/feedback/history", icon: History },
  { label: "AI Feedback History", href: "/employee/ai-history",       icon: Sparkles, placeholder: true },
  { label: "Notifications",       href: "/employee/notifications",    icon: Bell, badge: "2" },
  { label: "Profile",             href: "/employee/profile",          icon: UserCircle },
  { label: "Settings",            href: "/employee/settings",         icon: Settings },
];

const CATEGORIES = [
  "Work Environment",
  "Management",
  "Salary",
  "Workload",
  "Career Growth",
  "Others",
];

const DEPARTMENTS = [
  "Engineering", "Human Resources", "Marketing", "Sales",
  "Finance", "Operations", "Design", "Product", "Legal", "Customer Support",
];

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
const RATING_COLORS = ["", "text-red-400", "text-orange-400", "text-yellow-400", "text-blue-400", "text-emerald-400"];
const MSG_MIN = 20;
const MSG_MAX = 1000;

function FieldError({ msg }: { msg: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="flex items-center gap-1 text-[11px] text-red-400 mt-1"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export default function SubmitFeedbackPage() {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();

  const [rating, setRating]         = useState(0);
  const [hovered, setHovered]       = useState(0);
  const [category, setCategory]     = useState("");
  const [department, setDepartment] = useState("");
  const [message, setMessage]       = useState("");
  const [anonymous, setAnonymous]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [aiResult, setAiResult]     = useState<null | {
    sentiment: string; summary: string; keywords: string[];
    priority: string; hrRecommendation: string;
  }>(null);
  const [pollCount, setPollCount]   = useState(0);

  // validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoading && !user) router.push("/login/employee");
    if (user) setDepartment(user.department);
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (rating === 0)                          e.rating     = "Please select a rating";
    if (!category)                             e.category   = "Please select a category";
    if (!department)                           e.department = "Please select a department";
    if (message.trim().length < MSG_MIN)       e.message    = `Message must be at least ${MSG_MIN} characters`;
    if (message.trim().length > MSG_MAX)       e.message    = `Message must be under ${MSG_MAX} characters`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({
          employeeName: user.name,
          employeeId: user.employeeId,
          department,
          category,
          rating,
          message: message.trim(),
          isAnonymous: anonymous,
        }),
      });
      const data = await res.json() as { error?: string; feedback?: { id: string } };
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setSubmitted(true);
      toast({ title: "Feedback submitted!", description: "AI analysis running in the background." });

      // Poll for AI result (max 5 attempts, 3s apart)
      if (data.feedback?.id) {
        const fbId = data.feedback.id;
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          try {
            const r = await fetch(`/api/feedback/${fbId}`, {
              headers: { Authorization: `Bearer ${token ?? ""}` },
            });
            const d = await r.json() as { feedback?: { aiAnalysis?: { sentiment: string; summary: string; keywords: string[]; priority: string; hrRecommendation: string } } };
            if (d.feedback?.aiAnalysis?.summary) {
              setAiResult(d.feedback.aiAnalysis);
              clearInterval(poll);
            }
          } catch { /* silent */ }
          setPollCount(attempts);
          if (attempts >= 5) clearInterval(poll);
        }, 3000);
      }
    } catch (err) {
      toast({
        title: "Submission failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    const SENT_COLOR: Record<string, string> = {
      positive: "text-emerald-400",
      neutral: "text-yellow-400",
      negative: "text-red-400",
    };
    const PRI_COLOR: Record<string, string> = {
      high: "bg-red-500/10 text-red-400 border-red-500/20",
      medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };
    return (
      <DashboardLayout navItems={NAV_ITEMS} role="employee">
        <div className="max-w-lg mx-auto pt-8 space-y-4">
          {/* Success banner */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-[#0d0d1f] to-teal-500/5 p-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </motion.div>
            <h2 className="text-xl font-bold text-white mb-2">Feedback Submitted!</h2>
            <p className="text-white/50 text-sm">
              Your feedback has been recorded and will be reviewed by HR.
              {anonymous && " Submitted anonymously."}
            </p>
          </motion.div>

          {/* AI Analysis result */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl border border-violet-500/20 bg-[#0d0d1f] overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] bg-violet-500/5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AI Analysis</p>
                <p className="text-[10px] text-white/35">Powered by Google Gemini</p>
              </div>
              {!aiResult && pollCount < 5 && (
                <div className="ml-auto flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                  <span className="text-[10px] text-white/35">Analyzing…</span>
                </div>
              )}
            </div>
            <div className="p-5">
              {aiResult ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span className={cn("text-sm font-bold capitalize", SENT_COLOR[aiResult.sentiment] ?? "text-white")}>
                      {aiResult.sentiment} sentiment
                    </span>
                    {aiResult.priority && (
                      <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full border", PRI_COLOR[aiResult.priority] ?? "text-white/50 border-white/10")}>
                        {aiResult.priority} priority
                      </span>
                    )}
                  </div>
                  {aiResult.summary && (
                    <p className="text-sm text-white/60 leading-relaxed">{aiResult.summary}</p>
                  )}
                  {aiResult.hrRecommendation && (
                    <div className="rounded-xl bg-violet-500/5 border border-violet-500/15 p-3">
                      <p className="text-[10px] text-violet-400 uppercase tracking-wider font-semibold mb-1">Suggestion for you</p>
                      <p className="text-xs text-white/55 leading-relaxed">{aiResult.hrRecommendation}</p>
                    </div>
                  )}
                  {aiResult.keywords && aiResult.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {aiResult.keywords.map((k: string) => (
                        <span key={k} className="text-[10px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">{k}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : pollCount >= 5 ? (
                <p className="text-xs text-white/35 text-center py-2">AI analysis will complete in the background. Check your feedback history later.</p>
              ) : (
                <div className="space-y-2.5">
                  {[70, 90, 55].map((w, i) => (
                    <div key={i} className={`h-2.5 rounded-full bg-white/[0.05] animate-pulse`} style={{ width: `${w}%` }} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => {
              setSubmitted(false); setRating(0); setCategory(""); setMessage("");
              setAnonymous(false); setAiResult(null); setPollCount(0);
            }}>Submit Another</Button>
            <Button className="flex-1" onClick={() => router.push("/employee/feedback/history")}>
              View History
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const msgChars = message.length;
  const msgOver  = msgChars > MSG_MAX;
  const msgPct   = Math.min((msgChars / MSG_MAX) * 100, 100);

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="employee">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-violet-500/20 bg-[#0d0d1f] overflow-hidden"
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-500/15 via-[#0d0d20] to-purple-500/5 px-6 py-6 border-b border-white/[0.06]">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Submit Feedback</h1>
                <p className="text-xs text-white/40 mt-0.5">Your voice helps shape a better workplace</p>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-6">

            {/* ── Employee info (read-only) ── */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-white/50">Employee Name</Label>
                <div className="flex items-center gap-2 h-10 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3">
                  <User className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
                  <span className="text-sm text-white/50 truncate">
                    {anonymous ? "Anonymous" : user.name}
                  </span>
                </div>
              </div>
              <div>
                <Label className="mb-2 block text-white/50">Employee ID</Label>
                <div className="flex items-center gap-2 h-10 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3">
                  <Building2 className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
                  <span className="text-sm text-white/50 font-mono truncate">
                    {anonymous ? "ANON" : user.employeeId}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Star rating ── */}
            <div>
              <Label className="mb-3 block">
                Rating <span className="text-red-400">*</span>
              </Label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <motion.button
                    key={s}
                    type="button"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setRating(s); setErrors((p) => ({ ...p, rating: "" })); }}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                  >
                    <Star
                      className={cn(
                        "w-8 h-8 transition-all duration-150",
                        s <= (hovered || rating)
                          ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]"
                          : "text-white/15"
                      )}
                    />
                  </motion.button>
                ))}
                {(hovered || rating) > 0 && (
                  <motion.span
                    key={hovered || rating}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn("text-sm font-semibold ml-1", RATING_COLORS[hovered || rating])}
                  >
                    {RATING_LABELS[hovered || rating]}
                  </motion.span>
                )}
              </div>
              <FieldError msg={errors.rating ?? ""} />
            </div>

            {/* ── Category + Department ── */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="mb-2 block">
                  Category <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setErrors((p) => ({ ...p, category: "" })); }}
                    className={cn(
                      "flex h-10 w-full rounded-xl border bg-white/5 pl-9 pr-3 py-2 text-sm text-white backdrop-blur-sm focus:outline-none focus:ring-2 transition-all",
                      errors.category
                        ? "border-red-500/50 focus:ring-red-500/20"
                        : "border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20"
                    )}
                  >
                    <option value="" className="bg-[#0d0d1f]">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0d0d1f]">{c}</option>)}
                  </select>
                </div>
                <FieldError msg={errors.category ?? ""} />
              </div>

              <div>
                <Label htmlFor="department" className="mb-2 block">
                  Department <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => { setDepartment(e.target.value); setErrors((p) => ({ ...p, department: "" })); }}
                    className={cn(
                      "flex h-10 w-full rounded-xl border bg-white/5 pl-9 pr-3 py-2 text-sm text-white backdrop-blur-sm focus:outline-none focus:ring-2 transition-all",
                      errors.department
                        ? "border-red-500/50 focus:ring-red-500/20"
                        : "border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20"
                    )}
                  >
                    {DEPARTMENTS.map((d) => <option key={d} value={d} className="bg-[#0d0d1f]">{d}</option>)}
                  </select>
                </div>
                <FieldError msg={errors.department ?? ""} />
              </div>
            </div>

            {/* ── Message ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="message">
                  Feedback Message <span className="text-red-400">*</span>
                </Label>
                <span className={cn("text-[11px] tabular-nums transition-colors", msgOver ? "text-red-400" : msgChars >= MSG_MIN ? "text-emerald-400" : "text-white/30")}>
                  {msgChars}/{MSG_MAX}
                </span>
              </div>
              <textarea
                id="message"
                rows={5}
                placeholder={`Share your thoughts in detail... (min ${MSG_MIN} characters)`}
                value={message}
                onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: "" })); }}
                className={cn(
                  "flex w-full rounded-xl border bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 backdrop-blur-sm focus:outline-none focus:ring-2 resize-none transition-all",
                  errors.message
                    ? "border-red-500/50 focus:ring-red-500/20"
                    : "border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20"
                )}
              />
              {/* Character progress bar */}
              <div className="mt-1.5 h-0.5 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  animate={{ width: `${msgPct}%` }}
                  transition={{ duration: 0.2 }}
                  className={cn("h-full rounded-full transition-colors", msgOver ? "bg-red-500" : msgChars >= MSG_MIN ? "bg-emerald-500" : "bg-violet-500")}
                />
              </div>
              <FieldError msg={errors.message ?? ""} />
            </div>

            {/* ── Anonymous toggle ── */}
            <div
              onClick={() => setAnonymous((a) => !a)}
              className={cn(
                "flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all",
                anonymous
                  ? "border-violet-500/30 bg-violet-500/[0.07]"
                  : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                anonymous ? "bg-violet-500/20" : "bg-white/[0.05]"
              )}>
                {anonymous ? <EyeOff className="w-4 h-4 text-violet-400" /> : <Eye className="w-4 h-4 text-white/40" />}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-white">Submit Anonymously</p>
                <p className="text-xs text-white/40 mt-0.5">
                  Your name and ID will be hidden. HR will see department only.
                </p>
              </div>
              <div className={cn(
                "w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center flex-shrink-0 transition-all",
                anonymous ? "bg-violet-500 border-violet-500" : "border-white/20 bg-transparent"
              )}>
                {anonymous && <CheckCircle2 className="w-3 h-3 text-white fill-white" />}
              </div>
            </div>

            {/* ── Submit ── */}
            <Button type="submit" className="w-full" size="lg" disabled={submitting || msgOver}>
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="w-4 h-4" /> Submit Feedback</>
              )}
            </Button>

            <p className="text-center text-[11px] text-white/25">
              All feedback is confidential and reviewed by the HR team only
            </p>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
