"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Keyword } from "../types";

interface Props { keywords: Keyword[]; loading: boolean; }

const SIZE_MAP = [
  "text-xl font-bold", "text-lg font-bold", "text-base font-semibold",
  "text-sm font-semibold", "text-sm font-medium", "text-xs font-medium",
];
const OPACITY_MAP = [
  "text-violet-300", "text-violet-400", "text-violet-400/80",
  "text-violet-400/65", "text-violet-400/55", "text-violet-400/45",
];

export default function KeywordsPanel({ keywords, loading }: Props) {
  const max = keywords[0]?.count ?? 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-5"
    >
      <h3 className="text-sm font-semibold text-white mb-1">Keyword Analysis</h3>
      <p className="text-xs text-white/35 mb-4">Most frequent words in employee feedback</p>

      {loading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={cn("h-7 rounded-full bg-white/[0.06] animate-pulse", i % 3 === 0 ? "w-24" : i % 2 === 0 ? "w-16" : "w-20")} />
          ))}
        </div>
      ) : keywords.length === 0 ? (
        <p className="text-xs text-white/30 text-center py-6">No keywords yet — submit feedback to see trends</p>
      ) : (
        <>
          {/* Word cloud */}
          <div className="flex flex-wrap gap-2 mb-5">
            {keywords.map((kw, i) => {
              const tier = Math.min(Math.floor((1 - kw.count / max) * SIZE_MAP.length), SIZE_MAP.length - 1);
              return (
                <motion.span
                  key={kw.word}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "px-2.5 py-1 rounded-xl border border-violet-500/20 bg-violet-500/10 cursor-default transition-all hover:bg-violet-500/20",
                    SIZE_MAP[tier], OPACITY_MAP[tier]
                  )}
                  title={`${kw.count} occurrences`}
                >
                  {kw.word}
                </motion.span>
              );
            })}
          </div>

          {/* Keyword count bars */}
          <div className="space-y-2 border-t border-white/[0.05] pt-4">
            <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2">Word Frequency</p>
            {keywords.slice(0, 8).map((kw, i) => (
              <div key={kw.word} className="flex items-center gap-3">
                <span className="text-[11px] text-white/50 w-28 truncate flex-shrink-0">{kw.word}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(kw.count / max) * 100}%` }}
                    transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                  />
                </div>
                <span className="text-[11px] text-white/40 w-6 text-right flex-shrink-0">{kw.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
