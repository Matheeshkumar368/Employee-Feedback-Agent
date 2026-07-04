"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Users, MessageSquare, TrendingUp, TrendingDown, Minus,
  Star, Clock, CheckCircle2, AlertCircle, Calendar, BarChart3,
  type LucideIcon,
} from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import type { AnalyticsOverview } from "../types";

interface CardDef {
  key: keyof AnalyticsOverview;
  title: string;
  icon: LucideIcon;
  color: string;
  border: string;
  bg: string;
  glow: string;
  decimals?: number;
  suffix?: string;
}

const CARDS: CardDef[] = [
  { key: "totalEmployees",  title: "Total Employees",     icon: Users,         color: "from-blue-500 to-indigo-600",  border: "border-blue-500/20",   bg: "from-blue-500/10",    glow: "shadow-blue-500/20" },
  { key: "totalFeedback",   title: "Total Feedback",      icon: MessageSquare, color: "from-violet-500 to-purple-600",border: "border-violet-500/20", bg: "from-violet-500/10",  glow: "shadow-violet-500/20" },
  { key: "positive",        title: "Positive Feedback",   icon: TrendingUp,    color: "from-emerald-500 to-teal-600", border: "border-emerald-500/20",bg: "from-emerald-500/10", glow: "shadow-emerald-500/20" },
  { key: "neutral",         title: "Neutral Feedback",    icon: Minus,         color: "from-yellow-500 to-amber-600", border: "border-yellow-500/20", bg: "from-yellow-500/10",  glow: "shadow-yellow-500/20" },
  { key: "negative",        title: "Negative Feedback",   icon: TrendingDown,  color: "from-red-500 to-rose-600",     border: "border-red-500/20",    bg: "from-red-500/10",     glow: "shadow-red-500/20" },
  { key: "pendingReviews",  title: "Pending Reviews",     icon: Clock,         color: "from-orange-500 to-amber-600", border: "border-orange-500/20", bg: "from-orange-500/10",  glow: "shadow-orange-500/20" },
  { key: "resolved",        title: "Resolved",            icon: CheckCircle2,  color: "from-teal-500 to-cyan-600",    border: "border-teal-500/20",   bg: "from-teal-500/10",    glow: "shadow-teal-500/20" },
  { key: "avgRating",       title: "Average Rating",      icon: Star,          color: "from-yellow-400 to-orange-500",border: "border-yellow-500/20", bg: "from-yellow-500/10",  glow: "shadow-yellow-500/20", decimals: 1, suffix: "★" },
  { key: "satisfactionPct", title: "Satisfaction Score",  icon: BarChart3,     color: "from-indigo-500 to-violet-600",border: "border-indigo-500/20", bg: "from-indigo-500/10",  glow: "shadow-indigo-500/20", suffix: "%" },
  { key: "currentMonth",    title: "This Month",          icon: Calendar,      color: "from-pink-500 to-rose-500",    border: "border-pink-500/20",   bg: "from-pink-500/10",    glow: "shadow-pink-500/20" },
];

interface Props {
  overview: AnalyticsOverview;
  loading: boolean;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d1f] p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="h-2.5 w-20 bg-white/[0.06] rounded mb-2.5" />
          <div className="h-7 w-14 bg-white/[0.08] rounded mb-1.5" />
          <div className="h-2 w-24 bg-white/[0.05] rounded" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
      </div>
    </div>
  );
}

export default function StatCards({ overview, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
      {CARDS.map((card, i) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className={cn(
            "relative overflow-hidden rounded-2xl border bg-[#0d0d1f] p-5 group cursor-default",
            card.border
          )}
        >
          {/* Glow */}
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 to-transparent", card.bg)} />
          <div className={cn("absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity bg-gradient-to-br", card.color)} />

          <div className="relative flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-2 truncate">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-white leading-none">
                <AnimatedCounter
                  value={overview[card.key] as number}
                  decimals={card.decimals ?? 0}
                  suffix={card.suffix}
                  duration={900 + i * 50}
                />
              </p>
            </div>
            <div className={cn(
              `w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg flex-shrink-0 ml-2 transition-transform duration-300 group-hover:scale-110`,
              card.glow
            )}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
