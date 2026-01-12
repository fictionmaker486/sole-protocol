'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function MissionList() {
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // 封裝抓取資料的邏輯，方便重複呼叫
  const fetchMissions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setMissions(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchMissions()
  }, [])

  // 刪除功能
  const handleDelete = async (id: string) => {
    if (!confirm('確定要永久刪除此任務檔案嗎？')) return

    const { error } = await supabase
      .from('missions')
      .delete()
      .eq('id', id)

    if (error) {
      alert('刪除失敗: ' + error.message)
    } else {
      // 刪除成功後，直接更新本地狀態，速度更快
      setMissions(missions.filter(m => m.id !== id))
    }
  }

  return (
    <div className="w-full mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-zinc-300">當前任務檔案</h2>
        <span className="text-xs text-zinc-500 font-mono">COUNT: {missions.length}</span>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <p className="text-gray-500 italic text-center py-10">讀取中...</p>
        ) : missions.length === 0 ? (
          <p className="text-gray-500 italic text-center py-10 border border-dashed border-zinc-800 rounded-xl">尚無任務，系統待命中...</p>
        ) : (
          missions.map((m) => (
            <div key={m.id} className="group p-5 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-all flex justify-between items-start">
              <div>
                <h3 className="font-bold text-blue-400 text-lg mb-1">{m.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{m.description}</p>
              </div>
              
              {/* 刪除按鈕 */}
              <button 
                onClick={() => handleDelete(m.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                title="刪除任務"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}