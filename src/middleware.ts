import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// Operational configuration
const MAINTENANCE_MODE = false;

export async function middleware(req: NextRequest) {
  try {
    // Create a response object to pass down the chain.
    // This is required for Supabase to properly set session cookies.
    const res = NextResponse.next();

    // Initialize the Supabase middleware client
    const supabase = createMiddlewareClient({ req, res });

    // Retrieve the current session. This also refreshes the auth token if it has expired.
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Middleware Session Error:", error.message);
    }

    const path = req.nextUrl.pathname;
    const isLoginRoute = path === "/admin/login";
    const isAdminRoute = path.startsWith("/admin");
    const isMaintenanceRoute = path === "/maintenance";
    const isHealthRoute = path === "/api/health";

    // Feature 1, 2, 3, 4: Maintenance Mode & Operational Route Governance
    if (MAINTENANCE_MODE) {
      // Redirect all public traffic to the maintenance page
      // Allow exceptions for maintenance page itself, admin routes (bypass), and health checks
      if (!isMaintenanceRoute && !isAdminRoute && !isHealthRoute) {
        const maintenanceUrl = req.nextUrl.clone();
        maintenanceUrl.pathname = "/maintenance";
        return NextResponse.redirect(maintenanceUrl);
      }
    } else {
      // Prevent access to the maintenance page when the system is fully operational
      if (isMaintenanceRoute) {
        const homeUrl = req.nextUrl.clone();
        homeUrl.pathname = "/";
        return NextResponse.redirect(homeUrl);
      }
    }

    // Existing Feature: Redirect unauthenticated users trying to access protected admin routes
    if (isAdminRoute && !isLoginRoute && !session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      // Preserve the original URL to redirect back after successful login
      redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Existing Feature: Prevent login redirect loops for already authenticated users
    if (isLoginRoute && session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/admin/dashboard";
      return NextResponse.redirect(redirectUrl);
    }

    // RBAC-ready architecture placeholder
    /*
    if (isAdminRoute && session) {
      const userRole = session.user.user_metadata?.role || 'user';
      const allowedRoles = ['admin', 'super_admin', 'editor'];
      
      if (!allowedRoles.includes(userRole)) {
        const unauthorizedUrl = req.nextUrl.clone();
        unauthorizedUrl.pathname = "/unauthorized";
        return NextResponse.redirect(unauthorizedUrl);
      }
    }
    */

    // Return the response object to preserve the updated cookies
    return res;
  } catch (error) {
    console.error("Middleware execution failed:", error);
    
    // Handle middleware errors gracefully by failing safely
    const path = req.nextUrl.pathname;
    if (path.startsWith("/admin") && path !== "/admin/login") {
      const fallbackUrl = req.nextUrl.clone();
      fallbackUrl.pathname = "/admin/login";
      fallbackUrl.searchParams.set("error", "middleware_failure");
      return NextResponse.redirect(fallbackUrl);
    }
    
    return NextResponse.next();
  }
}

// Export the middleware config to define which routes invoke the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any file with an extension (e.g., .svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
