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
    
    // 使用您在 Supabase 建立的 5 個帳號之一進行登入
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('授權失敗: ' + error.message)
    } else {
      router.push('/missions')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 text-white font-mono">
      <div className="w-full max-w-md border border-zinc-800 bg-zinc-900/50 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-block p-3 bg-blue-600/10 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tighter italic">SOLE PROTOCOL ACCESS</h1>
          <p className="text-zinc-500 text-[10px] mt-2 uppercase tracking-[0.3em]">身份識別驗證中</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] text-zinc-500 mb-2 uppercase tracking-widest">Agent Identity</label>
            <input 
              type="email" required 
              className="w-full bg-black/50 border border-zinc-800 p-3 rounded-lg text-white focus:border-blue-500 outline-none transition-all placeholder:text-zinc-800"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="AGENT@ID.COM"
            />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 mb-2 uppercase tracking-widest">Access Key</label>
            <input 
              type="password" required 
              className="w-full bg-black/50 border border-zinc-800 p-3 rounded-lg text-white focus:border-blue-500 outline-none transition-all placeholder:text-zinc-800"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button 
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] uppercase tracking-widest text-xs"
          >
            {loading ? 'Decrypting...' : 'Authorize Login'}
          </button>
        </form>
      </div>
    </div>
  )
}