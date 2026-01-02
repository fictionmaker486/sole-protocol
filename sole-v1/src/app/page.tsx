"use client";

import MissionList from './components/MissionList';
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      fetchProfile(session.user.id);
    }
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);
    if (data) setProfiles(data);
  };

  const handleAuth = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setMsg(error.message);
      else if (data.user) {
        await supabase.from('profiles').insert([{ id: data.user.id, full_name: 'New Recruit', role: 'USER', credibility_score: 50 }]);
        setUser(data.user);
        fetchProfile(data.user.id);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else if (data.user) {
        setUser(data.user);
        fetchProfile(data.user.id);
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfiles([]);
  };

  const saveProfile = async (id: string) => {
    const { error } = await supabase.from('profiles').update({ full_name: tempName }).eq('id', id);
    if (!error) {
      setProfiles(profiles.map(p => p.id === id ? { ...p, full_name: tempName } : p));
      setEditingId(null);
    }
  };

  if (loading) return <div className="p-10 font-mono">INITIALIZING SYSTEM...</div>;

  return (
    <main className="min-h-screen bg-gray-50 text-black p-10 font-mono">
      <div className="max-w-4xl mx-auto border-b-8 border-black pb-4 mb-8 flex justify-between items-end">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter">Sole Protocol <span className="text-xs bg-black text-white px-2 py-1 align-top ml-2">v2.0</span></h1>
        {user && <button onClick={handleLogout} className="text-xs font-bold underline">DISCONNECT</button>}
      </div>

      {!user ? (
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold mb-6 bg-black text-white py-2 uppercase">{isSignUp ? "Registration" : "Login"}</h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border-2 p-2" placeholder="Email" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border-2 p-2" placeholder="Password" />
            <button type="submit" className="w-full bg-black text-white py-3 font-bold">{isSignUp ? "INITIALIZE" : "AUTHENTICATE"}</button>
          </form>
          <button onClick={() => setIsSignUp(!isSignUp)} className="mt-4 text-xs underline">{isSignUp ? "GO TO LOGIN" : "GO TO SIGNUP"}</button>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {profiles.map((profile) => (
              <div key={profile.id}>
                <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
                  <div className="absolute top-4 right-4 text-xs font-bold">
                    {editingId === profile.id ? (
                      <button onClick={() => saveProfile(profile.id)} className="bg-black text-white px-2 py-1">SAVE</button>
                    ) : (
                      <button onClick={() => { setEditingId(profile.id); setTempName(profile.full_name); }} className="underline">EDIT</button>
                    )}
                  </div>
                  <h3 className="text-3xl font-black uppercase">{profile.full_name}</h3>
                  <div className="mt-4 border-t pt-4">
                    <span className="italic">Credibility Score: </span>
                    <span className="font-bold">{profile.credibility_score} / 100</span>
                  </div>
                </div>
                {/* 核心修正：將 MissionList 放在 profile 迴圈內 */}
                <MissionList agentId={profile.id} />
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}