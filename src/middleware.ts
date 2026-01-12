import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from './lib/i18n-config'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. 檢查路徑是否已經包含語系 (en 或 zh-TW)
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // 2. 如果路徑沒有語系，則執行重定向 (Redirect)
  if (pathnameIsMissingLocale) {
    // 預設重定向到 zh-TW
    return NextResponse.redirect(
      new URL(`/${i18n.defaultLocale}${pathname}`, request.url)
    )
  }
}

export const config = {
  // 比對所有路徑，但排除靜態檔案 (圖片、favicon 等)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}