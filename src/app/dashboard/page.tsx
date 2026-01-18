'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, completed: 0, logs: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchDashboardData() {
      // 同時抓取任務數據與操作日誌
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white font-mono">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-blue-400">正在同步系統指標...</p>
      </div>
    )
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-6 pt-24 font-mono">
      <div className="w-full max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black italic tracking-tighter text-blue-400 uppercase">System_Analytics</h1>
          <p className="mt-2 text-zinc-500 text-xs tracking-[0.3em]">SOLE PROTOCOL 運作數據總覽</p>
        </div>

        {/* 統計卡片區域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl backdrop-blur-md">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">總存檔節點</p>
            <h2 className="text-5xl font-bold tracking-tighter">{stats.total}</h2>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl backdrop-blur-md border-b-green-500/50">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">任務達成率</p>
            <h2 className="text-5xl font-bold tracking-tighter text-green-500">{completionRate}%</h2>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl backdrop-blur-md border-b-blue-500/50">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">累計審計紀錄</p>
            <h2 className="text-5xl font-bold tracking-tighter text-blue-400">{stats.logs}</h2>
          </div>
        </div>

        {/* 視覺進度條 */}
        <div className="bg-zinc-900/20 border border-zinc-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest">系統解密進度</span>
            <span className="text-[10px] text-blue-500 font-bold">{completionRate}/100</span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-600 to-green-500 h-full transition-all duration-1000 ease-out"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          {/* 裝飾性背景文字 */}
          <div className="mt-6 opacity-20 text-[8px] leading-tight text-zinc-600 select-none">
            {`>> EXEC_LOG: MISSION_COUNT(${stats.total}) | LOG_SYNC_COMPLETE | ENCRYPTION_STABLE_V15`}
          </div>
        </div>
      </div>
    </div>
  )
}