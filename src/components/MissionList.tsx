'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function MissionList() {
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // 1. 抓取所有任務資料
  const fetchMissions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('抓取失敗:', error.message)
    } else if (data) {
      setMissions(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMissions()
  }, [])

  // 2. 切換任務狀態 (更新資料庫)
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    
    const { error } = await supabase
      .from('missions')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      alert('狀態更新失敗: ' + error.message)
    } else {
      // 成功後直接更新本地 State，畫面會立即反應
      setMissions(missions.map(m => 
        m.id === id ? { ...m, status: newStatus } : m
      ))
    }
  }

  // 3. 刪除任務
  const handleDelete = async (id: string) => {
    if (!confirm('確定要永久刪除此任務檔案嗎？')) return

    const { error } = await supabase
      .from('missions')
      .delete()
      .eq('id', id)

    if (error) {
      alert('刪除失敗: ' + error.message)
    } else {
      setMissions(missions.filter(m => m.id !== id))
    }
  }

  if (loading) return <p className="text-zinc-500 italic text-center py-10 font-mono">ACCESSING DATA...</p>

  return (
    <div className="w-full mt-6 space-y-4">
      <div className="flex justify-between items-center mb-2 px-1">
        <h2 className="text-xs font-black tracking-[0.2em] text-zinc-500 uppercase">Active Archives</h2>
        <span className="text-[10px] font-mono text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
          {missions.length} NODES FOUND
        </span>
      </div>

      {missions.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-600 font-mono text-sm tracking-widest">NO DATA IN STORAGE</p>
        </div>
      ) : (
        missions.map((m) => (
          <div 
            key={m.id} 
            className={`group p-5 bg-zinc-900/40 rounded-xl border transition-all duration-300 flex justify-between items-center ${
              m.status === 'completed' ? 'border-zinc-900 opacity-60' : 'border-zinc-800 hover:border-zinc-600 shadow-lg shadow-blue-900/5'
            }`}
          >
            <div className="flex items-center gap-5">
              {/* 狀態切換按鈕 */}
              <button 
                onClick={() => toggleStatus(m.id, m.status)}
                className={`w-20 py-1.5 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all border ${
                  m.status === 'completed' 
                  ? 'bg-green-500/10 text-green-500 border-green-500/40' 
                  : 'bg-blue-600/20 text-blue-400 border-blue-500/40 hover:bg-blue-600/40'
                }`}
              >
                {m.status === 'completed' ? 'Completed' : 'Processing'}
              </button>
              
              <div>
                <h3 className={`font-bold tracking-tight text-lg transition-all ${
                  m.status === 'completed' ? 'text-zinc-600 line-through' : 'text-blue-100'
                }`}>
                  {m.title}
                </h3>
                <p className="text-sm text-zinc-500 mt-0.5 font-light leading-relaxed">
                  {m.description || 'No additional data provided.'}
                </p>
              </div>
            </div>
            
            {/* 刪除按鈕 */}
            <button 
              onClick={() => handleDelete(m.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))
      )}
    </div>
  )
}