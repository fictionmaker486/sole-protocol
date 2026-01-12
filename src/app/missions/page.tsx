'use client'
import MissionList from '@/components/MissionList'
import CreateMissionModal from '@/components/CreateMissionModal'
import { useState } from 'react'

export default function MissionsPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  // 當新任務建立後，改變 key 讓 MissionList 強制重新抓取資料
  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white px-4 py-12">
      <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="flex items-end gap-4 mb-10 border-l-4 border-blue-600 pl-6">
          <h1 className="text-4xl font-black tracking-tighter italic">MISSION ARCHIVES</h1>
          <span className="text-zinc-500 mb-1 text-sm tracking-widest">任務檔案庫</span>
        </div>

        {/* 新增任務按鈕與彈窗 */}
        <CreateMissionModal onMissionCreated={handleRefresh} />

        <div className="w-full">
          <MissionList key={refreshKey} />
        </div>
      </div>
    </div>
  )
}