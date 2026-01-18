'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchLogs() {
      // 從 Supabase 抓取日誌紀錄
      const { data } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (data) setLogs(data)
      setLoading(false)
    }
    fetchLogs()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-blue-500 font-mono">
      RETRIEVING_SECURITY_LOGS...
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24 font-mono">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-3xl font-black italic text-blue-500 uppercase">Audit_Logs</h1>
            <p className="text-zinc-500 text-[10px] tracking-widest mt-1">系統安全性行為審計紀錄</p>
          </div>
          <div className="text-[10px] text-zinc-600">
            TOTAL_ENTRIES: {logs.length}
          </div>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-800/50 text-zinc-500 uppercase tracking-widest">
              <tr>
                <th className="p-4 border-r border-zinc-800/50">Timestamp</th>
                <th className="p-4 border-r border-zinc-800/50">Agent_ID</th>
                <th className="p-4 border-r border-zinc-800/50">Event_Type</th>
                <th className="p-4">Operational_Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-blue-500/5 transition-colors group">
                  <td className="p-4 text-zinc-500 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                    {log.agent_email}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      log.event_type.includes('DELETED') 
                      ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                      : 'bg-green-500/10 text-green-500 border border-green-500/20'
                    }`}>
                      {log.event_type}
                    </span>
                  </td>
                  <td className="p-4 italic text-zinc-400">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="p-20 text-center text-zinc-600 uppercase tracking-widest animate-pulse">
              No historical data in archives.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}