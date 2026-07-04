"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

interface TopbarProps {
  role: "admin" | "employee";
  onMenuClick: () => void;
}

const DEMO_NOTIFICATIONS = [
  {
    id: "1",
    type: "success" as const,
    title: "Feedback submitted",
    desc: "Your feedback was received and is being analyzed.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "info" as const,
    title: "AI analysis complete",
    desc: "Sentiment analysis finished for Q3 feedback batch.",
    time: "1 hr ago",
    read: false,
  },
  {
    id: "3",
    type: "warning" as const,
    title: "Pending reviews",
    desc: "3 feedback items require your attention.",
    time: "3 hr ago",
    read: true,
  },
];

export default function Topbar({ role, onMenuClick }: TopbarProps) {
  const { user } = useAuth();
  const [dark, setDark] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState("");

  const unread = notifications.filter((n) => !n.read).length;

  const accentColor =
    role === "admin"
      ? "from-blue-500 to-indigo-600"
      : "from-violet-500 to-purple-600";

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/[0.06] bg-[#0a0a1a]/80 backdrop-blur-xl px-4 md:px-6">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-sm">
        <AnimatePresence mode="wait">
          {searchOpen ? (
            <motion.div
              key="open"
              initial={{ opacity: 0, width: 120 }}
              animate={{ opacity: 1, width: "100%" }}
              exit={{ opacity: 0, width: 120 }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 h-9"
            >
              <Search className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="text-white/30 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 h-9 text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all text-sm w-full max-w-[200px]"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Search...</span>
              <kbd className="ml-auto hidden sm:block text-[10px] border border-white/10 rounded px-1 py-0.5 text-white/20">
                ⌘K
              </kbd>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="ml-auto flex items-center gap-1">
        {/* Dark mode toggle */}
        <button
          onClick={() => setDark((d) => !d)}
          className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
          title={dark ? "Light mode" : "Dark mode"}
        >
          {dark ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-[#0a0a1a]" />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotifOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 z-50 rounded-2xl border border-white/10 bg-[#0f0f1f]/95 backdrop-blur-xl shadow-2xl"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        Notifications
                      </h3>
                      {unread > 0 && (
                        <span className="text-[10px] font-bold bg-violet-500/20 text-violet-400 border border-violet-500/30 px-1.5 py-0.5 rounded-full">
                          {unread}
                        </span>
                      )}
                    </div>
                    {unread > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="py-2 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "flex gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer",
                          !n.read && "bg-white/[0.02]"
                        )}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {n.type === "success" && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                          {n.type === "warning" && (
                            <AlertCircle className="w-4 h-4 text-yellow-400" />
                          )}
                          {n.type === "info" && (
                            <Info className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-medium text-white truncate">
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">
                            {n.desc}
                          </p>
                          <p className="text-[10px] text-white/25 mt-1">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2 pl-2 ml-1 border-l border-white/[0.06]">
          <div
            className={`w-7 h-7 rounded-lg bg-gradient-to-br ${accentColor} flex items-center justify-center text-white text-xs font-bold`}
          >
            {user?.name?.charAt(0) ?? "U"}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium text-white leading-none">
              {user?.name}
            </p>
            <p className="text-[10px] text-white/35 mt-0.5">
              {user?.department}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
