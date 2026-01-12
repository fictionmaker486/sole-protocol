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
    // 監聽身份狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
    <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-black italic text-xl tracking-tighter text-white">
          SOLE <span className="text-blue-500">PROTOCOL</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/missions" className="text-xs font-mono text-zinc-400 hover:text-white transition-colors">
            MISSIONS
          </Link>
          
          {/* 動態顯示登出按鈕 */}
          {user ? (
            <button 
              onClick={handleLogout}
              className="text-[10px] font-mono bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition-all"
            >
              TERMINATE_SESSION
            </button>
          ) : (
            <Link 
              href="/login"
              className="text-[10px] font-mono bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-all"
            >
              AUTHORIZE
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}