import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import { authenticateRequest } from "@/lib/auth";

/**
 * GET /api/ai/history
 * Returns feedback items that have AI analysis attached.
 * Employees see only their own. Admins see all.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page  = parseInt(searchParams.get("page")  ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { "aiAnalysis.sentiment": { $exists: true } };

    // Employees only see their own analyzed feedback
    if (user.role === "employee") {
      query.employeeId = user.employeeId;
    }

    const skip  = (page - 1) * limit;
    const total = await Feedback.countDocuments(query);

    const feedbacks = await Feedback.find(query)
      .sort({ "aiAnalysis.analyzedAt": -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "employeeName employeeId department category rating message isAnonymous status aiAnalysis createdAt"
      )
      .lean();

    return NextResponse.json({
      feedbacks,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("AI history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
