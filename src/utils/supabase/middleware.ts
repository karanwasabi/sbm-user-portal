import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { PAYMENT_HANDOFF_EMAIL_COOKIE } from '@/lib/payment-handoff';
import { ASSISTED_REGISTER_COOKIE } from '@/types/register';

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/confirm',
  '/unauthorized',
  '/payment/return',
  '/unsubscribe',
];

function isPaymentCallbackRoute(pathname: string) {
  return pathname === '/api/payment/razorpay-return';
}

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isProtectedRoute(pathname: string) {
  if (pathname === '/') return true;
  return ['/subscription', '/invoices', '/profile', '/settings', '/support'].some(
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

  if (pathname === '/login') {
    const paymentEmail = request.cookies.get(PAYMENT_HANDOFF_EMAIL_COOKIE)?.value?.trim();
    const authCode = request.nextUrl.searchParams.get('code');
    if (paymentEmail && authCode) {
      const url = request.nextUrl.clone();
      url.pathname = '/register/open-payment-link';
      url.searchParams.set('email', paymentEmail);
      return NextResponse.redirect(url);
    }
  }

  const publicRoute = isPublicRoute(pathname);
  const requiresAuth = isProtectedRoute(pathname);
  const isConfirmRoute = pathname === '/auth/confirm';

  if (pathname === '/signup' || pathname.startsWith('/signup/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/register';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (pathname === '/onboarding' || pathname.startsWith('/onboarding/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/register';
    return NextResponse.redirect(url);
  }

  if (!user && requiresAuth) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = isEmailVerified(user) ? '/' : '/register';
    return NextResponse.redirect(url);
  }

  if (user && !isEmailVerified(user)) {
    const allowed =
      isConfirmRoute ||
      pathname === '/register' ||
      pathname.startsWith('/register/') ||
      pathname === '/payment/return' ||
      pathname === '/unsubscribe' ||
      pathname.startsWith('/unsubscribe/') ||
      isPaymentCallbackRoute(pathname);
    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = '/register';
      return NextResponse.redirect(url);
    }
  }

  if (!user && !publicRoute && !requiresAuth) {
    if (!isPaymentCallbackRoute(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  if (pathname === '/register/assisted') {
    supabaseResponse.cookies.set(ASSISTED_REGISTER_COOKIE, '1', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 2,
      path: '/',
    });
  }

  return supabaseResponse;
}
