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
      alert('授權失敗: ' + error.message)
    } else {
      // 登入成功後跳轉回任務檔案頁面
      router.push('/missions')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 text-white">
      <div className="w-full max-w-md border border-zinc-800 bg-zinc-900/50 p-8 rounded-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black italic tracking-tighter">SOLE AUTHENTICATION</h1>
          <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest font-mono">系統存取驗證</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs text-zinc-500 mb-2 uppercase font-mono tracking-widest">Identify (Email)</label>
            <input 
              type="email" required 
              className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-white focus:border-blue-500 outline-none transition-all font-mono"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="YOUR_ID@EXAMPLE.COM"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-2 uppercase font-mono tracking-widest">Access Key (Password)</label>
            <input 
              type="password" required 
              className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-white focus:border-blue-500 outline-none transition-all font-mono"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button 
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-lg transition-all shadow-[0_0_25px_rgba(37,99,235,0.3)] uppercase tracking-widest italic"
          >
            {loading ? 'Verifying...' : 'Authorize Login'}
          </button>
        </form>
      </div>
    </div>
  )
}