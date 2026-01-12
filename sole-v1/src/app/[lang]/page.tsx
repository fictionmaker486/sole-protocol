"use client";

import React, { useState, useEffect, use } from 'react';
import { usePathname, useRouter } from 'next/navigation';
// 依照你的檔案樹：從 [lang] 往上跳兩層回到 src/app 找組件與 client
import MissionList from '../components/MissionList';
import { supabase } from '../supabaseClient';
// 往上兩層回到 src/ 再進入 lib/
import { getDictionary } from '../../lib/dictionary';
import { Locale } from '../../lib/i18n-config';

export default function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  // 1. 取得路由與語言參數
  const { lang } = use(params);
  const pathname = usePathname();
  const router = useRouter();

  // 2. 狀態管理
  const [dict, setDict] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  // 3. 初始化：加載翻譯與檢查登入狀態
  useEffect(() => {
    const init = async () => {
      try {
        const d = await getDictionary(lang);
        setDict(d);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [lang]);

  // 4. 核心功能
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId);
    if (data) setProfiles(data);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert([
            { id: data.user.id, full_name: '新進特務', credibility_score: 50 }
          ]);
          window.location.reload();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          await fetchProfile(data.user.id);
        }
      }
    } catch (error: any) {
      setMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const switchLanguage = (newLang: string) => {
    const segments = pathname.split('/');
    segments[1] = newLang;
    router.push(segments.join('/'));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfiles([]);
    window.location.reload();
  };

  const saveProfile = async (id: string) => {
    const { error } = await supabase.from('profiles').update({ full_name: tempName }).eq('id', id);
    if (!error) {
      setProfiles(profiles.map(p => p.id === id ? { ...p, full_name: tempName } : p));
      setEditingId(null);
    }
  };

  // 載入中狀態
  if (loading || !dict) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono uppercase tracking-widest bg-gray-50 text-black">
        {dict?.STVS?.initializing || "INITIALIZING..."}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-black p-6 md:p-12 font-mono">
      {/* 頂部標題區 */}
      <div className="max-w-4xl mx-auto border-b-8 border-black pb-4 mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
            {dict.STVS?.title || "Sole Protocol"}
            <span className="text-xs bg-black text-white px-2 py-1 align-top ml-2">v2.0</span>
          </h1>
          
          <div className="flex gap-2 mt-4 text-[10px] font-bold">
            <button 
              onClick={() => switchLanguage('zh-TW')} 
              className={`px-2 py-0.5 transition-all ${lang === 'zh-TW' ? 'bg-black text-white' : 'border border-black hover:bg-black hover:text-white'}`}
            >
              ZH-TW
            </button>
            <button 
              onClick={() => switchLanguage('en')} 
              className={`px-2 py-0.5 transition-all ${lang === 'en' ? 'bg-black text-white' : 'border border-black hover:bg-black hover:text-white'}`}
            >
              EN
            </button>
          </div>
        </div>

        {user && (
          <button onClick={handleLogout} className="text-xs font-bold underline hover:text-red-600 transition-colors uppercase">
            {dict.STVS?.btn_logout || "DISCONNECT"}
          </button>
        )}
      </div>

      {/* 內容區：身分驗證 / 特務儀表板 */}
      {!user ? (
        /* 未登入：美化後的登入介面 */
        <div className="max-w-md mx-auto mt-20 relative">
          <div className="absolute -inset-4 bg-yellow-400/20 blur-xl animate-pulse -z-10"></div>
          <div className="bg-white border-[6px] border-black p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-2 bg-black flex">
              <div className="w-1/3 h-full bg-red-600 animate-pulse"></div>
            </div>
            <h2 className="text-xl font-black mb-8 bg-black text-white py-3 px-4 italic uppercase tracking-[0.3em]">
              {isSignUp ? (dict.STVS?.signup || "SIGNUP") : (dict.STVS?.login || "LOGIN")}
            </h2>
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="group text-left">
                <label className="text-[10px] font-black uppercase mb-1 block tracking-widest text-gray-400 group-focus-within:text-black transition-colors">
                  {dict.STVS?.email || "AGENT EMAIL"}
                </label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="w-full border-4 border-black p-4 outline-none font-bold focus:bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors" 
                  placeholder="AGENT@SOLE.PROTOCOL" 
                />
              </div>

              <div className="group text-left">
                <label className="text-[10px] font-black uppercase mb-1 block tracking-widest text-gray-400 group-focus-within:text-black transition-colors">
                  {dict.STVS?.password || "PASSCODE"}
                </label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="w-full border-4 border-black p-4 outline-none font-bold focus:bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors" 
                  placeholder="********" 
                />
              </div>

              {msg && (
                <div className="text-[10px] p-3 bg-red-100 border-2 border-red-600 font-bold text-red-600 text-left">
                  [SYSTEM ERROR]: {msg}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-black text-white font-black py-5 text-lg hover:bg-red-600 transition-all shadow-[8px_8px_0px_0px_rgba(220,38,38,0.5)] uppercase tracking-widest"
              >
                {isSignUp ? (dict.STVS?.btn_signup || "INITIALIZE") : (dict.STVS?.btn_login || "EXECUTE")}
              </button>
            </form>
            <button 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="mt-8 w-full text-center text-[10px] font-black underline uppercase tracking-widest hover:text-red-600 transition-colors"
            >
              {isSignUp ? (dict.STVS?.switch_to_login) : (dict.STVS?.switch_to_signup)}
            </button>
          </div>
        </div>
      ) : (
        /* 已登入：特務儀表板 */
        <div className="max-w-2xl mx-auto space-y-12">
          {profiles.map((profile) => (
            <div key={profile.id} className="space-y-10 text-left">
              {/* 特務名片 */}
              <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative transition-transform hover:translate-x-[-2px] hover:translate-y-[-2px]">
                <div className="absolute top-4 right-4">
                  {editingId === profile.id ? (
                    <button 
                      onClick={() => saveProfile(profile.id)} 
                      className="bg-black text-white px-3 py-1 text-xs font-bold hover:bg-red-600 transition-colors"
                    >
                      SAVE
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setEditingId(profile.id); setTempName(profile.full_name); }} 
                      className="text-xs underline font-bold hover:text-red-600 transition-colors"
                    >
                      EDIT
                    </button>
                  )}
                </div>
                
                <span className="bg-black text-white text-[10px] px-2 py-1 font-bold uppercase tracking-widest">
                  Authorized Operative
                </span>

                <div className="mt-6">
                  <span className="text-gray-400 text-[10px] font-bold block uppercase italic tracking-tighter">
                    Operative Name:
                  </span>
                  {editingId === profile.id ? (
                    <input 
                      type="text" 
                      value={tempName} 
                      onChange={(e) => setTempName(e.target.value)} 
                      className="text-4xl font-black w-full border-b-4 border-black outline-none bg-yellow-50 px-2" 
                      autoFocus 
                    />
                  ) : (
                    <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">
                      {profile.full_name}
                    </h3>
                  )}
                </div>

                <div className="mt-8 border-t-2 border-gray-100 pt-4 flex justify-between items-center">
                  <span className="text-gray-500 italic text-sm">
                    {dict.STVS?.score_label || "Credibility Score"}:
                  </span>
                  <span className="font-bold text-2xl">
                    {profile.credibility_score} <span className="text-gray-400 font-normal text-xs">/ 100</span>
                  </span>
                </div>
              </div>

              {/* 任務清單元件 */}
              <MissionList agentId={profile.id} dict={dict} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}