import { auth } from "./auth";

export default auth((req) => {
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");
  const isAuthUser = !!req.auth;

  if (isLoginPage) {
    if (isAuthUser) {
      return Response.redirect(new URL("/", req.url));
    }

    return null;
  }

  if (!isAuthUser) {
    return Response.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/", "/editor/:path*", "/login"],
};
