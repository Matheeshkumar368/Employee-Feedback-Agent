export interface AnalyticsOverview {
  totalFeedback: number;
  totalEmployees: number;
  positive: number;
  neutral: number;
  negative: number;
  avgRating: number;
  pendingReviews: number;
  resolved: number;
  reviewed: number;
  currentMonth: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  satisfactionPct: number;
}

export interface DeptStat {
  department: string;
  count: number;
  avgRating: number;
  sentimentScore: number;
  positive: number;
  negative: number;
  neutral: number;
  highPriority: number;
  positivePercent: number;
  negativePercent: number;
  trend: "up" | "down" | "neutral";
}

export interface MonthlyData {
  month: string;
  shortMonth: string;
  total: number;
  avgRating: number;
  positive: number;
  negative: number;
  neutral: number;
}

export interface SatisfactionTrend {
  month: string;
  shortMonth: string;
  avgRating: number;
  satisfactionPct: number;
  count: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  avgRating: number;
  positive: number;
  negative: number;
}

export interface RatingDist {
  rating: number;
  label: string;
  count: number;
}

export interface Keyword {
  word: string;
  count: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  departmentStats: DeptStat[];
  monthlyData: MonthlyData[];
  satisfactionTrend: SatisfactionTrend[];
  categoryStats: CategoryStat[];
  ratingDistribution: RatingDist[];
  keywords: Keyword[];
  topIssues: string[];
  aiInsights: string[];
}
