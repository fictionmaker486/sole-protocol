'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, completed: 0, logs: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchDashboardData() {
      const [missionsRes, logsRes] = await Promise.all([
        supabase.from('missions').select('*'),
        supabase.from('logs').select('*', { count: 'exact' })
      ])
      if (missionsRes.data) {
        const completed = missionsRes.data.filter(m => m.status === 'completed').length
        setStats({
          total: missionsRes.data.length,
          completed: completed,
          logs: logsRes.data?.length || 0
        })
      }
      setLoading(false)
    }
    fetchDashboardData()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-blue-500 font-mono">
      <div className="animate-pulse mb-4">INITIALIZING_SYSTEM_ANALYTICS...</div>
      <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 animate-progress"></div>
      </div>
    </div>
  )

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24 font-mono">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black italic tracking-tighter text-blue-500 uppercase">System_Analytics</h1>
          <p className="mt-2 text-zinc-500 text-[10px] tracking-[0.4em]">SOLE PROTOCOL 運作數據總覽</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl backdrop-blur-md border-t-blue-500/20 shadow-2xl">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-4">總存檔節點</p>
            <h2 className="text-6xl font-black tracking-tighter italic">{stats.total}</h2>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl backdrop-blur-md border-t-green-500/20 shadow-2xl">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-4">任務達成率</p>
            <h2 className="text-6xl font-black tracking-tighter italic text-green-500">{completionRate}%</h2>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl backdrop-blur-md border-t-zinc-500/20 shadow-2xl">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-4">累計審計紀錄</p>
            <h2 className="text-6xl font-black tracking-tighter italic text-blue-400">{stats.logs}</h2>
          </div>
        </div>

        <div className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest">系統解密進度匯報</span>
            <span className="text-[10px] text-blue-500 font-bold">{completionRate} / 100</span>
          </div>
          <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-600 via-blue-400 to-green-500 h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.5)]"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          <div className="mt-8 opacity-20 text-[9px] leading-relaxed text-zinc-500 font-mono select-none">
            {`>> NODE_COUNT: ${stats.total} | STATUS: OPERATIONAL | ENCRYPTION: ACTIVE | LOG_SYNC: SUCCESS`}
          </div>
        </div>
      </div>
    </div>
  )
}