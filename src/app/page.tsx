export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <div className="flex flex-col items-center animate-in fade-in duration-1000">
        {/* 這裡已經修正為 .jpg */}
        <img 
          src="/logo-s.jpg" 
          alt="Sole Protocol Logo" 
          className="w-48 h-auto mb-8 shadow-2xl transition-transform hover:scale-105"
        />
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-center">
          Sole Protocol
        </h1>
        
        <div className="h-1 w-20 bg-blue-600 mb-6 rounded-full"></div>
        
        <p className="text-gray-400 text-lg md:text-xl font-medium text-center">
          重生成功 · 系統已完全恢復
        </p>
      </div>
    </main>
  );
}