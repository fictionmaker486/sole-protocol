'use client'
import React from 'react'
import Link from 'next/link' // 引入 Link

export default function Header() {
  return (
    <header className="w-full py-4 px-8 border-b border-zinc-800 bg-black/50 backdrop-blur-md fixed top-0 z-50 flex justify-between items-center text-white">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <img src="/logo-s.jpg" alt="Logo" className="w-8 h-8 rounded" />
        <span className="font-bold tracking-tighter text-xl">SOLE</span>
      </Link>
      
      <nav className="flex gap-6 text-sm text-zinc-400">
        <Link href="/dashboard" className="hover:text-white transition-colors">儀表板</Link>
        <Link href="/missions" className="hover:text-white transition-colors">任務檔案</Link>
        <Link href="/settings" className="hover:text-white transition-colors">系統設定</Link>
      </nav>
    </header>
  )
}