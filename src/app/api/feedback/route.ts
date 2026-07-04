import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import { authenticateRequest } from "@/lib/auth";
import { analyzeFeedback } from "@/lib/gemini";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as {
      employeeName: string;
      employeeId: string;
      department: string;
      category: string;
      rating: number;
      message: string;
      isAnonymous: boolean;
    };

    const { employeeName, employeeId, department, category, rating, message, isAnonymous } = body;

    if (!department || !category || !rating || !message) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    if (message.length < 10) {
      return NextResponse.json({ error: "Feedback message must be at least 10 characters" }, { status: 400 });
    }

    const displayName = isAnonymous ? "Anonymous" : (employeeName || user.name);
    const displayId = isAnonymous ? "ANON" : (employeeId || user.employeeId);

    const feedback = await Feedback.create({
      employeeName: displayName,
      employeeId: displayId,
      department,
      category,
      rating,
      message,
      isAnonymous,
      status: "pending",
    });

    // Run AI analysis asynchronously
    analyzeFeedback(message, department, category, rating)
      .then(async (analysis) => {
        await Feedback.findByIdAndUpdate(feedback._id, {
          aiAnalysis: {
            ...analysis,
            analyzedAt: new Date(),
          },
        });
      })
      .catch((err) => console.error("Background AI analysis failed:", err));

    return NextResponse.json({
      message: "Feedback submitted successfully",
      feedback: {
        id: feedback._id.toString(),
        department: feedback.department,
        category: feedback.category,
        rating: feedback.rating,
        createdAt: feedback.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Feedback POST error:", error);
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
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const search = searchParams.get("search") ?? "";
    const department = searchParams.get("department") ?? "";
    const sentiment = searchParams.get("sentiment") ?? "";
    const category = searchParams.get("category") ?? "";
    const status = searchParams.get("status") ?? "";
    const sort = searchParams.get("sort") ?? "-createdAt";
    const dateFrom = searchParams.get("dateFrom") ?? "";
    const dateTo = searchParams.get("dateTo") ?? "";

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    // Employees only see their own feedback
    if (user.role === "employee") {
      query.employeeId = user.employeeId;
    }

    if (search) {
      query.$or = [
        { message: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { employeeName: { $regex: search, $options: "i" } },
      ];
    }

    if (department) query.department = department;
    if (category) query.category = category;
    if (sentiment) query["aiAnalysis.sentiment"] = sentiment;
    if (status && ["pending", "reviewed", "resolved"].includes(status)) query.status = status;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const skip = (page - 1) * limit;
    const total = await Feedback.countDocuments(query);

    // Build sort direction
    const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
    const sortDir: 1 | -1 = sort.startsWith("-") ? -1 : 1;

    const feedbacks = await Feedback.find(query)
      .sort([[sortField, sortDir]])
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      feedbacks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Feedback GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
