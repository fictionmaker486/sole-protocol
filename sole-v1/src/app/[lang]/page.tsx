"use client";

import React, { useState, useEffect, use } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import MissionList from '../components/MissionList';
import { supabase } from '../supabaseClient';
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
    <main className="min-h-screen bg-gray-50 text-black p-6 md:p-12 font-mono overflow-x-hidden">
      
      {/* 頂部區域：標題、語言切換、以及動態 Logo */}
      <div className="max-w-4xl mx-auto border-b-8 border-black pb-6 mb-12 flex justify-between items-start relative min-h-[160px]">
        
        {/* 左側：系統標題與語系按鈕 */}
        <div className="z-10">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter"
          >
            {dict.STVS?.title || "Sole Protocol"}
            <span className="text-xs bg-black text-white px-2 py-1 align-top ml-2 font-bold italic">v2.0</span>
          </motion.h1>
          
          <div className="flex gap-2 mt-6 text-[10px] font-bold">
            <button 
              onClick={() => switchLanguage('zh-TW')} 
              className={`px-3 py-1 transition-all ${lang === 'zh-TW' ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]' : 'border-2 border-black hover:bg-black hover:text-white'}`}
            >
              ZH-TW
            </button>
            <button 
              onClick={() => switchLanguage('en')} 
              className={`px-3 py-1 transition-all ${lang === 'en' ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]' : 'border-2 border-black hover:bg-black hover:text-white'}`}
            >
              EN
            </button>
          </div>
        </div>

        {/* 右側：Logo 飛向右上角動畫容器 */}
        <motion.div 
          layoutId="main-logo-container"
          className="absolute top-0 right-0 z-20"
        >
          <AnimatePresence mode="wait">
            {!user ? (
              /* 圖二：登入前的 SOLE 文字 Logo */
              <motion.img
                key="logo-text"
                src="/logo-sole-text.png"
                alt="SOLE"
                className="w-32 md:w-56 h-auto object-contain"
                initial={{ opacity: 0, scale: 0.5, rotateY: -30 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 1.5, rotateY: 90, filter: "blur(10px)" }}
                transition={{ duration: 0.6, ease: "anticipate" }}
              />
            ) : (
              /* 圖一：登入後的 S 指南針 Logo */
              <motion.img
                key="logo-s"
                src="/logo-s.png"
                alt="S"
                className="w-24 md:w-36 h-auto object-contain"
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* 登出按鈕（僅在登入後顯示） */}
        {user && (
          <button 
            onClick={handleLogout} 
            className="absolute bottom-0 right-0 mb-4 text-[10px] font-black underline hover:text-red-600 transition-colors uppercase tracking-widest"
          >
            {dict.STVS?.btn_logout || "DISCONNECT"}
          </button>
        )}
      </div>

      {/* 核心內容區：登入盒 vs 儀表板 */}
      <AnimatePresence mode="wait">
        {!user ? (
          /* --- 登入盒轉場 --- */
          <motion.div
            key="login-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              rotateX: -20, 
              transition: { duration: 0.5 } 
            }}
            className="max-w-md mx-auto mt-10 relative"
          >
            {/* 背景發光效果 */}
            <div className="absolute -inset-4 bg-yellow-400/20 blur-2xl animate-pulse -z-10"></div>
            
            <div className="bg-white border-[6px] border-black p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] text-center">
              <h2 className="text-xl font-black mb-8 bg-black text-white py-3 px-4 italic uppercase tracking-[0.3em]">
                {isSignUp ? (dict.STVS?.signup || "SIGNUP") : (dict.STVS?.login || "LOGIN")}
              </h2>
              
              <form onSubmit={handleAuth} className="space-y-6 text-left">
                <div>
                  <label className="text-[10px] font-black uppercase mb-1 block tracking-widest text-gray-400">Agent ID</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="w-full border-4 border-black p-4 outline-none font-bold focus:bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                    placeholder="EMAIL@SOLE.PROTOCOL" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase mb-1 block tracking-widest text-gray-400">Passcode</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="w-full border-4 border-black p-4 outline-none font-bold focus:bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                    placeholder="********" 
                  />
                </div>

                {msg && <div className="text-[10px] p-3 bg-red-100 border-2 border-red-600 font-bold text-red-600">[ERR]: {msg}</div>}
                
                <button type="submit" className="w-full bg-black text-white font-black py-5 text-lg hover:bg-red-600 transition-all shadow-[8px_8px_0px_0px_rgba(220,38,38,0.4)] uppercase tracking-widest">
                  {isSignUp ? "Initialize" : "Execute Login"}
                </button>
              </form>
              
              <button onClick={() => setIsSignUp(!isSignUp)} className="mt-8 text-[10px] font-black underline uppercase hover:text-red-600 transition-colors">
                {isSignUp ? dict.STVS?.switch_to_login : dict.STVS?.switch_to_signup}
              </button>
            </div>
          </motion.div>
        ) : (
          /* --- 儀表板轉場 --- */
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl mx-auto space-y-12"
          >
            {profiles.map((profile) => (
              <div key={profile.id} className="space-y-10">
                {/* 特務身分卡 */}
                <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                  <div className="absolute top-4 right-4 z-10">
                    {editingId === profile.id ? (
                      <button onClick={() => saveProfile(profile.id)} className="bg-black text-white px-3 py-1 text-xs font-bold hover:bg-green-600 transition-colors">SAVE</button>
                    ) : (
                      <button onClick={() => { setEditingId(profile.id); setTempName(profile.full_name); }} className="text-xs underline font-bold hover:text-red-600 transition-colors">EDIT</button>
                    )}
                  </div>
                  
                  <div className="bg-black text-white text-[10px] px-2 py-1 font-bold inline-block mb-6 tracking-tighter uppercase">Authorized Operative</div>
                  
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold block uppercase tracking-widest mb-1">Operative Identity</span>
                    {editingId === profile.id ? (
                      <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="text-4xl font-black w-full border-b-4 border-black outline-none bg-yellow-50 px-2" autoFocus />
                    ) : (
                      <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">{profile.full_name}</h3>
                    )}
                  </div>
                  
                  <div className="mt-10 border-t-2 border-gray-100 pt-4 flex justify-between items-center">
                    <span className="text-gray-500 italic text-sm font-bold uppercase tracking-widest">{dict.STVS?.score_label || "Credibility Score"}</span>
                    <span className="font-black text-3xl">{profile.credibility_score} <span className="text-gray-400 font-normal text-sm italic">/ 100</span></span>
                  </div>
                </div>

                {/* 任務清單 */}
                <MissionList agentId={profile.id} dict={dict} />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}