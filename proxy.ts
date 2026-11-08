import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isFigmaView = request.nextUrl.searchParams.get('view') === 'figma' || request.nextUrl.searchParams.get('view') === 'figma-canvas';

  // Always allow static files, Next internals, icons, auth routes, and explicit Figma Canvas reviews
  if (
    path.startsWith('/_next') ||
    path.startsWith('/assets') ||
    path.startsWith('/favicon') ||
    path === '/parent-login' ||
    path === '/parent-signup' ||
    path === '/admin-login' ||
    isFigmaView
  ) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get('hartwell_session')?.value;

  // Optimistic validation of token existence and basic shape
  const hasSession = Boolean(sessionToken && sessionToken.includes('.'));

  // If user visits root '/' while authenticated, redirect to appropriate role target or let page handle it
  if (!hasSession && path === '/') {
    // If user has not signed in, take them to the production login page
    return NextResponse.redirect(new URL('/parent-login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
