'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function MissionList() {
  const [missions, setMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  // 1. 自動寫入活動紀錄 (Logs) 到 Supabase
  const logEvent = async (type: string, details: string, missionId?: string) => {
    if (!user) return
    
    // 根據 image_6ce46c.png 確認欄位名為 agent_email, event_type, mission_id, details
    const { error } = await supabase.from('logs').insert([{
      agent_email: user.email,
      event_type: type,
      mission_id: missionId,
      details: details
    }])
    
    if (error) {
      console.error('日誌寫入失敗:', error.message)
    } else {
      console.log('日誌寫入成功')
    }
  }

  // 2. 抓取任務資料
  const fetchMissions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('抓取任務失敗:', error.message)
    } else if (data) {
      setMissions(data)
    }
    setLoading(false)
  }

  // 3. 系統初始化與身分檢查
  useEffect(() => {
    fetchMissions()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  // 4. 切換任務狀態 (Update) 並記錄日誌
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    
    // 執行更新
    const { error } = await supabase
      .from('missions')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error) {
      // 本地狀態更新以提供即時反饋
      setMissions(missions.map(m => m.id === id ? { ...m, status: newStatus } : m))
      
      // 觸發日誌紀錄
      await logEvent('STATUS_UPDATED', `變更狀態為 ${newStatus}`, id)
      
      // 強制刷新以同步 Dashboard 數據
      router.refresh()
    } else {
      alert('更新失敗，請檢查權限設定 (RLS)。')
      console.error(error.message)
    }
  }

  // 5. 刪除任務 (Delete) 並記錄日誌
  const handleDelete = async (id: string) => {
    if (!confirm('CONFIRM DELETION: 確定要銷毀此任務檔案嗎？')) return
    
    const { error } = await supabase.from('missions').delete().eq('id', id)
    
    if (!error) {
      setMissions(missions.filter(m => m.id !== id))
      await logEvent('MISSION_DELETED', `永久刪除任務節點`, id)
      router.refresh()
    } else {
      alert('刪除失敗：' + error.message)
    }
  }

  // 6. 登出邏輯
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) return <p className="text-zinc-500 italic text-center py-10 font-mono animate-pulse">SYNCHRONIZING_ENCRYPTED_DATA...</p>

  return (
    <div className="w-full mt-6 space-y-4">
      {/* 頁面頭部 */}
      <div className="flex justify-between items-center mb-6 px-1">
        <div>
          <h2 className="text-xs font-black tracking-[0.2em] text-zinc-500 uppercase">Mission Archives</h2>
          <p className="text-[10px] text-blue-500/60 font-mono">AGENT_ID: {user?.email || 'OFFLINE'}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            {missions.length} NODES FOUND
          </span>
          {user && (
            <button 
              onClick={handleLogout}
              className="text-[10px] border border-red-900/40 text-red-500/70 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition-all font-mono uppercase tracking-tighter"
            >
              Terminate
            </button>
          )}
        </div>
      </div>

      {/* 任務列表渲染 */}
      {missions.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-600 font-mono text-sm tracking-widest uppercase opacity-50">No active nodes in this sector</p>
        </div>
      ) : (
        missions.map((m) => (
          <div 
            key={m.id} 
            className={`group p-5 bg-zinc-900/30 rounded-xl border transition-all duration-300 flex justify-between items-center backdrop-blur-sm ${
              m.status === 'completed' ? 'border-zinc-900/50 opacity-40' : 'border-zinc-800 hover:border-blue-500/30 shadow-2xl shadow-blue-500/5'
            }`}
          >
            <div className="flex items-center gap-5">
              <button 
                onClick={() => toggleStatus(m.id, m.status)}
                className={`w-24 py-1.5 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all border ${
                  m.status === 'completed' 
                  ? 'bg-green-500/10 text-green-500 border-green-500/30 cursor-default' 
                  : 'bg-blue-600/10 text-blue-400 border-blue-500/30 hover:bg-blue-600/20 hover:text-blue-300'
                }`}
              >
                {m.status === 'completed' ? 'COMPLETED' : 'PROCESSING'}
              </button>
              
              <div>
                <h3 className={`font-bold tracking-tight text-lg transition-all ${
                  m.status === 'completed' ? 'text-zinc-600 line-through' : 'text-zinc-100'
                }`}>
                  {m.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-1 font-mono tracking-tight uppercase opacity-80">
                  {m.description || 'No supplementary data found.'}
                </p>
              </div>
            </div>
            
            {/* 刪除按鈕 */}
            {user && (
              <button 
                onClick={() => handleDelete(m.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-700 hover:text-red-500 transition-all duration-200"
                title="Destroy Mission Node"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )
}