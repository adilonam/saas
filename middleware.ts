import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authPages = ["/signin", "/signup"];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (authPages.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/signin", "/signin/:path*", "/signup", "/signup/:path*"],
};
