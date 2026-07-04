"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeptStat } from "../types";

interface Props { data: DeptStat[]; loading: boolean; }

function SkeletonRow() {
  return (
    <tr className="border-b border-white/[0.03] animate-pulse">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 bg-white/[0.05] rounded" style={{ width: `${50 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function DepartmentTable({ data, loading }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white">Department Analytics</h3>
        <p className="text-xs text-white/35 mt-0.5">Satisfaction scores, trends and priority count per department</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {["Department","Avg Rating","Feedback","Positive %","Negative %","Sentiment Score","Priority","Trend"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-white/25 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : data.length === 0
              ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-xs text-white/30">
                    No department data yet
                  </td>
                </tr>
              )
              : data.map((dept, i) => (
                <motion.tr
                  key={dept.department}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {dept.department.charAt(0)}
                      </div>
                      <span className="font-medium text-white/80 whitespace-nowrap">{dept.department}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-yellow-400">{dept.avgRating}★</span>
                  </td>
                  <td className="px-4 py-3 text-white/60">{dept.count}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden w-16">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${dept.positivePercent}%` }} />
                      </div>
                      <span className="text-emerald-400 font-medium">{dept.positivePercent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden w-16">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${dept.negativePercent}%` }} />
                      </div>
                      <span className="text-red-400 font-medium">{dept.negativePercent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "font-semibold",
                      dept.sentimentScore > 0.2 ? "text-emerald-400" :
                      dept.sentimentScore < -0.2 ? "text-red-400" : "text-yellow-400"
                    )}>
                      {dept.sentimentScore > 0 ? "+" : ""}{dept.sentimentScore.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {dept.highPriority > 0 ? (
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                        {dept.highPriority} high
                      </span>
                    ) : (
                      <span className="text-white/25 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {dept.trend === "up"
                      ? <TrendingUp  className="w-4 h-4 text-emerald-400" />
                      : dept.trend === "down"
                      ? <TrendingDown className="w-4 h-4 text-red-400" />
                      : <Minus       className="w-4 h-4 text-yellow-400" />}
                  </td>
                </motion.tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
