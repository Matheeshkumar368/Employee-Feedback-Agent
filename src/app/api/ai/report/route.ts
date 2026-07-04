import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import { authenticateRequest } from "@/lib/auth";

/**
 * GET /api/ai/report
 * Returns an aggregated AI analysis report for admins.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = authenticateRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") ?? "30");
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [
      sentimentBreakdown,
      priorityBreakdown,
      urgencyBreakdown,
      departmentSentiment,
      topKeywords,
      emotionBreakdown,
      recentHighPriority,
    ] = await Promise.all([
      // Sentiment counts
      Feedback.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$aiAnalysis.sentiment", count: { $sum: 1 } } },
      ]),

      // Priority counts
      Feedback.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$aiAnalysis.priority", count: { $sum: 1 } } },
      ]),

      // Urgency counts
      Feedback.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$aiAnalysis.urgency", count: { $sum: 1 } } },
      ]),

      // Department sentiment breakdown
      Feedback.aggregate([
        { $match: { createdAt: { $gte: since }, "aiAnalysis.sentiment": { $exists: true } } },
        {
          $group: {
            _id: "$department",
            positive: { $sum: { $cond: [{ $eq: ["$aiAnalysis.sentiment", "positive"] }, 1, 0] } },
            neutral:  { $sum: { $cond: [{ $eq: ["$aiAnalysis.sentiment", "neutral"] },  1, 0] } },
            negative: { $sum: { $cond: [{ $eq: ["$aiAnalysis.sentiment", "negative"] }, 1, 0] } },
            total: { $sum: 1 },
            avgRating: { $avg: "$rating" },
            avgScore:  { $avg: "$aiAnalysis.sentimentScore" },
          },
        },
        { $sort: { total: -1 } },
      ]),

      // Top keywords
      Feedback.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $unwind: "$aiAnalysis.keywords" },
        { $group: { _id: "$aiAnalysis.keywords", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]),

      // Emotion breakdown
      Feedback.aggregate([
        { $match: { createdAt: { $gte: since }, "aiAnalysis.emotion": { $exists: true, $ne: "" } } },
        { $group: { _id: "$aiAnalysis.emotion", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      // Recent high-priority items
      Feedback.find({
        "aiAnalysis.priority": "high",
        status: { $ne: "resolved" },
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("employeeName department category rating message aiAnalysis createdAt status")
        .lean(),
    ]);

    // Total analyzed
    const totalAnalyzed = await Feedback.countDocuments({
      createdAt: { $gte: since },
      "aiAnalysis.sentiment": { $exists: true },
    });
    const totalInPeriod = await Feedback.countDocuments({ createdAt: { $gte: since } });

    // Map to clean objects
    const sentMap: Record<string, number> = {};
    (sentimentBreakdown as { _id: string; count: number }[]).forEach((s) => {
      if (s._id) sentMap[s._id] = s.count;
    });
    const priMap: Record<string, number> = {};
    (priorityBreakdown as { _id: string; count: number }[]).forEach((p) => {
      if (p._id) priMap[p._id] = p.count;
    });
    const urgMap: Record<string, number> = {};
    (urgencyBreakdown as { _id: string; count: number }[]).forEach((u) => {
      if (u._id) urgMap[u._id] = u.count;
    });

    return NextResponse.json({
      period: { days, since },
      totals: {
        feedback: totalInPeriod,
        analyzed: totalAnalyzed,
        coverage: totalInPeriod > 0 ? Math.round((totalAnalyzed / totalInPeriod) * 100) : 0,
      },
      sentiment: {
        positive: sentMap["positive"] ?? 0,
        neutral:  sentMap["neutral"]  ?? 0,
        negative: sentMap["negative"] ?? 0,
      },
      priority: {
        high:   priMap["high"]   ?? 0,
        medium: priMap["medium"] ?? 0,
        low:    priMap["low"]    ?? 0,
      },
      urgency: {
        immediate: urgMap["immediate"] ?? 0,
        soon:      urgMap["soon"]      ?? 0,
        monitor:   urgMap["monitor"]   ?? 0,
        none:      urgMap["none"]      ?? 0,
      },
      departmentSentiment: (
        departmentSentiment as {
          _id: string; positive: number; neutral: number; negative: number;
          total: number; avgRating: number; avgScore: number;
        }[]
      ).map((d) => ({
        department: d._id,
        positive: d.positive,
        neutral: d.neutral,
        negative: d.negative,
        total: d.total,
        avgRating: Math.round(d.avgRating * 10) / 10,
        satisfactionScore: Math.round(d.avgScore * 100) / 100,
        positivePercent: d.total > 0 ? Math.round((d.positive / d.total) * 100) : 0,
      })),
      topKeywords: (topKeywords as { _id: string; count: number }[])
        .filter((k) => k._id)
        .map((k) => ({ word: k._id, count: k.count })),
      emotionBreakdown: (emotionBreakdown as { _id: string; count: number }[])
        .filter((e) => e._id)
        .map((e) => ({ emotion: e._id, count: e.count })),
      recentHighPriority,
    });
  } catch (error) {
    console.error("AI report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
