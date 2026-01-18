'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

// MatrixBackground 組件 - 負責酷炫的綠色代碼雨背景
const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const characters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ' 
    const fontSize = 16
    const columns = canvas.width / fontSize
    const drops: number[] = []

    for (let i = 0; i < columns; i++) {
      drops[i] = 1
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#0F0' // 經典矩陣綠
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, 33)
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0" 
      style={{ pointerEvents: 'none' }} 
    />
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // 執行登入
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('授權失敗: ' + error.message)
      setLoading(false)
    } else {
      // 關鍵修正：先刷新身分狀態，再重導向至 Dashboard
      await router.refresh()
      router.push('/dashboard')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black p-4 text-white font-mono overflow-hidden">
      <MatrixBackground />
      
      {/* 登入表單容器 */}
      <div className="relative z-10 w-full max-w-md border border-zinc-800 bg-zinc-900/60 p-10 rounded-3xl backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-10">
          <div className="inline-block p-3 bg-blue-500/10 rounded-full mb-4 border border-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">Sole Authorization</h1>
          <p className="text-blue-500 text-[10px] mt-2 uppercase tracking-[0.4em] animate-pulse">Waiting for credentials...</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] text-zinc-500 mb-2 uppercase tracking-widest ml-1">Agent Identity</label>
            <input 
              type="email" required placeholder="AGENT@PROTOCOL.COM"
              className="w-full bg-black/40 border border-zinc-800 p-4 rounded-xl focus:border-blue-500 outline-none transition-all placeholder:text-zinc-800 text-white"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 mb-2 uppercase tracking-widest ml-1">Access Key</label>
            <input 
              type="password" required placeholder="••••••••"
              className="w-full bg-black/40 border border-zinc-800 p-4 rounded-xl focus:border-blue-500 outline-none transition-all placeholder:text-zinc-800 text-white"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white font-black rounded-xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] uppercase tracking-widest text-sm"
          >
            {loading ? 'Verifying...' : 'Authorize Access'}
          </button>
        </form>
      </div>
    </div>
  )
}