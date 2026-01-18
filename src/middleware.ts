import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 判斷當前路徑是否需要保護
  const isProtectedRoute = request.nextUrl.pathname === '/' || 
                          request.nextUrl.pathname.startsWith('/missions') || 
                          request.nextUrl.pathname.startsWith('/dashboard')

  // 如果使用者未登入且訪問保護路徑，則重導向
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
} // <--- 確保函數在這裡結束

// matcher 必須放在函數外面
export const config = {
  matcher: [
    '/',               // 保護首頁
    '/missions/:path*', // 保護任務列表
    '/dashboard/:path*', // 保護儀表板
  ],
}