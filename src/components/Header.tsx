'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // 1. 初始化檢查當前用戶
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // 2. 監聽身份狀態的即時變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800 h-16">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="font-black italic text-xl tracking-tighter text-white">
          SOLE <span className="text-blue-500 font-bold">PROTOCOL</span>
        </Link>

        <nav className="flex items-center gap-8">
          <Link href="/missions" className="text-[10px] font-mono tracking-widest text-zinc-400 hover:text-white transition-all uppercase">
            Mission_Archives
          </Link>
          
          {/* 根據 user 狀態動態顯示按鈕 */}
          {user ? (
            <button 
              onClick={handleLogout}
              className="text-[9px] font-black font-mono bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded uppercase hover:bg-red-500 hover:text-white transition-all tracking-tighter"
            >
              Terminate_Session
            </button>
          ) : (
            <Link 
              href="/login"
              className="text-[9px] font-black font-mono bg-blue-600 text-white px-4 py-1.5 rounded uppercase hover:bg-blue-700 transition-all tracking-tighter"
            >
              Authorize_Access
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}