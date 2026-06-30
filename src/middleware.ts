import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "./lib/session.edge";

// Define route categories
const publicRoutes = ["/login", "/forgot-password", "/reset-password"];
const protectedRoutes = ["/", "/products", "/orders", "/customers", "/analytics", "/settings"];
const ownerOnlyRoutes = ["/settings", "/analytics"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => path === route || path.startsWith(`${route}/`));

  // Verify the session (Edge-compatible check)
  const session = await verifySession();


  // 1. Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !session.isAuth) {
    const callbackUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.nextUrl));
  }

  // 2. Redirect authenticated users away from public auth routes
  if (isPublicRoute && session.isAuth) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // 3. Enforce Role-Based Access Control (RBAC)
  if (session.isAuth && session.role === "EMPLOYEE") {
    // Employees cannot access settings or the full analytics modules
    const isTryingToAccessOwnerRoute = ownerOnlyRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`)
    );
    
    if (isTryingToAccessOwnerRoute) {
      // Redirect unauthorised employee back to dashboard
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static files, API routes, and Next.js internals
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
