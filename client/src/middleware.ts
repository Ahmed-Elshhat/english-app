import { BASE_URL } from "@/Api/Api";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("ARL")?.value;
  const pathname = request.nextUrl.pathname;

  const isAuthPage =
    pathname === "/auth/login" ||
    pathname === "/auth/signup" ||
    pathname === "/";

  if (token) {
    try {
      const res = await fetch(`${BASE_URL}/users/getOne`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.status === 200) {
        const userRole = data.user.role;

        // لو المستخدم داخل صفحة login/signup/home → حوله للـ playlists
        if (isAuthPage) {
          return NextResponse.redirect(
            `${request.nextUrl.origin}/playlists/series`
          );
        }

        // التحقق من صفحات الادمن فقط
        if (pathname.startsWith("/dashboard/users")) {
          if (userRole !== "admin") {
            return NextResponse.redirect(`${request.nextUrl.origin}/401`);
          }
        }

        // السماح فقط للـ admin أو employee بالوصول للـ dashboard أو playlists
        if (
          pathname === "/dashboard" ||
          pathname.startsWith("/dashboard/playlists")
        ) {
          if (userRole !== "admin" && userRole !== "employee") {
            return NextResponse.redirect(`${request.nextUrl.origin}/401`);
          }
        }

        // السماح فقط للـ admin للوصول للـ employees
        if (pathname.startsWith("/dashboard/employees")) {
          if (userRole !== "admin") {
            return NextResponse.redirect(`${request.nextUrl.origin}/401`);
          }
        }

        // السماح فقط للـ admin أو employee بالوصول للـ videos
        if (pathname.startsWith("/dashboard/videos")) {
          if (userRole !== "admin" && userRole !== "employee") {
            return NextResponse.redirect(`${request.nextUrl.origin}/401`);
          }
        }

        // السماح فقط للـ admin أو employee بالوصول للـ episodes
        if (pathname.startsWith("/dashboard/episodes")) {
          if (userRole !== "admin" && userRole !== "employee") {
            return NextResponse.redirect(`${request.nextUrl.origin}/401`);
          }
        }

        return NextResponse.next();
      } else {
        if (isAuthPage) return NextResponse.next();
        return NextResponse.redirect(`${request.nextUrl.origin}/auth/login`);
      }
    } catch (err) {
      console.error("Error checking token:", err);
      if (isAuthPage) return NextResponse.next();
      return NextResponse.redirect(`${request.nextUrl.origin}/auth/login`);
    }
  } else {
    // مفيش توكن
    if (isAuthPage) return NextResponse.next();
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/login`);
  }
}

export const config = {
  matcher: [
    "/",
    "/auth/login",
    "/auth/signup",
    "/dashboard/users/:path*",
    "/dashboard",
    "/dashboard/playlists/:path*",
    "/dashboard/employees/:path*",
    "/dashboard/videos/:path*",
    "/dashboard/episodes/:path*",
  ],
};
