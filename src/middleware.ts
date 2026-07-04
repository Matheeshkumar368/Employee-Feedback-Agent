import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Routes that require authentication
const PROTECTED_ADMIN_ROUTES = ["/admin"];
const PROTECTED_EMPLOYEE_ROUTES = ["/employee"];
const AUTH_ROUTES = ["/login", "/login/admin", "/login/employee", "/register", "/register/*"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get token from cookie
  const token = req.cookies.get("auth-token")?.value;

  const isAdminRoute = PROTECTED_ADMIN_ROUTES.some((r) =>
    pathname.startsWith(r)
  );
  const isEmployeeRoute = PROTECTED_EMPLOYEE_ROUTES.some((r) =>
    pathname.startsWith(r)
  );
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Verify token if present
  let user = null;
  if (token) {
    try {
      user = verifyToken(token);
    } catch {
      // Invalid token — clear cookie and redirect to login
      if (isAdminRoute || isEmployeeRoute) {
        const response = NextResponse.redirect(
          new URL(isAdminRoute ? "/login/admin" : "/login/employee", req.url)
        );
        response.cookies.delete("auth-token");
        return response;
      }
    }
  }

  // Redirect unauthenticated users away from protected routes
  if (!user) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/login/admin", req.url));
    }
    if (isEmployeeRoute) {
      return NextResponse.redirect(new URL("/login/employee", req.url));
    }
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute) {
    const dest =
      user.role === "admin" ? "/admin/dashboard" : "/employee/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Role-based access control
  if (isAdminRoute && user.role !== "admin") {
    return NextResponse.redirect(new URL("/employee/dashboard", req.url));
  }
  if (isEmployeeRoute && user.role !== "employee") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/employee/:path*",
    "/login",
    "/login/admin",
    "/login/employee",
    "/register",
    "/register/:path*",
  ],
};
