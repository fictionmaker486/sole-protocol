'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
// 導入側邊滑出彈窗
import SubmitProofModal from './modals/SubmitProofModal'

// 定義符合 Sole 憲法的任務結構
interface Mission {
  id: string
  title: string
  description: string
  status: 'pending' | 'completed' | 'verifying'
  trustStatus: 'CORE' | 'DEVIATION' | 'RE_VALIDATION'
  successStreak: number
}

export default function MissionList() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)

  const supabase = createClient()
  const router = useRouter()

  const logEvent = async (type: string, details: string, missionId?: string) => {
    if (!user) return
    const { error } = await supabase.from('logs').insert([{
      agent_email: user.email,
      event_type: type,
      mission_id: missionId,
      details: details
    }])
    if (error) console.error('LOG_FAILURE:', error.message)
  }

  const fetchMissions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error('SYNC_FAILURE:', error.message)
    else if (data) setMissions(data as Mission[])
    setLoading(false)
  }

  useEffect(() => {
    fetchMissions()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  // 處理驗證請求：加入身分檢查與狀態檢查
  const handleVerifyRequest = (mission: Mission) => {
    if (mission.status === 'completed') return;

    // 💡 彈出提醒：若使用者未登入，阻斷後續動作
    if (!user) {
      alert('身分未驗證：請先登入 Agent 帳號以進行行為存證。🛡️');
      return;
    }

    setSelectedMission(mission);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('CONFIRM_DELETION: 確定要銷毀此任務檔案嗎？')) return
    const { error } = await supabase.from('missions').delete().eq('id', id)
    if (!error) {
      setMissions(missions.filter(m => m.id !== id))
      await logEvent('NODE_DESTROYED', '永久刪除任務節點', id)
      router.refresh()
    }
  }

  if (loading) return <p className="text-zinc-600 italic text-center py-20 font-mono animate-pulse">SYNCHRONIZING_ENCRYPTED_DATA...</p>

  return (
    <div className="w-full mt-6 space-y-4 font-sans text-zinc-100">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 px-1 border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <h2 className="text-[10px] font-bold tracking-[0.3em] text-zinc-500 uppercase">Archive System v1.3</h2>
          <p className="text-xs font-mono text-zinc-400">AGENT: {user?.email || 'OFFLINE'}</p>
        </div>
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          {missions.length} active_nodes
        </span>
      </div>

      {missions.length === 0 ? (
        <div className="text-center py-20 border border-zinc-900 rounded-lg">
          <p className="text-zinc-700 font-mono text-xs uppercase tracking-tighter">Sector empty</p>
        </div>
      ) : (
        missions.map((m) => (
          <div 
            key={m.id} 
            className={`group p-6 bg-black border transition-all duration-500 flex justify-between items-center ${
              m.status === 'completed' ? 'border-zinc-900 opacity-30' : 'border-zinc-800 hover:border-zinc-500'
            }`}
          >
            <div className="flex items-center gap-6">
              {/* 💡 修改後的按鈕：嵌套三元運算子處理三種狀態視覺 */}
              <button 
                onClick={() => handleVerifyRequest(m)}
                className={`w-28 py-2 text-[9px] font-mono font-bold border transition-all ${
                  m.status === 'completed' 
                    ? 'border-zinc-800 text-zinc-600 cursor-not-allowed' // 1. 已完成
                    : !user 
                      ? 'border-zinc-800 text-zinc-700 hover:border-zinc-600' // 2. 未登入 (變暗)
                      : 'border-zinc-700 text-zinc-400 hover:bg-white hover:text-black' // 3. 正常操作
                }`}
              >
                {m.status === 'completed' ? 'VERIFIED' : 'SUBMIT_PROOF'}
              </button>
              
              <div className="space-y-1">
                <h3 className={`text-sm tracking-tight ${m.status === "completed" ? "text-zinc-600 line-through" : "text-zinc-100"}`}>
                  {m.title}
                  {(m.trustStatus === 'RE_VALIDATION' || m.status === 'pending') && (
                    <span className="ml-3 text-[10px] font-mono text-zinc-500 animate-pulse">
                      [{m.successStreak}/3]
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono leading-relaxed max-w-md">
                  {m.description || 'NO_SUPPLEMENTARY_DATA'}
                </p>
              </div>
            </div>
            
            {user && (
              <button 
                onClick={() => handleDelete(m.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-800 hover:text-white transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))
      )}

      {/* 聯動組件 */}
      <SubmitProofModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        missionTitle={selectedMission?.title || "UNKNOWN_MISSION"}
        missionId={selectedMission?.id || ""}
        userEmail={user?.email || ""}
        successStreak={selectedMission?.successStreak || 1}
      />
    </div>
  )
}