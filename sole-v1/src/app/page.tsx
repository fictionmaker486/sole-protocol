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
    const { data } = await supabase.from('profiles').select('*').eq('id', userId);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono">AUTHENTICATING...</div>;

  return (
    <main className="min-h-screen bg-gray-50 text-black p-6 md:p-12 font-mono">
      <div className="max-w-4xl mx-auto border-b-8 border-black pb-4 mb-12 flex justify-between items-end">
        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">Sole Protocol <span className="text-xs bg-black text-white px-2 py-1 align-top ml-2">v2.0</span></h1>
        {user && <button onClick={handleLogout} className="text-xs font-bold underline hover:text-red-600 transition-colors">DISCONNECT</button>}
      </div>

      {!user ? (
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-6 bg-black text-white py-2 text-center uppercase tracking-widest">{isSignUp ? "New Agent" : "Authentication"}</h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border-2 border-black p-3" placeholder="AGENT EMAIL" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border-2 border-black p-3" placeholder="PASSCODE" />
            {msg && <div className="text-xs p-2 bg-gray-100 border-l-4 border-black">{msg}</div>}
            <button type="submit" className="w-full bg-black text-white font-bold py-4 hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">LOGIN / INITIALIZE</button>
          </form>
          <button onClick={() => setIsSignUp(!isSignUp)} className="mt-6 w-full text-center text-xs underline">{isSignUp ? "ALREADY RECRUITED? LOGIN" : "NO ACCESS? APPLY FOR ID"}</button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-12">
          {profiles.map((profile) => (
            <div key={profile.id} className="space-y-8">
              {/* 身分證卡片 */}
              <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
                <div className="absolute top-4 right-4">
                  {editingId === profile.id ? (
                    <button onClick={() => saveProfile(profile.id)} className="bg-black text-white px-3 py-1 text-xs">SAVE</button>
                  ) : (
                    <button onClick={() => { setEditingId(profile.id); setTempName(profile.full_name); }} className="text-xs underline font-bold">EDIT</button>
                  )}
                </div>
                <span className="bg-black text-white text-[10px] px-2 py-1 font-bold uppercase">Authorized Operative</span>
                <div className="mt-6">
                  <span className="text-gray-400 text-[10px] font-bold block uppercase">Operative Name:</span>
                  {editingId === profile.id ? (
                    <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="text-4xl font-black w-full border-b-2 border-black outline-none" />
                  ) : (
                    <h3 className="text-4xl font-black uppercase tracking-tighter">{profile.full_name}</h3>
                  )}
                </div>
                <div className="mt-8 border-t-2 border-gray-100 pt-4 flex justify-between items-center">
                  <span className="text-gray-500 italic text-sm">Credibility Score:</span>
                  <span className="font-bold text-2xl">{profile.credibility_score} <span className="text-gray-400 font-normal text-xs">/ 100</span></span>
                </div>
              </div>

              {/* 任務清單組件掛載 */}
              <MissionList agentId={profile.id} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}