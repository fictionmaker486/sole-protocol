export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <img 
        src="/logo-s.png" 
        alt="Sole Protocol Logo" 
        className="w-32 h-auto mb-8 shadow-2xl"
      />
      <h1 className="text-4xl font-bold tracking-tighter">
        Sole Protocol 重生成功
      </h1>
      <p className="mt-4 text-gray-400">所有路徑錯誤已徹底修復</p>
    </main>
  );
}