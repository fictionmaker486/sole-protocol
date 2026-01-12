'use client'
import React, { useState } from 'react'

export default function SettingsPage() {
  const [isSecure, setIsSecure] = useState(true)

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white px-4 py-12">
      <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* 標題區 */}
        <div className="flex items-end gap-4 mb-10 border-l-4 border-zinc-500 pl-6">
          <h1 className="text-4xl font-black tracking-tighter italic">SYSTEM SETTINGS</h1>
          <span className="text-zinc-500 mb-1 text-sm tracking-widest">系統設定</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 連線狀態 */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              資料庫連線狀態
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Provider</span>
                <span className="text-zinc-300 font-mono">Supabase</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Node Status</span>
                <span className="text-green-400 font-mono">Active (200 OK)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Encryption</span>
                <span className="text-zinc-300 font-mono">AES-256-GCM</span>
              </div>
            </div>
          </div>

          {/* 安全偏好 */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4">系統偏好設定</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">嚴格安全模式</p>
                  <p className="text-xs text-zinc-500">強制執行雙重密鑰驗證</p>
                </div>
                <button 
                  onClick={() => setIsSecure(!isSecure)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isSecure ? 'bg-blue-600' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isSecure ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
              
              <div className="pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2 font-mono">BUILD_VERSION: 2.0.1-REBORN</p>
                <button className="text-xs text-red-500 hover:text-red-400 underline decoration-dotted">
                  執行系統初始化重置
                </button>
              </div>
            </div>
          </div>

          {/* 環境變數唯讀顯示 */}
          <div className="md:col-span-2 bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-2xl">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Environment Status</h2>
            <div className="bg-black p-4 rounded-lg border border-zinc-800 font-mono text-xs overflow-x-auto">
              <p className="text-blue-400">NEXT_PUBLIC_SUPABASE_URL=<span className="text-zinc-500">https://********.supabase.co</span></p>
              <p className="text-blue-400">NEXT_PUBLIC_SUPABASE_ANON_KEY=<span className="text-zinc-500">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</span></p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}