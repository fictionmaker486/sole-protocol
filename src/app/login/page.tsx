'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('存取失敗: ' + error.message)
    } else {
      // 成功後引導至主控台
      router.push('/missions')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 text-white font-mono">
      <div className="w-full max-w-md border border-zinc-800 bg-zinc-900/40 p-10 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">Sole Authorization</h1>
          <p className="text-blue-500 text-[10px] mt-2 uppercase tracking-[0.4em] animate-pulse">Waiting for credentials...</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="email" required placeholder="AGENT_EMAIL"
            className="w-full bg-black/60 border border-zinc-800 p-4 rounded-xl focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" required placeholder="ACCESS_KEY"
            className="w-full bg-black/60 border border-zinc-800 p-4 rounded-xl focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white font-bold rounded-xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)]"
          >
            {loading ? 'AUTHENTICATING...' : 'AUTHORIZE ACCESS'}
          </button>
        </form>
      </div>
    </div>
  )
}