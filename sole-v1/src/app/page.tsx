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
      fetchProfile();
    }
    setLoading(false);
  };

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id);
      if (data) setProfiles(data);
    }
  };

  const handleAuth = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMsg(error.message);
      } else if (data.user) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: data.user.id, full_name: 'New Recruit', role: 'USER', credibility_score: 50 }]);
        
        if (insertError) setMsg("Account created but profile failed: " + insertError.message);
        else {
          setMsg("Welcome! Sign up successful!");
          setUser(data.user);
          fetchProfile();
        }
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else {
        setUser(data.user);
        fetchProfile();
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfiles([]);
  };

  const startEditing = (profile: any) => {
    setEditingId(profile.id);
    setTempName(profile.full_name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTempName('');
  };

  const saveProfile = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: tempName })
      .eq('id', id);

    if (error) alert("Update failed: " + error.message);
    else {
      setProfiles(profiles.map(p => p.id === id ? { ...p, full_name: tempName } : p));
      setEditingId(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">系統初始化中...</div>;

  return (
    <main className="min-h-screen bg-gray-50 text-black p-10 font-mono">
      <div className="max-w-4xl mx-auto border-b-8 border-black pb-4 mb-8 flex justify-between items-end">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter">Sole Protocol <span className="text-xs bg-black text-white px-2 py-1 align-top ml-2">v2.0</span></h1>
        {user && <button onClick={handleLogout} className="text-xs font-bold underline hover:text-red-600 transition-all">DISCONNECT</button>}
      </div>

      {!user ? (
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold mb-6 bg-black text-white py-2 uppercase tracking-widest">
            {isSignUp ? "New Agent Registration" : "Secure Login"}
          </h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="text-left">
              <label className="block text-xs font-bold mb-1 uppercase italic">Operative Email:</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border-2 border-gray-300 p-2 focus:outline-none focus:border-black transition-all placeholder-gray-300" placeholder="Enter email..." />
            </div>
            <div className="text-left">
              <label className="block text-xs font-bold mb-1 uppercase italic">Passcode:</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border-2 border-gray-300 p-2 focus:outline-none focus:border-black transition-all" />
            </div>
            {msg && <div className={`text-xs p-2 border-l-4 ${msg.includes('Welcome') ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>{msg}</div>}
            <button type="submit" className="w-full bg-black text-white font-bold py-3 px-4 hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
              {isSignUp ? "INITIALIZE AGENT" : "AUTHENTICATE"}
            </button>
          </form>
          <button onClick={() => setIsSignUp(!isSignUp)} className="mt-6 text-xs text-gray-400 hover:text-black transition-colors underline decoration-dotted">
            {isSignUp ? "ALREADY HAVE AN AGENT ID? LOG IN" : "NO ACCESS? APPLY FOR RECRUITMENT"}
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="flex items-center space-x-2 text-green-600 mb-4 animate-pulse">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span className="text-xs font-bold tracking-widest uppercase">Detected Identity</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {profiles.map((profile) =>