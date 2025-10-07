// middleware.js - COMPLETELY REWRITTEN to avoid NEXT_REDIRECT
import { NextResponse } from "next/server";
import { apiBaseUrl } from "./utils/constants";
import { authenticateInMiddleware } from "./services/auth/refresh";
import { createErrorResponse } from "./utils/errors";
// Define protected routes and their required roles
const protectedRoutes = {
  "/admin": ["admin"],
  "/general-coordinator": ["IncubationCoordinator"],
  "/component-coordinator": ["ComponentCoordinator"],
  "/regional-coordinator": ["RegionalCoordinator"],
  "/mentor": ["mentor"],
  "/dashboard": [], // Any authenticated user can access
};

// Public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/auth/login",
  "/auth/reset_password",
  "/auth/register",
  "/api/auth/login",
  "/",
  "/about",
  "/contact",
  "/error",
  "/not-found",
  "/unauthorized",
  "/500",
];

export default async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes (except auth), and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow access to public routes
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const matchedRoute = Object.keys(protectedRoutes).find((route) =>
    pathname.startsWith(route)
  );

  if (!matchedRoute) {
    return NextResponse.next();
  }

  // Get tokens from cookies
  const accessToken = request.cookies.get("access")?.value;
  const refreshToken = request.cookies.get("refresh")?.value;

  // If no tokens at all, redirect to login
  if (!accessToken && !refreshToken) {
    console.log("No auth tokens found, redirecting to login");
    return redirectToLogin(request, pathname);
  }

  if (!apiBaseUrl) {
    console.error("API_BASE_URL not configured");
    return createErrorResponse(request, 500, "Configuration Error");
  }

  try {
    // DIRECT authentication check - NO apiClient, NO fetchCurrentUser
    const authResult = await authenticateInMiddleware(
      accessToken,
      refreshToken
    );

    if (!authResult.success) {
      console.log("Authentication failed:", authResult.error);
      return redirectToLogin(request, pathname);
    }

    const user = authResult.user;

    // Extract roles
    const userRoles = Array.isArray(user.roles)
      ? user.roles
      : Array.isArray(user.role)
      ? user.role
      : user.role
      ? [user.role]
      : [];

    const requiredRoles = protectedRoutes[matchedRoute];

    // Check role authorization
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some((role) =>
        userRoles.includes(role)
      );

      if (!hasRequiredRole) {
        console.log(
          `User roles [${userRoles.join(
            ", "
          )}] don't match required roles [${requiredRoles.join(", ")}]`
        );
        return redirectToUnauthorized(request);
      }
    }

    // Create response with user headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", user.id?.toString() || "");
    requestHeaders.set("x-user-roles", JSON.stringify(userRoles));
    requestHeaders.set("x-user-email", user.email || "");

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // If we refreshed the token, set the new access token
    if (authResult.newAccessToken) {
      response.cookies.set("access", authResult.newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Middleware auth error:", error);
    return createErrorResponse(request, 500, "Authentication Error");
  }
}

function redirectToLogin(request, originalPath) {
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("redirect", originalPath);
  loginUrl.searchParams.set("error", "auth_required");

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete("access");
  response.cookies.delete("refresh");
  response.cookies.delete("auth-token");
  response.cookies.delete("session");
  return response;
}

function redirectToUnauthorized(request) {
  return NextResponse.redirect(new URL("/unauthorized", request.url));
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
