
import React, { useState } from 'react';
import { User } from '../types';

interface Props {
  onLogin: (user: User, grade: number) => void;
}

const LoginView: React.FC<Props> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number>(2);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: '', // Để trống vì đã bỏ yêu cầu email
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
      status: 'online'
    }, selectedGrade);
  };

  const grades = [2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="min-h-screen bg-orange-500 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-[-5%] left-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 md:p-14 relative z-10 animate-scaleIn border-8 border-orange-400">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-100 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner rotate-3">
             🎨
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kid<span className="text-orange-500">English</span></h1>
          <p className="text-slate-500 font-bold mt-2 leading-relaxed">Khám phá 5000 từ vựng kỳ thú cùng Gấu Tutor!</p>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tên của bé là gì?</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Bé Bo, Nam, Linh..."
              className="w-full p-4 bg-orange-50 border-2 border-orange-100 rounded-2xl text-lg font-bold text-slate-800 focus:border-orange-500 outline-none transition-all placeholder-slate-300"
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
                  className={`py-3 rounded-xl font-black text-sm transition-all border-b-4 ${
                    selectedGrade === g 
                      ? 'bg-orange-500 text-white border-orange-700 scale-105' 
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-orange-50 hover:text-orange-400'
                  }`}
                >
                  Lớp {g}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-orange-500 text-white rounded-2xl text-xl font-black shadow-xl hover:bg-orange-600 active:scale-95 transition-all shadow-orange-500/30"
          >
            Vào học ngay thôi!
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 opacity-30 grayscale">
            <i className="fas fa-shield-alt text-xs"></i>
            <p className="text-[9px] font-bold uppercase tracking-widest">Dữ liệu được lưu trên máy này</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
