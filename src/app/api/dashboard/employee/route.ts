import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Feedback from "@/models/Feedback";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch profile
    const profile = await User.findById(auth.userId).select("-password").lean();
    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Feedback stats for this employee
    const [totalFeedback, recentFeedback, sentimentCounts, ratingAgg, pendingCount] =
      await Promise.all([
        Feedback.countDocuments({ employeeId: auth.employeeId }),

        Feedback.find({ employeeId: auth.employeeId })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),

        Feedback.aggregate([
          { $match: { employeeId: auth.employeeId } },
          { $group: { _id: "$aiAnalysis.sentiment", count: { $sum: 1 } } },
        ]),

        Feedback.aggregate([
          { $match: { employeeId: auth.employeeId } },
          { $group: { _id: null, avg: { $avg: "$rating" } } },
        ]),

        Feedback.countDocuments({
          employeeId: auth.employeeId,
          status: "pending",
        }),
      ]);

    // Map sentiment counts
    const sentimentMap: Record<string, number> = {};
    for (const s of sentimentCounts as { _id: string; count: number }[]) {
      sentimentMap[s._id ?? "unanalyzed"] = s.count;
    }

    const avgRating =
      (ratingAgg as { _id: null; avg: number }[])[0]?.avg ?? 0;

    // Month-over-month: feedback submitted this calendar month vs last
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [thisMonthCount, lastMonthCount] = await Promise.all([
      Feedback.countDocuments({
        employeeId: auth.employeeId,
        createdAt: { $gte: startOfThisMonth },
      }),
      Feedback.countDocuments({
        employeeId: auth.employeeId,
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
    ]);

    // Feedback goal (target: 5 per month, show progress)
    const MONTHLY_GOAL = 5;

    return NextResponse.json({
      profile,
      stats: {
        total: totalFeedback,
        positive: sentimentMap["positive"] ?? 0,
        neutral: sentimentMap["neutral"] ?? 0,
        negative: sentimentMap["negative"] ?? 0,
        avgRating: Math.round(avgRating * 10) / 10,
        pending: pendingCount,
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount,
        monthlyGoal: MONTHLY_GOAL,
      },
      recentFeedback,
    });
  } catch (error) {
    console.error("Employee dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
