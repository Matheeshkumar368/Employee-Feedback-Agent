import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Feedback from "@/models/Feedback";
import { authenticateRequest } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = authenticateRequest(req);
    if (!auth || auth.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalEmployees,
      newEmployeesThisMonth,
      totalFeedback,
      feedbackThisMonth,
      feedbackLastMonth,
      sentimentCounts,
      ratingAgg,
      pendingReviews,
      recentFeedback,
      departmentStats,
      recentEmployees,
      statusCounts,
    ] = await Promise.all([
      User.countDocuments({ role: "employee", isActive: true }),

      User.countDocuments({
        role: "employee",
        isActive: true,
        createdAt: { $gte: startOfThisMonth },
      }),

      Feedback.countDocuments(),

      Feedback.countDocuments({ createdAt: { $gte: startOfThisMonth } }),

      Feedback.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),

      Feedback.aggregate([
        { $group: { _id: "$aiAnalysis.sentiment", count: { $sum: 1 } } },
      ]),

      Feedback.aggregate([
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]),

      Feedback.countDocuments({ status: "pending" }),

      Feedback.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),

      Feedback.aggregate([
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" },
            positive: {
              $sum: {
                $cond: [{ $eq: ["$aiAnalysis.sentiment", "positive"] }, 1, 0],
              },
            },
            negative: {
              $sum: {
                $cond: [{ $eq: ["$aiAnalysis.sentiment", "negative"] }, 1, 0],
              },
            },
            neutral: {
              $sum: {
                $cond: [{ $eq: ["$aiAnalysis.sentiment", "neutral"] }, 1, 0],
              },
            },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Recent employee signups with feedback count
      User.find({ role: "employee", isActive: true })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("-password")
        .lean(),

      Feedback.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    // Map sentiments
    const sentimentMap: Record<string, number> = {};
    for (const s of sentimentCounts as { _id: string; count: number }[]) {
      sentimentMap[s._id ?? "unanalyzed"] = s.count;
    }

    // Map statuses
    const statusMap: Record<string, number> = {};
    for (const s of statusCounts as { _id: string; count: number }[]) {
      statusMap[s._id ?? "unknown"] = s.count;
    }

    const avgRating = (ratingAgg as { _id: null; avg: number }[])[0]?.avg ?? 0;

    // Attach feedback counts to employees
    const employeeIds = (recentEmployees as { employeeId: string }[]).map(
      (e) => e.employeeId
    );
    const feedbackCountsPerEmployee = await Feedback.aggregate([
      { $match: { employeeId: { $in: employeeIds } } },
      { $group: { _id: "$employeeId", count: { $sum: 1 }, avgRating: { $avg: "$rating" } } },
    ]);
    const fbMap: Record<string, { count: number; avgRating: number }> = {};
    for (const f of feedbackCountsPerEmployee as {
      _id: string;
      count: number;
      avgRating: number;
    }[]) {
      fbMap[f._id] = { count: f.count, avgRating: Math.round(f.avgRating * 10) / 10 };
    }

    const employeesWithStats = (
      recentEmployees as {
        _id: unknown;
        employeeId: string;
        name: string;
        department: string;
        position: string;
        createdAt: Date;
      }[]
    ).map((e) => ({
      ...e,
      feedbackCount: fbMap[e.employeeId]?.count ?? 0,
      avgRating: fbMap[e.employeeId]?.avgRating ?? 0,
    }));

    // Feedback trend
    const feedbackTrend =
      feedbackLastMonth > 0
        ? Math.round(((feedbackThisMonth - feedbackLastMonth) / feedbackLastMonth) * 100)
        : feedbackThisMonth > 0
        ? 100
        : 0;

    return NextResponse.json({
      stats: {
        totalEmployees,
        newEmployeesThisMonth,
        totalFeedback,
        feedbackThisMonth,
        feedbackTrend,
        positive: sentimentMap["positive"] ?? 0,
        neutral: sentimentMap["neutral"] ?? 0,
        negative: sentimentMap["negative"] ?? 0,
        avgRating: Math.round(avgRating * 10) / 10,
        pendingReviews,
        resolved: statusMap["resolved"] ?? 0,
        reviewed: statusMap["reviewed"] ?? 0,
      },
      recentFeedback,
      departmentStats: (
        departmentStats as {
          _id: string;
          count: number;
          avgRating: number;
          positive: number;
          negative: number;
          neutral: number;
        }[]
      ).map((d) => ({
        name: d._id ?? "Unknown",
        count: d.count,
        avgRating: Math.round(d.avgRating * 10) / 10,
        positive: d.positive,
        negative: d.negative,
        neutral: d.neutral,
        positivePercent: d.count > 0 ? Math.round((d.positive / d.count) * 100) : 0,
        negativePercent: d.count > 0 ? Math.round((d.negative / d.count) * 100) : 0,
      })),
      recentEmployees: employeesWithStats,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
