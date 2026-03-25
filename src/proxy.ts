import { type NextRequest, NextResponse } from "next/server";
import { PROTECTED_ROUTES } from "./constants/routes";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const { auth } = await import("./services/auth");

  if (Object.values(PROTECTED_ROUTES).some(({ path }) => path.test(pathname))) {
    const session = await auth();
    if (!session) {
      const authUrl = new URL("/api/auth", req.url);
      authUrl.searchParams.set("callbackUrl", req.url);
      return NextResponse.redirect(authUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|error|_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z]+$).*)"],
};
