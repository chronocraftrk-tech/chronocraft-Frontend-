import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;
    const pathname = req.nextUrl.pathname;

    // Account/orders — require customer auth, redirect cleanly without callbackUrl
    if (pathname.startsWith('/account') || pathname.startsWith('/orders')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    // Admin routes — require admin or superadmin
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
      if (!token || (token.role !== 'admin' && token.role !== 'superadmin')) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }

    // SuperAdmin routes — require superadmin only
    if (pathname.startsWith('/superadmin') && !pathname.startsWith('/superadmin/login')) {
      if (!token || token.role !== 'superadmin') {
        return NextResponse.redirect(new URL('/superadmin/login', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Always return true so withAuth never appends ?callbackUrl automatically
      authorized() {
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
