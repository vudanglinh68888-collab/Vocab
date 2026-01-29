
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface Props {
  onLogin: (user: User, grade: number) => void;
}

interface SavedProfile {
  name: string;
  avatar: string;
  grade: number;
}

const LoginView: React.FC<Props> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number>(5);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);

  useEffect(() => {
    const profiles: SavedProfile[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('kid-db-')) {
        try {
          const rawData = localStorage.getItem(key);
          if (!rawData) continue;
          const data = JSON.parse(rawData);
          const profileName = key.replace('kid-db-', '');
          const displayName = profileName.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
          profiles.push({
            name: displayName,
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${profileName}`,
            grade: data.grade || 5
          });
        } catch (e) {}
      }
    }
    setSavedProfiles(profiles);
  }, []);

  const handleStart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;
    onLogin({
      id: `u-${Date.now()}`,
      name: name.trim(),
      email: '',
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name.trim().toLowerCase()}`,
      status: 'online',
      preferences: { dailyGoal: 10, reminders: true, soundEnabled: true }
    }, selectedGrade);
  };

  const grades = [4, 5, 6, 7, 8, 9];

  return (
    <div className="min-h-screen bg-rose-500 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>
      <div className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-10 border-8 border-rose-300 animate-scaleIn relative z-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🍳</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mẹ chiên giòn</h1>
          <p className="text-slate-500 font-bold mt-1 text-sm">Học Tiếng Anh lớp 4-9 cực đỉnh!</p>
        </div>

        {savedProfiles.length > 0 && (
          <div className="mb-10">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Bé cũ quay lại học nè:</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {savedProfiles.map((p, i) => (
                <button key={i} onClick={() => onLogin({id: 'u', name: p.name, email: '', avatar: p.avatar, status: 'online'}, p.grade)} className="flex flex-col items-center gap-2 group">
                  <img src={p.avatar} className="w-16 h-16 rounded-2xl border-2 border-slate-100 group-hover:border-rose-500 transition-all" />
                  <span className="text-xs font-black">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleStart} className="space-y-6">
          <input 
            type="text" required value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên con yêu..."
            className="w-full p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl text-lg font-bold outline-none focus:border-rose-500 transition-all"
          />
          <div className="grid grid-cols-6 gap-2">
            {grades.map(g => (
              <button key={g} type="button" onClick={() => setSelectedGrade(g)} className={`py-3 rounded-xl font-black text-xs ${selectedGrade === g ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>Lớp {g}</button>
            ))}
          </div>
          <button type="submit" className="w-full py-5 bg-rose-500 text-white rounded-2xl text-xl font-black shadow-xl hover:scale-95 transition-all">Vào học ngay!</button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
