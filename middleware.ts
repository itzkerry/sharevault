import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // Redirect users here if they aren't signed in
  },
});

// The "matcher" determines which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - login (the sign-in page)
     * - api (API routes, unless you want to protect those too)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.svg (your website logo)
     */
    "/((?!login|api|_next/static|_next/image|favicon.ico|logo.svg).*)",
  ],
};
