import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Crear una respuesta inicial
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Crear el cliente de Supabase para el Servidor
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Actualiza la cookie en la solicitud
          request.cookies.set({ name, value, ...options })
          // Actualiza la cookie en la respuesta
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // Borra la cookie en la solicitud
          request.cookies.set({ name, value: '', ...options })
          // Borra la cookie en la respuesta
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 3. Verificar sesión (getUser es más seguro que getSession en middleware)
  const { data: { user } } = await supabase.auth.getUser()

  // 4. LOGICA DE PROTECCIÓN DE RUTAS

  // A. Si intenta entrar a cualquier ruta que empiece por /admin...
  if (request.nextUrl.pathname.startsWith('/admin')) {

    // ...y NO es la página de login...
    if (request.nextUrl.pathname !== '/admin/login') {
      // ...y NO tiene usuario --> LO MANDAMOS AL LOGIN
      if (!user) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }

    // B. Si YA tiene usuario e intenta entrar al LOGIN --> LO MANDAMOS AL DASHBOARD
    if (request.nextUrl.pathname === '/admin/login' && user) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  // Aquí definimos en qué rutas se ejecuta este middleware
  matcher: ['/admin/:path*'],
}