import MissionList from '@/components/MissionList'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <div className="flex flex-col items-center animate-in fade-in duration-1000 w-full max-w-4xl">
        
        {/* Logo 區塊 */}
        <div className="mb-8">
          <img 
            src="/logo-s.jpg" 
            alt="Sole Protocol Logo" 
            className="w-48 h-auto shadow-2xl transition-transform hover:scale-105"
          />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-center italic">
          SOLE PROTOCOL
        </h1>

        <div className="h-1 w-20 bg-blue-600 mb-10 rounded-full"></div>
        
        {/* 任務列表組件容器 */}
        <div className="w-full bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800 shadow-xl">
          <MissionList />
        </div>

        <p className="mt-12 text-zinc-500 text-sm">
          系統已連結至 Supabase 資料庫
        </p>
      </div>
    </main>
  )
}