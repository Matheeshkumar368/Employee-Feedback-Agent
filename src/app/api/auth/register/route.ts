import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json() as {
      employeeId: string;
      name: string;
      email: string;
      password: string;
      role?: "employee" | "admin";
      department?: string;
      position?: string;
    };

    const { employeeId, name, email, password, role = "employee", department = "General", position = "Employee" } = body;

    if (!employeeId || !name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existingUser = await User.findOne({ $or: [{ employeeId }, { email }] });
    if (existingUser) {
      return NextResponse.json({ error: "Employee ID or email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      employeeId,
      name,
      email,
      password: hashedPassword,
      role,
      department,
      position,
    });

    return NextResponse.json({
      message: "Account created successfully",
      user: {
        id: user._id.toString(),
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
