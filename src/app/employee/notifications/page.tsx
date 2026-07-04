"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Loader2, LayoutDashboard, ClipboardList, History, Sparkles, Bell, UserCircle, Settings, CheckCircle2, Info, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { NavItem } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",           href: "/employee/dashboard",        icon: LayoutDashboard },
  { label: "Submit Feedback",     href: "/employee/feedback/submit",  icon: ClipboardList },
  { label: "My Feedback",         href: "/employee/feedback/history", icon: History },
  { label: "AI Feedback History", href: "/employee/ai-history",       icon: Sparkles, placeholder: true },
  { label: "Notifications",       href: "/employee/notifications",    icon: Bell },
  { label: "Profile",             href: "/employee/profile",          icon: UserCircle },
  { label: "Settings",            href: "/employee/settings",         icon: Settings },
];

const DEMO = [
  { id: "1", type: "success" as const, title: "Feedback reviewed", desc: "HR has reviewed your Work Environment feedback.", time: "2 hours ago", read: false },
  { id: "2", type: "info"    as const, title: "Analysis complete", desc: "AI sentiment analysis finished for your latest feedback.", time: "1 day ago", read: false },
  { id: "3", type: "warning" as const, title: "Action required",  desc: "Please complete your monthly feedback form by Friday.", time: "3 days ago", read: true },
];

export default function NotificationsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [notifs, setNotifs] = useState(DEMO);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login/employee");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-violet-500 animate-spin" /></div>;
  }

  const markAll = () => setNotifs((n) => n.map((x) => ({ ...x, read: true })));
  const unread = notifs.filter((n) => !n.read).length;

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="employee">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">Notifications</h1>
            {unread > 0 && (
              <span className="text-xs font-bold bg-violet-500/20 text-violet-400 border border-violet-500/30 px-2 py-0.5 rounded-full">{unread} new</span>
            )}
          </div>
          {unread > 0 && (
            <button onClick={markAll} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Mark all read</button>
          )}
        </div>

        <div className="space-y-3">
          {notifs.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
              className={cn("rounded-2xl border bg-[#0d0d1f] p-5 cursor-pointer transition-all hover:border-violet-500/20",
                n.read ? "border-white/[0.07]" : "border-violet-500/20 bg-violet-500/[0.03]")}>
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  {n.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {n.type === "info"    && <Info          className="w-5 h-5 text-blue-400" />}
                  {n.type === "warning" && <AlertCircle   className="w-5 h-5 text-yellow-400" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">{n.desc}</p>
                  <p className="text-[10px] text-white/25 mt-2">{n.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
