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
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

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

        <nav className="flex items-center gap-4 md:gap-8">
          {user && (
            <>
              <Link href="/dashboard" className="text-[10px] font-mono tracking-widest text-zinc-400 hover:text-blue-400 transition-all uppercase">
                Dashboard
              </Link>
              <Link href="/logs" className="text-[10px] font-mono tracking-widest text-zinc-400 hover:text-blue-400 transition-all uppercase">
                Audit_Logs
              </Link>
            </>
          )}

          <Link href="/missions" className="text-[10px] font-mono tracking-widest text-zinc-400 hover:text-white transition-all uppercase">
            Missions
          </Link>
          
          {user ? (
            <button 
              onClick={handleLogout}
              className="text-[9px] font-black font-mono bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded uppercase hover:bg-red-500 hover:text-white transition-all tracking-tighter"
            >
              Terminate
            </button>
          ) : (
            <Link 
              href="/login"
              className="text-[9px] font-black font-mono bg-blue-600 text-white px-4 py-1.5 rounded uppercase hover:bg-blue-700 transition-all tracking-tighter"
            >
              Authorize
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}