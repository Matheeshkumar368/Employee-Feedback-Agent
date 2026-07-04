import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import { authenticateRequest } from "@/lib/auth";
import { analyzeFeedback } from "@/lib/gemini";

/**
 * POST /api/ai/analyze
 * Trigger AI analysis for an existing feedback document.
 * Body: { feedbackId: string }
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as { feedbackId?: string };
    const { feedbackId } = body;

    if (!feedbackId) {
      return NextResponse.json({ error: "feedbackId is required" }, { status: 400 });
    }

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    // Employees can only analyze their own feedback
    if (user.role === "employee" && feedback.employeeId !== user.employeeId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const analysis = await analyzeFeedback(
      feedback.message,
      feedback.department,
      feedback.category,
      feedback.rating
    );

    const updated = await Feedback.findByIdAndUpdate(
      feedbackId,
      {
        aiAnalysis: {
          ...analysis,
          analyzedAt: new Date(),
        },
      },
      { new: true }
    ).lean();

    return NextResponse.json({
      message: "Analysis complete",
      feedbackId,
      analysis: updated?.aiAnalysis,
    });
  } catch (error) {
    console.error("AI analyze error:", error);
    const msg = error instanceof Error ? error.message : "Analysis failed";
    const isApiKey = msg.includes("GEMINI_API_KEY");
    return NextResponse.json(
      { error: isApiKey ? "Gemini API key not configured" : "Analysis failed" },
      { status: isApiKey ? 503 : 500 }
    );
  }
}
