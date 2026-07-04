import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";
import { authenticateDemoUser } from "@/lib/demo-auth";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      employeeId: string;
      password: string;
      role: "employee" | "admin";
    };

    const { employeeId, password, role } = body;

    if (!employeeId || !password) {
      return NextResponse.json({ error: "Employee ID and password are required" }, { status: 400 });
    }

    let user;
    let authMode = "database";

    try {
      await connectDB();
      const dbUser = await User.findOne({ employeeId, isActive: true });

      if (dbUser) {
        if (role && dbUser.role !== role) {
          return NextResponse.json({ error: "Access denied for this role" }, { status: 403 });
        }

        const isPasswordValid = await bcrypt.compare(password, dbUser.password);
        if (!isPasswordValid) {
          return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        user = {
          id: dbUser._id.toString(),
          employeeId: dbUser.employeeId,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          department: dbUser.department,
          position: dbUser.position,
          avatar: dbUser.avatar,
        };
      }
    } catch (dbError) {
      console.warn("Database login unavailable, falling back to demo credentials:", dbError);
    }

    if (!user) {
      const demoUser = authenticateDemoUser(employeeId, password, role);
      if (!demoUser) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      user = demoUser;
      authMode = "demo";
    }

    const token = signToken({
      userId: user.id,
      employeeId: user.employeeId,
      role: user.role,
      name: user.name,
      department: user.department,
    });

    const response = NextResponse.json({
      message: "Login successful",
      token,
      authMode,
      user,
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
