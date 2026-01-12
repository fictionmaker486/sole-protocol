"use client";

import React, { useState, useEffect, use } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import MissionList from '../components/MissionList';
import { supabase } from '../supabaseClient';
import { getDictionary } from '../../lib/dictionary';
import { Locale } from '../../lib/i18n-config';

export default function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = use(params);
  const pathname = usePathname();
  const router = useRouter();

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
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [lang]);

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
          await supabase.from('profiles').insert([{ id: data.user.id, full_name: '新進特務', credibility_score: 50 }]);
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

  if (loading || !dict) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono uppercase tracking-widest bg-gray-50 text-black">
        INITIALIZING...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-black p-6 md:p-12 font-mono overflow-x-hidden">
      {/* 頂部標題區 - 包含語言切換與 LOGO 容器 */}
      <div className="max-w-4xl mx-auto border-b-8 border-black pb-4 mb-12 flex justify-between items-end relative">
        {/* 主要標題文字 */}
        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
          {dict.STVS?.title || "Sole Protocol"}
          <span className="text-xs bg-black text-white px-2 py-1 align-top ml-2 font-bold">v2.0</span>
        </h1>
        
        {/* 語言切換按鈕 */}
        <div className="flex gap-2 text-[10px] font-bold absolute top-0 right-0 mt-2 mr-2">
          <button onClick={() => switchLanguage('zh-TW')} className={`px-2 py-0.5 ${lang === 'zh-TW' ? 'bg-black text-white' : 'border border-black'}`}>ZH-TW</button>
          <button onClick={() => switchLanguage('en')} className={`px-2 py-0.5 ${lang === 'en' ? 'bg-black text-white' : 'border border-black'}`}>EN</button>
        </div>

        {/* LOGO 圖片區域 - 登入前後會共用此位置並切換圖片 */}
        <motion.div 
          layoutId="main-logo" // 這是 Logo 共享元素的關鍵 ID
          className="absolute top-0 right-0 mt-12 mr-2 flex items-center justify-end" // 調整這裡讓它初始位置在右上角
        >
          <AnimatePresence mode="wait">
            {!user ? (
              // 未登入時顯示 "SOLE" 文字 Logo
              <motion.img
                key="sole-text-logo"
                src="/logo-sole-text.png" // 確保圖片路徑正確
                alt="SOLE"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="h-8 md:h-10 w-auto"
              />
            ) : (
              // 登入後顯示 "S" 圖形 Logo
              <motion.img
                key="sole-s-logo"
                src="/logo-s.png" // 確保圖片路徑正確
                alt="S"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="h-8 md:h-10 w-auto"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {!user ? (
          /* --- 登入盒 --- */
          <motion.div
            key="login-view"
            initial={{ opacity: 0, scale: 0.8, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ 
              opacity: 0, 
              scale: 1.8, 
              rotateY: 180, 
              filter: "blur(20px)",
              transition: { duration: 0.8, ease: "circIn" }
            }}
            className="max-w-md mx-auto mt-20"
          >
            <div className="bg-white border-[6px] border-black p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative">
              <h2 className="text-xl font-black mb-8 bg-black text-white py-3 px-4 italic uppercase tracking-[0.3em]">
                {isSignUp ? dict.STVS?.signup : dict.STVS?.login}
              </h2>
              <form onSubmit={handleAuth} className="space-y-6 text-left">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-4 border-black p-4 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" placeholder="AGENT EMAIL" required />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-4 border-black p-4 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" placeholder="PASSCODE" required />
                <button type="submit" className="w-full bg-black text-white font-black py-5 text-lg hover:bg-red-600 transition-all shadow-[8px_8px_0px_0px_rgba(220,38,38,0.3)]">
                  {isSignUp ? "INITIALIZE" : "EXECUTE LOGIN"}
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          /* --- 主儀表板 --- */
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.3, ease: "backOut" }}
            className="max-w-2xl mx-auto space-y-12"
          >
            {profiles.map((profile) => (
              <div key={profile.id} className="space-y-10">
                <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                  <span className="bg-black text-white text-[10px] px-2 py-1 font-bold">AUTHORIZED OPERATIVE</span>
                  <h3 className="text-4xl font-black uppercase mt-6">{profile.full_name}</h3>
                  <div className="mt-8 border-t-2 pt-4 flex justify-between items-center">
                    <span className="italic text-sm">Credibility Score:</span>
                    <span className="font-bold text-2xl">{profile.credibility_score} <span className="text-xs text-gray-400">/ 100</span></span>
                  </div>
                </div>
                <MissionList agentId={profile.id} dict={dict} />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}