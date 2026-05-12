import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

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

    // Feature 1 & 3: Redirect unauthenticated users trying to access protected admin routes
    if (isAdminRoute && !isLoginRoute && !session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/admin/login";
      // Optional: Preserve the original URL to redirect back after successful login
      redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Feature 4: Prevent login redirect loops for already authenticated users
    if (isLoginRoute && session) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/admin/dashboard";
      return NextResponse.redirect(redirectUrl);
    }

    // Feature 5: RBAC-ready architecture placeholder
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
     * Match all request paths that start with /admin
     * Protects routes like /admin/dashboard, /admin/settings, /admin/users, etc.
     */
    "/admin/:path*",
  ],
};
