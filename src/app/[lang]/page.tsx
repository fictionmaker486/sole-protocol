"use client";

import React, { useState, useEffect, use } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/* --- 這是為您目前檔案樹精確計算的路徑 --- */
import MissionList from '../../components/MissionList'; // 跳兩層到 src/components
/* --- 嘗試減少一層跳轉，看看紅線是否移動 --- */
import { supabase } from '../../supabaseClient';    
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
      const { data, error } = isSignUp 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      if (data.user) {
        if (isSignUp) {
          window.location.reload();
        } else {
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const switchLanguage = (newLang: string) => {
    const segments = pathname.split('/');
    segments[1] = newLang;
    router.push(segments.join('/'));
  };

  if (loading || !dict) {
    return <div className="min-h-screen flex items-center justify-center font-mono bg-gray-50 text-black tracking-[0.5em]">INITIALIZING...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 text-black p-6 md:p-12 font-mono overflow-x-hidden">
      
      <div className="max-w-4xl mx-auto border-b-8 border-black pb-4 mb-12 relative min-h-[140px] z-20">
        <div className="flex justify-between items-start">
          <div className="z-10">
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
              {dict.STVS?.title || "Sole Protocol"}
              <span className="text-xs bg-black text-white px-2 py-1 align-top ml-2 font-bold italic">v2.0</span>
            </h1>
            
            <div className="flex gap-2 mt-6 text-[10px] font-bold">
              <button onClick={() => switchLanguage('zh-TW')} className={`px-3 py-1 ${lang === 'zh-TW' ? 'bg-black text-white' : 'border-2 border-black hover:bg-black hover:text-white'}`}>ZH-TW</button>
              <button onClick={() => switchLanguage('en')} className={`px-3 py-1 ${lang === 'en' ? 'bg-black text-white' : 'border-2 border-black hover:bg-black hover:text-white'}`}>EN</button>
            </div>
          </div>

          <div className="w-32 md:w-56 flex justify-end">
            <AnimatePresence mode="wait">
              {!user ? (
                <motion.img
                  key="logo-text"
                  src="/logo-sole-text.png"
                  alt="SOLE"
                  className="w-full h-auto object-contain max-h-[60px]"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                />
              ) : (
                <motion.img
                  key="logo-s"
                  src="/logo-s.png"
                  alt="S"
                  className="w-24 md:w-32 h-auto object-contain max-h-[80px]"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {user && (
          <button 
            onClick={handleLogout} 
            className="absolute bottom-2 left-0 text-[10px] font-black underline hover:text-red-600 uppercase tracking-widest z-30"
          >
            {dict.STVS?.btn_logout || "DISCONNECT"}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="login-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, rotateY: 180, filter: "blur(15px)" }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto mt-10"
          >
            <div className="bg-white border-[6px] border-black p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] text-center">
              <h2 className="text-xl font-black mb-8 bg-black text-white py-3 px-4 italic uppercase tracking-widest">LOGIN</h2>
              <form onSubmit={handleAuth} className="space-y-6 text-left">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border-4 border-black p-4 font-bold" placeholder="AGENT EMAIL" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border-4 border-black p-4 font-bold" placeholder="PASSCODE" />
                <button type="submit" className="w-full bg-black text-white font-black py-5 text-lg shadow-[8px_8px_0px_0px_rgba(220,38,38,0.3)] uppercase">Execute</button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto space-y-12"
          >
            {profiles.map((profile) => (
              <div key={profile.id} className="space-y-10">
                <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
                  <span className="bg-black text-white text-[10px] px-2 py-1 font-bold">AUTHORIZED OPERATIVE</span>
                  <h3 className="text-4xl font-black mt-6 tracking-tighter uppercase">{profile.full_name}</h3>
                  <div className="mt-8 border-t-2 border-gray-100 pt-4 flex justify-between items-center">
                    <span className="text-gray-500 italic text-sm font-bold uppercase tracking-widest">Credibility Score:</span>
                    <span className="font-black text-3xl">{profile.credibility_score} <span className="text-xs font-normal text-gray-400">/ 100</span></span>
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