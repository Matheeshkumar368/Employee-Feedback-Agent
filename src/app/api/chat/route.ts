import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ChatHistory from "@/models/ChatHistory";
import Feedback from "@/models/Feedback";
import { authenticateRequest } from "@/lib/auth";
import { chatWithAgent } from "@/lib/gemini";
import { v4 as uuidv4 } from "uuid";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as {
      message: string;
      sessionId?: string;
    };

    const { message, sessionId } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get or create session
    let session = sessionId
      ? await ChatHistory.findOne({ sessionId, userId: user.userId })
      : null;

    if (!session) {
      session = await ChatHistory.create({
        userId: user.userId,
        sessionId: uuidv4(),
        title: message.slice(0, 50),
        messages: [],
      });
    }

    // Get feedback context for admin users
    let feedbackContext = "";
    if (user.role === "admin") {
      const feedbackSummary = await Feedback.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            avgRating: { $avg: "$rating" },
            positive: {
              $sum: { $cond: [{ $eq: ["$aiAnalysis.sentiment", "positive"] }, 1, 0] },
            },
            negative: {
              $sum: { $cond: [{ $eq: ["$aiAnalysis.sentiment", "negative"] }, 1, 0] },
            },
            neutral: {
              $sum: { $cond: [{ $eq: ["$aiAnalysis.sentiment", "neutral"] }, 1, 0] },
            },
          },
        },
      ]);

      const deptBreakdown = await Feedback.aggregate([
        { $group: { _id: "$department", count: { $sum: 1 }, avgRating: { $avg: "$rating" } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]);

      const topIssues = await Feedback.aggregate([
        { $unwind: "$aiAnalysis.keywords" },
        { $group: { _id: "$aiAnalysis.keywords", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]);

      const summary = feedbackSummary[0];
      if (summary) {
        feedbackContext = `
Total Feedback: ${summary.total}
Average Rating: ${summary.avgRating?.toFixed(1)}/5
Positive: ${summary.positive}, Neutral: ${summary.neutral}, Negative: ${summary.negative}
Departments: ${deptBreakdown.map((d: { _id: string; count: number; avgRating: number }) => `${d._id} (${d.count} feedbacks, avg: ${d.avgRating?.toFixed(1)})`).join(", ")}
Top Issues: ${topIssues.map((i: { _id: string }) => i._id).filter(Boolean).join(", ")}`;
      }
    }

    // Build conversation history
    const history = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Get AI response
    const aiResponse = await chatWithAgent(message, history, feedbackContext);

    // Update session with new messages
    session.messages.push({ role: "user", content: message, timestamp: new Date() });
    session.messages.push({ role: "assistant", content: aiResponse, timestamp: new Date() });

    // Update title if first message
    if (session.messages.length <= 2) {
      session.title = message.slice(0, 60);
    }

    await session.save();

    return NextResponse.json({
      message: aiResponse,
      sessionId: session.sessionId,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      const session = await ChatHistory.findOne({
        sessionId,
        userId: user.userId,
      }).lean();

      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      return NextResponse.json({ session });
    }

    // List all sessions
    const sessions = await ChatHistory.find({ userId: user.userId })
      .select("sessionId title createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Chat GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    await ChatHistory.deleteOne({ sessionId, userId: user.userId });

    return NextResponse.json({ message: "Chat deleted" });
  } catch (error) {
    console.error("Chat DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
