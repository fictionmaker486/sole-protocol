'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function MissionList() {
  const [missions, setMissions] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchMissions = async () => {
      const { data, error } = await supabase
        .from('missions') // 這裡請確認你的資料表名稱是否為 missions
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setMissions(data)
    }
    fetchMissions()
  }, [])

  return (
    <div className="w-full max-w-2xl mt-10">
      <h2 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-2">當前任務任務列表</h2>
      <div className="space-y-3">
        {missions.length === 0 ? (
          <p className="text-gray-500 italic text-center py-10">尚無任務，或是正在連線資料庫...</p>
        ) : (
          missions.map((m) => (
            <div key={m.id} className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-blue-500 transition-colors">
              <h3 className="font-bold text-blue-400">{m.title}</h3>
              <p className="text-sm text-gray-400 mt-1">{m.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}