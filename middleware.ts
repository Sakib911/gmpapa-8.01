import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/:path*',
    '/profile/:path*',
    '/api/:path*'
  ]
};

export default async function middleware(req: NextRequestWithAuth) {
  // Handle API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    return response;
  }

  const token = await getToken({ req });
  const isAuth = !!token;
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin');
  const isProfilePage = req.nextUrl.pathname.startsWith('/profile');

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isAuth) {
    if (token?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Protect authenticated routes
  if (!isAuth && (isAdminPage || isProfilePage)) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    return NextResponse.redirect(
      new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
    );
  }

  // Admin access check
  if (isAdminPage && token?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}