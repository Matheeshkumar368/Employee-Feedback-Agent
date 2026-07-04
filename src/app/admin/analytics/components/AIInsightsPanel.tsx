"use client";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Info, CheckCircle2 } from "lucide-react";

interface Props { insights: string[]; loading: boolean; }

const ICONS = [TrendingUp, TrendingDown, AlertCircle, Info, CheckCircle2];
const COLORS = [
  "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "text-red-400 bg-red-500/10 border-red-500/20",
  "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "text-violet-400 bg-violet-500/10 border-violet-500/20",
];

export default function AIInsightsPanel({ insights, loading }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-[#0d0d1f] to-purple-500/5 overflow-hidden"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">AI Insights</h3>
          <p className="text-[10px] text-violet-400/60">Powered by Google Gemini</p>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex-shrink-0" />
                <div className="flex-1 pt-1 space-y-1.5">
                  <div className="h-3 bg-white/[0.06] rounded w-full" />
                  <div className="h-2.5 bg-white/[0.04] rounded w-3/4" />
                </div>
              </div>
            ))
          : insights.map((insight, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${COLORS[i % COLORS.length]}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-sm text-white/65 leading-relaxed pt-0.5">{insight}</p>
                </motion.div>
              );
            })}
      </div>
    </motion.div>
  );
}
