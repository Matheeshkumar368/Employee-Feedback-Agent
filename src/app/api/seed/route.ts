import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Feedback from "@/models/Feedback";

export async function POST(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    await connectDB();
    const body = await req.json() as { secret: string };
    if (body.secret !== "aurahr-seed-2024") {
      return NextResponse.json({ error: "Invalid seed secret" }, { status: 403 });
    }

    // Clear existing data
    await User.deleteMany({});
    await Feedback.deleteMany({});

    const hashedPassword = await bcrypt.hash("password123", 12);

    // Create admin
    await User.create({
      employeeId: "ADMIN001",
      name: "Alex Johnson",
      email: "admin@aurahr.com",
      password: hashedPassword,
      role: "admin",
      department: "Human Resources",
      position: "HR Director",
    });

    // Create employees
    const employees = [
      { employeeId: "EMP001", name: "Sarah Chen", email: "sarah@aurahr.com", department: "Engineering", position: "Senior Developer" },
      { employeeId: "EMP002", name: "Marcus Williams", email: "marcus@aurahr.com", department: "Marketing", position: "Marketing Manager" },
      { employeeId: "EMP003", name: "Priya Sharma", email: "priya@aurahr.com", department: "Design", position: "UI/UX Designer" },
      { employeeId: "EMP004", name: "James Brown", email: "james@aurahr.com", department: "Sales", position: "Sales Executive" },
      { employeeId: "EMP005", name: "Emma Davis", email: "emma@aurahr.com", department: "Finance", position: "Financial Analyst" },
    ];

    for (const emp of employees) {
      await User.create({ ...emp, password: hashedPassword, role: "employee" });
    }

    // Create sample feedback
    const sampleFeedback = [
      {
        employeeName: "Sarah Chen", employeeId: "EMP001", department: "Engineering",
        category: "Work Environment", rating: 4, isAnonymous: false,
        message: "The engineering team has a great collaborative environment. Code reviews are constructive and team meetings are well organized. Would love to see more hackathon events.",
        aiAnalysis: {
          sentiment: "positive", sentimentScore: 0.8,
          summary: "Employee appreciates collaborative environment and structured meetings, suggests hackathon events.",
          keywords: ["collaboration", "code reviews", "team meetings", "hackathon"],
          priority: "low", recommendedAction: "Organize quarterly hackathon events to boost innovation.",
          analyzedAt: new Date(),
        },
      },
      {
        employeeName: "Anonymous", employeeId: "ANON", department: "Marketing",
        category: "Management", rating: 2, isAnonymous: true,
        message: "Management communication has been very poor recently. Decisions are made without consulting the team and we often find out about changes at the last minute. This is creating a lot of uncertainty.",
        aiAnalysis: {
          sentiment: "negative", sentimentScore: -0.8,
          summary: "Employee concerns about poor management communication and lack of team consultation in decision-making.",
          keywords: ["management", "communication", "decisions", "uncertainty", "transparency"],
          priority: "high", recommendedAction: "Implement regular team town halls and establish decision communication protocols.",
          analyzedAt: new Date(),
        },
      },
      {
        employeeName: "Priya Sharma", employeeId: "EMP003", department: "Design",
        category: "Career Growth", rating: 3, isAnonymous: false,
        message: "While I enjoy my work, I feel there are limited growth opportunities in the design team. Would appreciate more mentorship programs and clearer career progression paths.",
        aiAnalysis: {
          sentiment: "neutral", sentimentScore: -0.1,
          summary: "Employee seeks better career development opportunities and mentorship programs in design department.",
          keywords: ["career growth", "mentorship", "opportunities", "progression", "design"],
          priority: "medium", recommendedAction: "Create design career ladder and mentorship matching program.",
          analyzedAt: new Date(),
        },
      },
      {
        employeeName: "James Brown", employeeId: "EMP004", department: "Sales",
        category: "Compensation & Benefits", rating: 2, isAnonymous: false,
        message: "The current commission structure is demotivating. Targets have been increased by 30% but commission rates remain the same. Many team members are considering leaving.",
        aiAnalysis: {
          sentiment: "negative", sentimentScore: -0.9,
          summary: "Critical concern about unfair compensation structure with increased targets but unchanged commission rates, causing retention risk.",
          keywords: ["compensation", "commission", "targets", "retention", "motivation"],
          priority: "high", recommendedAction: "Urgent review of commission structure and sales targets alignment.",
          analyzedAt: new Date(),
        },
      },
      {
        employeeName: "Emma Davis", employeeId: "EMP005", department: "Finance",
        category: "Work-Life Balance", rating: 5, isAnonymous: false,
        message: "The flexible work policy has been amazing! Being able to work from home 3 days a week has significantly improved my productivity and work-life balance. The finance team is very supportive.",
        aiAnalysis: {
          sentiment: "positive", sentimentScore: 0.95,
          summary: "Highly positive feedback about flexible work policy improving productivity and work-life balance.",
          keywords: ["flexible work", "remote work", "productivity", "work-life balance", "supportive"],
          priority: "low", recommendedAction: "Expand flexible work policy to other departments.",
          analyzedAt: new Date(),
        },
      },
      {
        employeeName: "Marcus Williams", employeeId: "EMP002", department: "Marketing",
        category: "Tools & Resources", rating: 3, isAnonymous: false,
        message: "Our marketing tools are outdated. We are still using legacy software that slows down our campaigns. Competitors are using AI-powered tools while we are stuck with manual processes.",
        aiAnalysis: {
          sentiment: "neutral", sentimentScore: -0.3,
          summary: "Employee frustrated with outdated marketing tools impacting campaign efficiency and competitive position.",
          keywords: ["tools", "legacy software", "AI", "automation", "efficiency"],
          priority: "medium", recommendedAction: "Evaluate and budget for modern marketing automation tools.",
          analyzedAt: new Date(),
        },
      },
    ];

    await Feedback.insertMany(sampleFeedback);

    return NextResponse.json({
      message: "Database seeded successfully",
      data: {
        admin: { employeeId: "ADMIN001", password: "password123" },
        employees: employees.map((e) => ({ employeeId: e.employeeId, password: "password123" })),
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
