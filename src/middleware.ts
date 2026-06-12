import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // Definir las páginas públicas
  const publicPages = ['/', '/registro', '/login', '/403', '/404'];

  // Si es una página pública, permitir acceso
  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }

  // Definir si es una ruta de API
  const isApiRoute = pathname.startsWith('/api/');

  // Si no hay token, manejar según tipo de ruta
  if (!token) {
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/cliente-espera') ||
      pathname.startsWith('/cliente') ||
      pathname.startsWith('/entrenador') ||
      pathname.startsWith('/api/cliente') ||
      pathname.startsWith('/api/entrenador') ||
      pathname.startsWith('/api/admin') ||
      pathname.startsWith('/api/cliente-espera')
    ) {

      if (isApiRoute) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }

      return NextResponse.redirect(new URL('/login', req.url));
    }
    // Para otras rutas, permitir acceso
    return NextResponse.next();
  }

  // Protecciones por rol
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/historial')
  ) {
    if (token.rol !== 'ADMIN') {
      return isApiRoute
        ? NextResponse.json({ error: 'Prohibido' }, { status: 403 })
        : NextResponse.redirect(new URL('/403', req.url));
    }
  } else if (
    pathname.startsWith('/cliente-espera') ||
    pathname.startsWith('/api/cliente-espera') ||
    pathname.startsWith('/api/historial')
  ) {
    if (token.rol !== 'CLIENTEESPERA') {
      return isApiRoute
        ? NextResponse.json({ error: 'Prohibido' }, { status: 403 })
        : NextResponse.redirect(new URL('/403', req.url));
    }
  } else if (
    pathname.startsWith('/cliente') ||
    pathname.startsWith('/api/cliente') ||
    pathname.startsWith('/api/historial')
  ) {
    // Permitir 'CLIENTE', 'ENTRENADOR' y 'ADMIN' para acceder a '/api/cliente/*'
    if (
      token.rol !== 'CLIENTE' &&
      token.rol !== 'ENTRENADOR' &&
      token.rol !== 'ADMIN'
    ) {
      return isApiRoute
        ? NextResponse.json({ error: 'Prohibido' }, { status: 403 })
        : NextResponse.redirect(new URL('/403', req.url));
    }
  } else if (
    pathname.startsWith('/entrenador') ||
    pathname.startsWith('/api/entrenador') ||
    pathname.startsWith('/api/cliente/:path*')
  ) {
    if (token.rol !== 'ENTRENADOR') {
      return isApiRoute
        ? NextResponse.json({ error: 'Prohibido' }, { status: 403 })
        : NextResponse.redirect(new URL('/403', req.url));
    }
  }

  // Si el usuario tiene el rol adecuado o la ruta no está protegida, continuar
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/cliente/:path*',
    '/api/entrenador/:path*',
    '/api/cliente-espera/:path*',
    '/api/historial/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
