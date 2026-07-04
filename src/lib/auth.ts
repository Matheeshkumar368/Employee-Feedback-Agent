import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface JWTPayload {
  userId: string;
  employeeId: string;
  role: "employee" | "admin";
  name: string;
  department?: string;
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  const cookieToken = req.cookies.get("auth-token")?.value;
  return cookieToken ?? null;
}

export function authenticateRequest(req: NextRequest): JWTPayload | null {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(
  req: NextRequest,
  role?: "admin" | "employee"
): { user: JWTPayload } | { error: string; status: number } {
  const user = authenticateRequest(req);
  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }
  if (role && user.role !== role) {
    return { error: "Forbidden", status: 403 };
  }
  return { user };
}
