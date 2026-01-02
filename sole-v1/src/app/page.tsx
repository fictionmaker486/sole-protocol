"use client";
import MissionList from './components/MissionList';
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function Home() {
  // --- 狀態管理區 ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  
  // 新增：註冊模式切換開關
  const [isSignUp, setIsSignUp] = useState(false);

  // 編輯模式狀態
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");

  // --- 初始載入區 ---
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        fetchProfile();
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  // 安全版：只抓取自己的資料
  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id); // 只抓自己
      if (data) setProfiles(data);
    }
  };

  // --- 核心邏輯：處理 登入 / 註冊 ---
  const handleAuth = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    if (isSignUp) {
      // 1. 執行註冊 (Sign Up)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMsg(error.message);
      } else if (data.user) {
        // 2. 註冊成功後，立刻建立個人的 Profile 資料
        const newProfile = {
          id: data.user.id,
          full_name: "New Recruit", // 預設名字
          role: "USER",             // 預設角色
          credibility_score: 50     // 新人預設分數
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile]);

        if (insertError) {
          setMsg("Account created but profile failed: " + insertError.message);
        } else {
          setMsg("Welcome, Agent. Sign up successful!");
          setUser(data.user);
          fetchProfile();
        }
      }
    } else {
      // 執行登入 (Sign In)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMsg(error.message);
      } else {
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
    setMsg('');
  };

  // 編輯與更新邏輯
  const startEditing = (profile: any) => {
    setEditingId(profile.id);
    setTempName(profile.full_name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTempName("");
  };

  const saveProfile = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: tempName })
      .eq('id', id);

    if (error) {
      alert("Update Failed: " + error.message);
    } else {
      setProfiles(profiles.map(p => p.id === id ? { ...p, full_name: tempName } : p));
      setEditingId(null);
    }
  };

  // --- 畫面渲染區 ---

  if (loading) return <div className="p-10 font-mono">System initializing...</div>;

  // 登入 / 註冊 介面
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-mono">
        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-black w-full max-w-md transition-all">
          <h1 className="text-2xl font-black mb-2 text-center">
            {isSignUp ? "RECRUITMENT PROTOCOL" : "SOLE PROTOCOL ACCESS"}
          </h1>
          <p className="text-center text-gray-400 text-xs mb-6 uppercase tracking-widest">
            {isSignUp ? "New Agent Registration" : "Secure Login"}
          </p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Operative Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-300 p-2 rounded focus:border-black outline-none transition" placeholder="Enter email..." />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Passcode</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-300 p-2 rounded focus:border-black outline-none transition" placeholder="••••••" />
            </div>
            
            {msg && <div className={`text-sm font-bold text-center ${msg.includes("Welcome") ? "text-green-600" : "text-red-500"}`}>{msg}</div>}

            <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded hover:bg-gray-800 transition">
              {isSignUp ? "INITIALIZE AGENT" : "AUTHENTICATE"}
            </button>
          </form>

          {/* 切換按鈕 */}
          <div className="mt-6 text-center">
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setMsg(''); }}
              className="text-xs font-bold text-gray-500 underline hover:text-black"
            >
              {isSignUp ? "ALREADY HAVE AN ID? LOGIN" : "NO ACCESS? APPLY FOR RECRUITMENT"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 識別證介面
  return (
    <div className="min-h-screen bg-gray-50 text-black p-10 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-8 border-b-4 border-black pb-4">
          <h1 className="text-4xl font-black tracking-tighter">
            SOLE PROTOCOL <span className="text-sm font-normal bg-black text-white px-2 py-1 rounded ml-2">v2.0</span>
          </h1>
          <button onClick={handleLogout} className="text-sm font-bold underline hover:text-red-600">DISCONNECT</button>
        </div>
        
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          DETECTED IDENTITY
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profiles?.map((profile: any) => (
            <div key={profile.id} className="bg-white border-2 border-black p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all relative">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-widest rounded">
                  {profile.role}
                </span>
                {editingId !== profile.id && (
                  <button onClick={() => startEditing(profile)} className="text-xs font-bold text-blue-600 underline hover:text-blue-800">EDIT ID</button>
                )}
              </div>

              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Operative Name</p>
                {editingId === profile.id ? (
                  <div className="flex gap-2">
                    <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)}
                      className="border-2 border-black p-1 w-full font-bold text-lg" />
                    <button onClick={() => saveProfile(profile.id)} className="bg-black text-white px-3 text-sm font-bold hover:bg-green-600">SAVE</button>
                    <button onClick={cancelEditing} className="text-red-500 text-sm font-bold px-2 hover:underline">X</button>
                  </div>
                ) : (
                  <h3 className="text-3xl font-black uppercase tracking-tight">{profile.full_name}</h3>
                )}
              </div>

              <div className="border-t-2 border-gray-100 pt-4 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-600">Credibility Score</span>
                <span className="text-2xl font-black text-black">
                  {profile.credibility_score} <span className="text-xs text-gray-400 font-normal">/ 100</span>
                </span>
              </div>
              // ... 前後的程式碼 (約在 227 行附近)
    </div>
  </div>

  {/* 移除原本的註解括號，直接放置組件 */}
<MissionList agentId={profile.id} />
</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}