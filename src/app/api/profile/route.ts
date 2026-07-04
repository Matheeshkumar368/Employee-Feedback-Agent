import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await User.findById(user.userId)
      .select("-password")
      .lean();

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as {
      name?: string;
      email?: string;
      department?: string;
      position?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const { name, email, department, position, currentPassword, newPassword } = body;

    const existingUser = await User.findById(user.userId);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle password change
    if (currentPassword && newPassword) {
      const isValid = await bcrypt.compare(currentPassword, existingUser.password);
      if (!isValid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
      }
      existingUser.password = await bcrypt.hash(newPassword, 12);
    }

    if (name) existingUser.name = name;
    if (email) existingUser.email = email;
    if (department) existingUser.department = department;
    if (position) existingUser.position = position;

    await existingUser.save();

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: {
        id: existingUser._id.toString(),
        employeeId: existingUser.employeeId,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        department: existingUser.department,
        position: existingUser.position,
      },
    });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
