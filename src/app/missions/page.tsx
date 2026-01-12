import MissionList from '@/components/MissionList'

export default function MissionsPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white px-4 py-12">
      <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* 頁面標題區 */}
        <div className="flex items-end gap-4 mb-10 border-l-4 border-blue-600 pl-6">
          <h1 className="text-4xl font-black tracking-tighter italic">MISSION ARCHIVES</h1>
          <span className="text-zinc-500 mb-1 text-sm tracking-widest">任務檔案庫</span>
        </div>

        {/* 功能說明卡片 */}
        <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-lg mb-8 text-sm text-zinc-400">
          <p>⚠️ 正在存取加密數據節點... 權限驗證通過。此處列出所有從 Supabase 節點同步的實時任務。</p>
        </div>

        {/* 任務清單主體 */}
        <div className="w-full">
          <MissionList />
        </div>
      </div>
    </div>
  )
}