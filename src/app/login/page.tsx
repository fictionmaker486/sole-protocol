'use client'
import { useState, useEffect, useRef } from 'react' // 導入 useRef
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

// MatrixBackground 組件
const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const japanese = '日月火水木金土一二三四五六七八九十天地人' // 可以替換成其他字符集
    const fontSize = 16
    const columns = canvas.width / fontSize
    const drops: number[] = []

    for (let i = 0; i < columns; i++) {
      drops[i] = 1
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#0F0' // Matrix code green
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = japanese[Math.floor(Math.random() * japanese.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, 33)

    // 清理函數
    return () => clearInterval(interval)
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
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('存取失敗: ' + error.message)
    } else {
      router.push('/missions')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black p-4 text-white font-mono overflow-hidden">
      <MatrixBackground /> {/* 動態背景組件 */}
      
      <div className="relative z-10 w-full max-w-md border border-zinc-800 bg-zinc-900/40 p-10 rounded-3xl backdrop-blur-md shadow-2xl">
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