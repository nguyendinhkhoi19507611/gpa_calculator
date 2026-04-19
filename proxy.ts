import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const publicRoutes = ['/login', '/register'];
const COOKIE_NAME = 'gpa-session';

async function verifySession(cookie: string | undefined) {
  if (!cookie) return null;
  try {
    const secretKey = process.env.SESSION_SECRET!;
    const encodedKey = new TextEncoder().encode(secretKey);
    const { payload } = await jwtVerify(cookie, encodedKey, { algorithms: ['HS256'] });
    return payload;
  } catch {
    return null;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes, static files, and common assets through
  if (pathname.startsWith('/api') || 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/favicon') ||
      pathname === '/manifest.webmanifest' ||
      pathname === '/robots.txt' ||
      pathname === '/sitemap.xml' ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.jpeg') ||
      pathname.endsWith('.svg') ||
      pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(cookie);

  // If on a public route and already logged in, redirect to dashboard
  if (publicRoutes.includes(pathname) && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If on a protected route and not logged in, redirect to login
  if (!publicRoutes.includes(pathname) && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

