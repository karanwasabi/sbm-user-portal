import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password', '/unauthorized'];
const ONBOARDING_ROUTE = '/onboarding';

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isProtectedRoute(pathname: string) {
  if (pathname === '/') return true;
  return ['/subscription', '/invoices', '/profile'].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isEmailVerified(user: { email_confirmed_at?: string | null }) {
  return Boolean(user.email_confirmed_at);
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const publicRoute = isPublicRoute(pathname);
  const requiresAuth = isProtectedRoute(pathname);
  const isVerifyRoute = pathname.startsWith('/signup/verify');
  const isOnboardingRoute = pathname === ONBOARDING_ROUTE || pathname.startsWith(`${ONBOARDING_ROUTE}/`);

  if (!user && requiresAuth) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && pathname === '/login') {
    const url = request.nextUrl.clone();
    if (!isEmailVerified(user)) {
      url.pathname = '/signup/verify';
    } else {
      url.pathname = ONBOARDING_ROUTE;
    }
    return NextResponse.redirect(url);
  }

  if (user && !isEmailVerified(user)) {
    const allowed = isVerifyRoute || pathname === '/signup' || pathname.startsWith('/signup/');
    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = '/signup/verify';
      return NextResponse.redirect(url);
    }
  }

  if (user && isEmailVerified(user)) {
    if (pathname.startsWith('/signup')) {
      const url = request.nextUrl.clone();
      url.pathname = ONBOARDING_ROUTE;
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  if (user && isEmailVerified(user) && requiresAuth && !isOnboardingRoute) {
    // Onboarding completion is enforced in the portal layout (needs profile API).
  }

  if (!user && !publicRoute && !requiresAuth && !isOnboardingRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (!user && isOnboardingRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
