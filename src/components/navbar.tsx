'use client'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login') // 登出後導向登入頁面
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800 p-4 shadow-lg shadow-blue-900/10">
      <div className="container mx-auto flex justify-between items-center text-white">
        <Link href="/" className="flex items-center space-x-2 text-xl font-bold italic tracking-wider">
          <span className="text-blue-500 text-3xl">S</span>OLE
        </Link>
        <div className="flex space-x-6 items-center">
          <Link href="/missions" className="text-zinc-400 hover:text-blue-400 transition-colors tracking-wider text-sm">
            任務檔案
          </Link>
          <Link href="/dashboard" className="text-zinc-400 hover:text-blue-400 transition-colors tracking-wider text-sm">
            系統總覽
          </Link>
          {user ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all shadow-md"
            >
              終止連線
            </button>
          ) : (
            <Link href="/login" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-md">
              啟動系統
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}