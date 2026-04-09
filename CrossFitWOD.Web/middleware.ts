import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token      = request.cookies.get("wod_token")?.value;
  const hasProfile = request.cookies.get("wod_has_profile")?.value;
  const role       = request.cookies.get("wod_role")?.value;

  const publicPaths  = ["/login", "/register"];
  if (pathname === "/logout") return NextResponse.next();
  const isAdmin     = role === "admin";

  // Sin token → solo rutas públicas
  if (!token) {
    if (publicPaths.includes(pathname)) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin autenticado intentando acceder a login/register → redirigir al panel
  if (isAdmin && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Atleta sin permiso en /admin → redirigir a /workout
  if (!isAdmin && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/workout", request.url));
  }

  // Admin autenticado → acceso libre a /admin (no necesita perfil de atleta)
  if (isAdmin) return NextResponse.next();

  // --- Flujo atleta ---

  // Sin perfil → solo /setup o rutas públicas
  if (!hasProfile) {
    if (pathname === "/setup" || publicPaths.includes(pathname)) return NextResponse.next();
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  // Con perfil → no necesita estar en login/register/setup
  if (publicPaths.includes(pathname) || pathname === "/setup") {
    return NextResponse.redirect(new URL("/workout", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|otf)).*)"],
};
