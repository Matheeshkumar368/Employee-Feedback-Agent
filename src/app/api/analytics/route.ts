import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth";
import { generateInsights } from "@/lib/gemini";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = authenticateRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department") ?? "";
    const category   = searchParams.get("category")   ?? "";
    const sentiment  = searchParams.get("sentiment")  ?? "";
    const priority   = searchParams.get("priority")   ?? "";
    const dateFrom   = searchParams.get("dateFrom")   ?? "";
    const dateTo     = searchParams.get("dateTo")     ?? "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (department) filter.department = department;
    if (category)   filter.category   = category;
    if (sentiment)  filter["aiAnalysis.sentiment"] = sentiment;
    if (priority)   filter["aiAnalysis.priority"]  = priority;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo)   filter.createdAt.$lte = new Date(dateTo);
    }

    const [
      totalFeedback,
      totalEmployees,
      sentimentCounts,
      departmentStats,
      monthlyStats,
      categoryStats,
      ratingDistribution,
      pendingCount,
      resolvedCount,
      reviewedCount,
      priorityStats,
      topKeywordsRaw,
      currentMonthCount,
      satisfactionTrend,
    ] = await Promise.all([
      Feedback.countDocuments(filter),
      User.countDocuments({ role: "employee" }),

      Feedback.aggregate([
        { $match: filter },
        { $group: { _id: "$aiAnalysis.sentiment", count: { $sum: 1 } } },
      ]),

      Feedback.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" },
            avgSentimentScore: { $avg: "$aiAnalysis.sentimentScore" },
            positive: { $sum: { $cond: [{ $eq: ["$aiAnalysis.sentiment", "positive"] }, 1, 0] } },
            negative: { $sum: { $cond: [{ $eq: ["$aiAnalysis.sentiment", "negative"] }, 1, 0] } },
            neutral:  { $sum: { $cond: [{ $eq: ["$aiAnalysis.sentiment", "neutral"] },  1, 0] } },
            highPriority: { $sum: { $cond: [{ $eq: ["$aiAnalysis.priority", "high"] }, 1, 0] } },
          },
        },
        { $sort: { count: -1 } },
      ]),

      Feedback.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            count:    { $sum: 1 },
            avgRating:{ $avg: "$rating" },
            positive: { $sum: { $cond: [{ $eq: ["$aiAnalysis.sentiment", "positive"] }, 1, 0] } },
            negative: { $sum: { $cond: [{ $eq: ["$aiAnalysis.sentiment", "negative"] }, 1, 0] } },
            neutral:  { $sum: { $cond: [{ $eq: ["$aiAnalysis.sentiment", "neutral"] },  1, 0] } },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]),

      Feedback.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$category",
            count:    { $sum: 1 },
            avgRating:{ $avg: "$rating" },
            positive: { $sum: { $cond: [{ $eq: ["$aiAnalysis.sentiment", "positive"] }, 1, 0] } },
            negative: { $sum: { $cond: [{ $eq: ["$aiAnalysis.sentiment", "negative"] }, 1, 0] } },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      Feedback.aggregate([
        { $match: filter },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      Feedback.countDocuments({ ...filter, status: "pending" }),
      Feedback.countDocuments({ ...filter, status: "resolved" }),
      Feedback.countDocuments({ ...filter, status: "reviewed" }),

      Feedback.aggregate([
        { $match: filter },
        { $group: { _id: "$aiAnalysis.priority", count: { $sum: 1 } } },
      ]),

      Feedback.aggregate([
        { $match: filter },
        { $unwind: "$aiAnalysis.keywords" },
        { $group: { _id: "$aiAnalysis.keywords", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),

      // Current month count (no extra filter needed)
      Feedback.countDocuments({
        ...filter,
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),

      // Satisfaction trend: last 6 months avg rating
      Feedback.aggregate([
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            avgRating:        { $avg: "$rating" },
            avgSentimentScore:{ $avg: "$aiAnalysis.sentimentScore" },
            count:            { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 6 },
      ]),
    ]);

    // Compute averages
    const allRatings = await Feedback.aggregate([
      { $match: filter },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    const avgRating: number = (allRatings[0] as { avg: number } | undefined)?.avg ?? 0;

    // Maps
    const sentimentMap: Record<string, number> = {};
    (sentimentCounts as { _id: string; count: number }[]).forEach((s) => {
      sentimentMap[s._id || "unanalyzed"] = s.count;
    });

    const priorityMap: Record<string, number> = {};
    (priorityStats as { _id: string; count: number }[]).forEach((p) => {
      if (p._id) priorityMap[p._id] = p.count;
    });

    // Monthly chart data
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyChartData = (monthlyStats as {
      _id: { year: number; month: number };
      count: number; avgRating: number; positive: number; negative: number; neutral: number;
    }[]).map((m) => ({
      month:     `${MONTHS[m._id.month - 1]} ${m._id.year}`,
      shortMonth: MONTHS[m._id.month - 1],
      total:     m.count,
      avgRating: Math.round(m.avgRating * 10) / 10,
      positive:  m.positive,
      negative:  m.negative,
      neutral:   m.neutral,
    }));

    // Satisfaction trend
    const satisfactionChartData = (satisfactionTrend as {
      _id: { year: number; month: number };
      avgRating: number; avgSentimentScore: number; count: number;
    }[]).map((m) => ({
      month:            `${MONTHS[m._id.month - 1]} ${m._id.year}`,
      shortMonth:        MONTHS[m._id.month - 1],
      avgRating:        Math.round(m.avgRating * 10) / 10,
      satisfactionPct:  Math.round(((m.avgSentimentScore + 1) / 2) * 100),
      count:            m.count,
    }));

    // Dept stats clean
    const deptData = (departmentStats as {
      _id: string; count: number; avgRating: number; avgSentimentScore: number;
      positive: number; negative: number; neutral: number; highPriority: number;
    }[]).map((d) => ({
      department:      d._id ?? "Unknown",
      count:           d.count,
      avgRating:       Math.round(d.avgRating * 10) / 10,
      sentimentScore:  Math.round((d.avgSentimentScore ?? 0) * 100) / 100,
      positive:        d.positive,
      negative:        d.negative,
      neutral:         d.neutral,
      highPriority:    d.highPriority,
      positivePercent: d.count > 0 ? Math.round((d.positive / d.count) * 100) : 0,
      negativePercent: d.count > 0 ? Math.round((d.negative / d.count) * 100) : 0,
      trend: d.avgRating >= 4 ? "up" : d.avgRating <= 2.5 ? "down" : "neutral",
    }));

    // Category stats clean
    const catData = (categoryStats as {
      _id: string; count: number; avgRating: number; positive: number; negative: number;
    }[]).map((c) => ({
      category:  c._id ?? "Unknown",
      count:     c.count,
      avgRating: Math.round(c.avgRating * 10) / 10,
      positive:  c.positive,
      negative:  c.negative,
    }));

    // Rating distribution
    const ratingDist = [1, 2, 3, 4, 5].map((r) => {
      const found = (ratingDistribution as { _id: number; count: number }[]).find((d) => d._id === r);
      return { rating: r, label: `${r}★`, count: found?.count ?? 0 };
    });

    // Keywords
    const keywords = (topKeywordsRaw as { _id: string; count: number }[])
      .filter((k) => k._id)
      .map((k) => ({ word: k._id, count: k.count }));

    const topIssues = keywords.slice(0, 8).map((k) => k.word);

    // AI insights (never fails — has fallback)
    const aiInsights = totalFeedback > 0
      ? await generateInsights({
          total:    totalFeedback,
          positive: sentimentMap["positive"] ?? 0,
          neutral:  sentimentMap["neutral"]  ?? 0,
          negative: sentimentMap["negative"] ?? 0,
          avgRating,
          topDepartments: deptData.slice(0, 3).map((d) => ({ name: d.department, avg: d.avgRating })),
          topIssues: topIssues.slice(0, 5),
        })
      : [
          "No feedback data available yet — seed the database to get started.",
          "Encourage employees to submit feedback via the portal.",
          "Enable anonymous submissions to increase participation rates.",
          "Regular monthly reviews help track satisfaction improvements.",
          "Target 80% positive sentiment as your quarterly HR benchmark.",
        ];

    return NextResponse.json({
      overview: {
        totalFeedback,
        totalEmployees,
        positive:        sentimentMap["positive"]  ?? 0,
        neutral:         sentimentMap["neutral"]   ?? 0,
        negative:        sentimentMap["negative"]  ?? 0,
        avgRating:       Math.round(avgRating * 10) / 10,
        pendingReviews:  pendingCount,
        resolved:        resolvedCount,
        reviewed:        reviewedCount,
        currentMonth:    currentMonthCount,
        highPriority:    priorityMap["high"]   ?? 0,
        mediumPriority:  priorityMap["medium"] ?? 0,
        lowPriority:     priorityMap["low"]    ?? 0,
        satisfactionPct: totalFeedback > 0
          ? Math.round(((sentimentMap["positive"] ?? 0) / totalFeedback) * 100)
          : 0,
      },
      departmentStats:     deptData,
      monthlyData:         monthlyChartData,
      satisfactionTrend:   satisfactionChartData,
      categoryStats:       catData,
      ratingDistribution:  ratingDist,
      keywords,
      topIssues,
      aiInsights,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
