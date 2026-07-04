"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEPARTMENTS, CATEGORIES } from "@/lib/utils";
import { useState } from "react";

export interface Filters {
  department: string;
  category: string;
  sentiment: string;
  priority: string;
  dateFrom: string;
  dateTo: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  onApply: () => void;
}

const SELECT_CLS = "h-8 px-2.5 text-xs rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all";
const INPUT_CLS  = "h-8 px-2.5 text-xs rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all";

export default function FiltersBar({ filters, onChange, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const active = Object.values(filters).filter(Boolean).length;

  const set = (key: keyof Filters, val: string) =>
    onChange({ ...filters, [key]: val });

  const clear = () =>
    onChange({ department: "", category: "", sentiment: "", priority: "", dateFrom: "", dateTo: "" });

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "relative flex items-center gap-1.5 rounded-xl border px-3 h-9 text-xs transition-all",
          open || active > 0
            ? "border-violet-500/40 bg-violet-500/10 text-violet-400"
            : "border-white/10 bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.07]"
        )}
      >
        <Filter className="w-3.5 h-3.5" />
        Filters
        {active > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center">
            {active}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-2"
          >
            <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <select value={filters.department} onChange={(e) => set("department", e.target.value)} className={SELECT_CLS}>
                <option value="" className="bg-[#0d0d1f]">All Departments</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d} className="bg-[#0d0d1f]">{d}</option>)}
              </select>

              <select value={filters.category} onChange={(e) => set("category", e.target.value)} className={SELECT_CLS}>
                <option value="" className="bg-[#0d0d1f]">All Categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0d0d1f]">{c}</option>)}
              </select>

              <select value={filters.sentiment} onChange={(e) => set("sentiment", e.target.value)} className={SELECT_CLS}>
                <option value="" className="bg-[#0d0d1f]">All Sentiments</option>
                <option value="positive" className="bg-[#0d0d1f]">Positive</option>
                <option value="neutral"  className="bg-[#0d0d1f]">Neutral</option>
                <option value="negative" className="bg-[#0d0d1f]">Negative</option>
              </select>

              <select value={filters.priority} onChange={(e) => set("priority", e.target.value)} className={SELECT_CLS}>
                <option value="" className="bg-[#0d0d1f]">All Priorities</option>
                <option value="high"   className="bg-[#0d0d1f]">High</option>
                <option value="medium" className="bg-[#0d0d1f]">Medium</option>
                <option value="low"    className="bg-[#0d0d1f]">Low</option>
              </select>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-white/30" />
                <input type="date" value={filters.dateFrom} onChange={(e) => set("dateFrom", e.target.value)}
                  className={cn(INPUT_CLS, "w-32")} style={{ colorScheme: "dark" }} />
                <span className="text-white/25 text-xs">—</span>
                <input type="date" value={filters.dateTo} onChange={(e) => set("dateTo", e.target.value)}
                  className={cn(INPUT_CLS, "w-32")} style={{ colorScheme: "dark" }} />
              </div>

              <button onClick={() => { onApply(); setOpen(false); }}
                className="h-8 px-3 text-xs rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium hover:from-violet-500 hover:to-purple-500 transition-all">
                Apply
              </button>

              {active > 0 && (
                <button onClick={() => { clear(); onApply(); }}
                  className="flex items-center gap-1 h-8 px-3 text-xs rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/15 transition-colors">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
