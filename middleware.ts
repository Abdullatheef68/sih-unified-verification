export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/owner/:path*", "/officer/:path*", "/admin/:path*", "/dashboard"],
}
