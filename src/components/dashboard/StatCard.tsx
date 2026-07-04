"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number; // percentage change, positive = up
  trendLabel?: string;
  color: "violet" | "blue" | "emerald" | "yellow" | "red" | "indigo" | "pink";
  index?: number;
  subtitle?: string;
}

const COLORS = {
  violet: {
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
    bg: "from-violet-500/10 via-violet-500/5 to-transparent",
    border: "border-violet-500/20",
    text: "text-violet-400",
    ring: "ring-violet-500/30",
  },
  blue: {
    gradient: "from-blue-500 to-indigo-600",
    glow: "shadow-blue-500/20",
    bg: "from-blue-500/10 via-blue-500/5 to-transparent",
    border: "border-blue-500/20",
    text: "text-blue-400",
    ring: "ring-blue-500/30",
  },
  emerald: {
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
    bg: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    ring: "ring-emerald-500/30",
  },
  yellow: {
    gradient: "from-yellow-500 to-amber-600",
    glow: "shadow-yellow-500/20",
    bg: "from-yellow-500/10 via-yellow-500/5 to-transparent",
    border: "border-yellow-500/20",
    text: "text-yellow-400",
    ring: "ring-yellow-500/30",
  },
  red: {
    gradient: "from-red-500 to-rose-600",
    glow: "shadow-red-500/20",
    bg: "from-red-500/10 via-red-500/5 to-transparent",
    border: "border-red-500/20",
    text: "text-red-400",
    ring: "ring-red-500/30",
  },
  indigo: {
    gradient: "from-indigo-500 to-blue-600",
    glow: "shadow-indigo-500/20",
    bg: "from-indigo-500/10 via-indigo-500/5 to-transparent",
    border: "border-indigo-500/20",
    text: "text-indigo-400",
    ring: "ring-indigo-500/30",
  },
  pink: {
    gradient: "from-pink-500 to-rose-500",
    glow: "shadow-pink-500/20",
    bg: "from-pink-500/10 via-pink-500/5 to-transparent",
    border: "border-pink-500/20",
    text: "text-pink-400",
    ring: "ring-pink-500/30",
  },
} as const;

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color,
  index = 0,
  subtitle,
}: StatCardProps) {
  const c = COLORS[color];

  const TrendIcon =
    trend === undefined || trend === 0
      ? Minus
      : trend > 0
      ? TrendingUp
      : TrendingDown;
  const trendColor =
    trend === undefined || trend === 0
      ? "text-white/30"
      : trend > 0
      ? "text-emerald-400"
      : "text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-[#0d0d1f] p-5 group cursor-default",
        c.border
      )}
    >
      {/* Background glow */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          c.bg
        )}
      />

      {/* Decorative circle */}
      <div
        className={cn(
          "absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 transition-opacity duration-500 group-hover:opacity-40 bg-gradient-to-br",
          c.gradient
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">
            {title}
          </p>
          <p className="text-2xl font-bold text-white leading-none mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-white/35 mt-1 truncate">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={cn("flex items-center gap-1 mt-2", trendColor)}>
              <TrendIcon className="w-3 h-3" />
              <span className="text-xs font-medium">
                {trend > 0 ? "+" : ""}
                {trend}%{" "}
                <span className="text-white/30 font-normal">
                  {trendLabel ?? "vs last month"}
                </span>
              </span>
            </div>
          )}
        </div>

        <div
          className={cn(
            `w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110`,
            c.glow
          )}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
