'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function CreateMissionModal({ onMissionCreated }: { onMissionCreated: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    // 1. 獲取當前登入的使用者資訊
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('請先登入特工帳號')
      setLoading(false)
      return
    }

    // 2. 寫入任務，並帶入 agent_id
    const { error } = await supabase
      .from('missions')
      .insert([
        { 
          title, 
          description, 
          agent_id: user.id // <--- 關鍵修正：將任務關聯到當前特工
        }
      ])

    if (error) {
      alert('部署失敗: ' + error.message)
    } else {
      setTitle('')
      setDescription('')
      setIsOpen(false)
      onMissionCreated() // 通知列表刷新
    }
    setLoading(false)
  }

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="mb-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
    >
      + 啟動新任務
    </button>
  )

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
        <h2 className="text-2xl font-black italic mb-6 text-blue-400 uppercase tracking-tighter">New Mission Data</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 uppercase mb-2">任務代號</label>
            <input 
              required
              className="w-full bg-black border border-zinc-800 p-3 rounded-lg focus:border-blue-500 outline-none transition-colors text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="輸入任務名稱..."
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 uppercase mb-2">任務簡報</label>
            <textarea 
              className="w-full bg-black border border-zinc-800 p-3 rounded-lg focus:border-blue-500 outline-none h-24 transition-colors text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="輸入任務細節..."
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 border border-zinc-800 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400"
            >
              取消
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-bold transition-colors text-white"
            >
              {loading ? '寫入中...' : '確認部署'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}