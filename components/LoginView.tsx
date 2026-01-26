
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
  const [selectedGrade, setSelectedGrade] = useState<number>(2);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);

  useEffect(() => {
    // Quét localStorage để tìm các hồ sơ đã lưu dựa trên tiền tố 'kid-db-'
    const profiles: SavedProfile[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('kid-db-')) {
        try {
          const rawData = localStorage.getItem(key);
          if (!rawData) continue;
          
          const data = JSON.parse(rawData);
          const profileName = key.replace('kid-db-', '');
          
          // Chuẩn hóa tên để hiển thị (chữ cái đầu viết hoa)
          const displayName = profileName.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
          
          profiles.push({
            name: displayName,
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${profileName}`,
            grade: data.grade || 2
          });
        } catch (e) {
          console.error("Lỗi phân tích hồ sơ:", e);
        }
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
      preferences: {
        dailyGoal: 10,
        reminders: true,
        soundEnabled: true
      }
    }, selectedGrade);
  };

  const selectExistingProfile = (profile: SavedProfile) => {
    onLogin({
      id: `u-${Date.now()}`,
      name: profile.name,
      email: '',
      avatar: profile.avatar,
      status: 'online',
      preferences: {
        dailyGoal: 10,
        reminders: true,
        soundEnabled: true
      }
    }, profile.grade);
  };

  const grades = [2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="min-h-screen bg-orange-500 flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute top-[-5%] left-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-10 md:p-12 relative z-10 animate-scaleIn border-8 border-orange-400">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner rotate-3">
             🎨
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kid<span className="text-orange-500">English</span></h1>
          <p className="text-slate-500 font-bold mt-1 text-sm">Chào mừng các bé đến với thế giới từ vựng!</p>
        </div>

        {savedProfiles.length > 0 && (
          <div className="mb-10">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Bé chọn hồ sơ của mình nhé:</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {savedProfiles.map((profile, i) => (
                <button
                  key={i}
                  onClick={() => selectExistingProfile(profile)}
                  className="flex flex-col items-center gap-2 group transition-all"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-100 group-hover:border-orange-500 group-hover:scale-110 shadow-sm transition-all bg-orange-50">
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-black text-slate-700 group-hover:text-orange-600">{profile.name}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-[9px] font-black text-slate-300 uppercase">Hoặc tạo bé mới</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>
          </div>
        )}

        <form onSubmit={handleStart} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tên bé là gì nhỉ?</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên để bắt đầu..."
              className="w-full p-4 bg-orange-50 border-2 border-orange-100 rounded-2xl text-lg font-bold text-slate-800 focus:border-orange-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Bé đang học lớp mấy?</label>
            <div className="grid grid-cols-4 gap-2">
              {grades.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGrade(g)}
                  className={`py-3 rounded-xl font-black text-xs transition-all border-b-4 ${
                    selectedGrade === g 
                      ? 'bg-orange-500 text-white border-orange-700 scale-105' 
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-orange-50'
                  }`}
                >
                  Lớp {g}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-orange-500 text-white rounded-2xl text-xl font-black shadow-xl hover:bg-orange-600 transition-all shadow-orange-500/30 active:scale-95"
          >
            Vào học ngay!
          </button>
        </form>

        <p className="mt-8 text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">
          Dữ liệu của mỗi bé được lưu trữ riêng biệt trên máy này
        </p>
      </div>
    </div>
  );
};

export default LoginView;
