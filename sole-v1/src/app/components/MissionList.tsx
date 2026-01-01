import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient'; // 指向 src/supabaseClient.ts

export default function MissionList({ agentId }: { agentId: string }) {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMissions() {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('agent_id', agentId);
      
      if (!error) setMissions(data);
      setLoading(false);
    }
    fetchMissions();
  }, [agentId]);

  if (loading) return <p className="text-gray-500 mt-4">正在同步任務檔案...</p>;

  return (
    <div className="mt-8 w-full max-w-md">
      <h3 className="text-lg font-bold mb-4 border-b border-black">ACTIVE MISSIONS</h3>
      {missions.length === 0 ? (
        <p className="text-sm text-gray-500">尚無指派任務</p>
      ) : (
        <ul className="space-y-3">
          {missions.map((m) => (
            <li key={m.id} className="p-3 border border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold bg-black text-white px-1">RANK {m.difficulty}</span>
                <span className="text-[10px] text-gray-500">{m.status}</span>
              </div>
              <p className="font-bold mt-1 uppercase">{m.title}</p>
              <p className="text-xs text-gray-600 mt-1">{m.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}