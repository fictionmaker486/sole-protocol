"use client";

import { useEffect, useState } from 'react';
// 在 MissionList.tsx 的第 5 行修改
// 確保指向正確的資料庫客戶端位置
import { supabase } from '../supabaseClient';

interface MissionListProps {
  agentId?: string;
  dict: any;
}

export default function MissionList({ agentId, dict }: MissionListProps) {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (agentId) {
      fetchMissions();
    }
  }, [agentId]);

  async function fetchMissions() {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('agent_id', agentId);

    if (!error) setMissions(data || []);
    setLoading(false);
  }

  async function updateMission(missionId: string) {
    const { error: missionError } = await supabase
      .from('missions')
      .update({ status: 'COMPLETED' })
      .eq('id', missionId);

    if (missionError) {
      alert("任務更新失敗: " + missionError.message);
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('credibility_score')
      .eq('id', agentId)
      .single();

    if (profileData) {
      const newScore = Math.min((profileData.credibility_score || 0) + 10, 100);
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ credibility_score: newScore })
        .eq('id', agentId);

      if (profileError) {
        console.error("分數更新失敗:", profileError.message);
      } else {
        alert(`任務回報成功！特務信譽分數已提升至 ${newScore}！`);
        window.location.reload(); 
      }
    }
  }

  if (loading) return <p className="text-gray-500 mt-4 animate-pulse uppercase text-xs">{dict?.STVS?.loading_missions || "正在同步任務檔案..."}</p>;

  return (
    <div className="mt-8 w-full">
      <h3 className="text-lg font-bold mb-4 border-b-2 border-black uppercase tracking-widest italic">
        {dict?.STVS?.active_missions || "Active Missions"}
      </h3>
      {missions.length === 0 ? (
        <p className="text-sm text-gray-500 italic">{dict?.STVS?.no_missions || "目前無指派任務"}</p>
      ) : (
        <ul className="space-y-4">
          {missions.map((m) => (
            <li key={m.id} className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold bg-black text-white px-1">RANK {m.difficulty}</span>
                    <span className={`text-[10px] font-bold ${m.status === 'COMPLETED' ? 'text-green-600' : 'text-gray-400'}`}>[{m.status}]</span>
                  </div>
                  <h4 className={`font-black mt-1 text-xl uppercase ${m.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}`}>{m.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{m.description}</p>
                </div>
                {m.status !== 'COMPLETED' && (
                  <button onClick={() => updateMission(m.id)} className="text-xs font-bold border-2 border-black px-3 py-2 hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                    {dict?.STVS?.mark_completed || "MARK AS COMPLETED"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}