import _ from 'lodash';
import { NextRequest, NextResponse } from 'next/server';
import { ROUTES } from '@/constants/routes';

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const refreshToken = req.cookies.get('refreshToken');
  const isAuthenticated = !_.isEmpty(refreshToken?.value || '');

  if (path === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(ROUTES.board.list, req.url));
    }
    return NextResponse.redirect(new URL(ROUTES.auth.signIn, req.url));
  }

  if (isAuthenticated && Object.values(ROUTES.auth).includes(path)) {
    return NextResponse.redirect(new URL(ROUTES.board.list, req.url));
  }

  if (!isAuthenticated && !Object.values(ROUTES.auth).includes(path)) {
    return NextResponse.redirect(new URL(ROUTES.auth.signIn, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
