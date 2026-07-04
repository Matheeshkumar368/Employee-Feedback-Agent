"use client";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import type {
  MonthlyData, CategoryStat, RatingDist,
  SatisfactionTrend, DeptStat,
} from "../types";
import ChartSkeleton from "./ChartSkeleton";

// ─── Shared theme ──────────────────────────────────────────────────────────────
const GRID_COLOR  = "rgba(255,255,255,0.04)";
const AXIS_COLOR  = "rgba(255,255,255,0.25)";
const TICK_STYLE  = { fill: "rgba(255,255,255,0.4)", fontSize: 11 };

const SENTIMENT_COLORS = {
  positive: "#10b981",
  neutral:  "#f59e0b",
  negative: "#ef4444",
};

const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#f97316"];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color?: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f1e]/95 backdrop-blur-xl px-3 py-2.5 shadow-xl text-xs">
      {label && <p className="text-white/50 mb-1.5 font-medium">{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color ?? "#8b5cf6" }} />
          <span className="text-white/60 capitalize">{p.name}</span>
          <span className="text-white font-semibold ml-auto pl-4">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, subtitle, children, loading }: {
  title: string; subtitle?: string; children: React.ReactNode; loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl border border-white/[0.07] bg-[#0d0d1f] p-5 overflow-hidden"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-white/35 mt-0.5">{subtitle}</p>}
      </div>
      {loading ? <ChartSkeleton /> : children}
    </motion.div>
  );
}

// 1. Monthly Feedback Trend — Line Chart
export function MonthlyTrendChart({ data, loading }: { data: MonthlyData[]; loading: boolean }) {
  return (
    <ChartCard title="Monthly Feedback Trend" subtitle="Total submissions per month with sentiment split" loading={loading}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis dataKey="shortMonth" tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: AXIS_COLOR }} />
          <Line type="monotone" dataKey="total"    name="Total"    stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: "#8b5cf6" }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="positive" name="Positive" stroke={SENTIMENT_COLORS.positive} strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="negative" name="Negative" stroke={SENTIMENT_COLORS.negative} strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 2. Department-wise Feedback — Bar Chart
export function DepartmentBarChart({ data, loading }: { data: DeptStat[]; loading: boolean }) {
  const chartData = data.slice(0, 8).map((d) => ({
    name: d.department.length > 10 ? d.department.slice(0, 10) + "…" : d.department,
    fullName: d.department,
    Positive: d.positive,
    Neutral:  d.neutral,
    Negative: d.negative,
  }));

  return (
    <ChartCard title="Department Feedback" subtitle="Sentiment breakdown per department" loading={loading}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis dataKey="name" tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: AXIS_COLOR }} />
          <Bar dataKey="Positive" stackId="a" fill={SENTIMENT_COLORS.positive} radius={[0,0,0,0]} />
          <Bar dataKey="Neutral"  stackId="a" fill={SENTIMENT_COLORS.neutral} />
          <Bar dataKey="Negative" stackId="a" fill={SENTIMENT_COLORS.negative} radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 3. Sentiment Distribution — Pie Chart
interface SentimentPieProps {
  positive: number; neutral: number; negative: number; loading: boolean;
}
export function SentimentPieChart({ positive, neutral, negative, loading }: SentimentPieProps) {
  const total = positive + neutral + negative;
  const data = [
    { name: "Positive", value: positive },
    { name: "Neutral",  value: neutral },
    { name: "Negative", value: negative },
  ].filter((d) => d.value > 0);

  return (
    <ChartCard title="Sentiment Distribution" subtitle="Overall positive vs neutral vs negative" loading={loading}>
      {total === 0 ? (
        <div className="h-[220px] flex items-center justify-center">
          <p className="text-xs text-white/30">No data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
              paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
              labelLine={false}>
              {data.map((_, i) => (
                <Cell key={i} fill={[SENTIMENT_COLORS.positive, SENTIMENT_COLORS.neutral, SENTIMENT_COLORS.negative][i]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// 4. Feedback Categories — Donut Chart
export function CategoryDonutChart({ data, loading }: { data: CategoryStat[]; loading: boolean }) {
  const chartData = data.slice(0, 7).map((c) => ({
    name: c.category.length > 14 ? c.category.slice(0, 14) + "…" : c.category,
    value: c.count,
  }));

  return (
    <ChartCard title="Feedback Categories" subtitle="Distribution across all feedback categories" loading={loading}>
      {chartData.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center">
          <p className="text-xs text-white/30">No data yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
              paddingAngle={2} dataKey="value">
              {chartData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconSize={8} iconType="circle"
              wrapperStyle={{ fontSize: 10, color: AXIS_COLOR }}
              formatter={(value) => <span style={{ color: "rgba(255,255,255,0.55)" }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// 5. Employee Satisfaction Trend — Area Chart
export function SatisfactionAreaChart({ data, loading }: { data: SatisfactionTrend[]; loading: boolean }) {
  return (
    <ChartCard title="Satisfaction Trend" subtitle="Average rating and satisfaction % over time" loading={loading}>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="grad-sat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="grad-rating" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis dataKey="shortMonth" tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: AXIS_COLOR }} />
          <Area type="monotone" dataKey="satisfactionPct" name="Satisfaction %" stroke="#8b5cf6" strokeWidth={2} fill="url(#grad-sat)" dot={{ r: 3, fill: "#8b5cf6" }} />
          <Area type="monotone" dataKey="avgRating"       name="Avg Rating"   stroke="#10b981" strokeWidth={2} fill="url(#grad-rating)" dot={{ r: 3, fill: "#10b981" }} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 6. Priority Distribution — Stacked Bar
export function PriorityStackedBar({ high, medium, low, loading }: {
  high: number; medium: number; low: number; loading: boolean;
}) {
  const data = [{ name: "Priority", High: high, Medium: medium, Low: low }];
  return (
    <ChartCard title="Priority Distribution" subtitle="High / medium / low priority breakdown" loading={loading}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
          <XAxis type="number" tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: AXIS_COLOR }} />
          <Bar dataKey="High"   stackId="p" fill="#ef4444" radius={[4,0,0,4]} />
          <Bar dataKey="Medium" stackId="p" fill="#f59e0b" />
          <Bar dataKey="Low"    stackId="p" fill="#10b981" radius={[0,4,4,0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// 7. Rating Distribution — Bar Chart
export function RatingDistributionChart({ data, loading }: { data: RatingDist[]; loading: boolean }) {
  return (
    <ChartCard title="Rating Distribution" subtitle="How employees are rating their experience" loading={loading}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis dataKey="label" tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" name="Count" radius={[4,4,0,0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={["#ef4444","#f97316","#f59e0b","#22d3ee","#10b981"][i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
