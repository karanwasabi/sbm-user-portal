import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { hasProduct, parseAccessTokenClaims, PRODUCT_MEMBER_PORTAL } from '@/lib/access';

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/unauthorized'];

function isProtectedRoute(pathname: string) {
  if (pathname === '/') return true;
  return ['/subscription', '/invoices', '/profile'].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
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
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const requiresAuth = isProtectedRoute(pathname);

  if (!user && requiresAuth) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (user && requiresAuth && pathname !== '/unauthorized') {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const { products } = parseAccessTokenClaims(session?.access_token);
    if (products.length > 0 && !hasProduct(products, PRODUCT_MEMBER_PORTAL)) {
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      return NextResponse.redirect(url);
    }
  }

  // Allow authenticated users to remain on /signup while finishing registration (step 1 creates the session).

  if (!user && !isPublicRoute && !requiresAuth) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
