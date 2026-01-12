'use client'
import React from 'react'

export default function Header() {
  return (
    <header className="w-full py-4 px-8 border-b border-zinc-800 bg-black/50 backdrop-blur-md fixed top-0 z-50 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img src="/logo-s.jpg" alt="Logo" className="w-8 h-8 rounded" />
        <span className="font-bold tracking-tighter text-xl">SOLE</span>
      </div>
      <nav className="flex gap-6 text-sm text-zinc-400">
        <button className="hover:text-white transition-colors">儀表板</button>
        <button className="hover:text-white transition-colors">任務檔案</button>
        <button className="hover:text-white transition-colors">系統設定</button>
      </nav>
    </header>
  )
}