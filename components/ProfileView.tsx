
import React, { useState, useRef } from 'react';
import { User, StudyStats, Badge } from '../types';

interface Props {
  user: User;
  stats: StudyStats;
  onUpdateUser: (updatedUser: User) => void;
  onBack: () => void;
}

const ProfileView: React.FC<Props> = ({ user, stats, onUpdateUser, onBack }) => {
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState(user.name);
  const [previewUrl, setPreviewUrl] = useState(user.avatar);
  const [selectedDayInfo, setSelectedDayInfo] = useState<{date: string, seconds: number} | null>(null);
  const [dailyGoal, setDailyGoal] = useState(user.preferences?.dailyGoal || 10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const badges: Badge[] = [
    { id: '1', name: 'Mầm Non', icon: '🌱', description: 'Học 10 từ đầu tiên', unlocked: stats.totalLearned >= 10 },
    { id: '2', name: 'Chiến Binh 3 Ngày', icon: '🔥', description: 'Đạt chuỗi 3 ngày học', unlocked: stats.streak >= 3 },
    { id: '3', name: 'Nhà Thông Thái', icon: '🦉', description: 'Học 50 từ vựng', unlocked: stats.totalLearned >= 50 },
    { id: '4', name: 'Cỗ Máy Thời Gian', icon: '⏳', description: 'Học trên 1 giờ', unlocked: stats.totalSeconds >= 3600 },
    { id: '5', name: 'Siêu Cấp VIP', icon: '👑', description: 'Đạt chuỗi 7 ngày học', unlocked: stats.streak >= 7 },
  ];

  const handleSaveAvatar = () => {
    onUpdateUser({
      ...user,
      avatar: previewUrl
    });
    setIsEditingAvatar(false);
  };

  const handleUpdateGoal = (val: number) => {
    setDailyGoal(val);
    onUpdateUser({
      ...user,
      preferences: {
        ...(user.preferences || { reminders: true, soundEnabled: true }),
        dailyGoal: val
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ảnh nặng quá bé ơi! Bé chọn ảnh nào nhỏ hơn 2MB nhé.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomAvatar = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setAvatarSeed(newSeed);
    setPreviewUrl(`https://api.dicebear.com/7.x/adventurer/svg?seed=${newSeed}`);
  };

  const formatTime = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs} giây`;
  };

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toLocaleDateString();
    const historyItem = stats.history.find(h => h.date === dateStr);
    return {
      date: dateStr,
      seconds: historyItem ? historyItem.seconds : 0,
      displayDate: d.getDate() + '/' + (d.getMonth() + 1)
    };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-10">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-orange-500 transition-colors">
          <i className="fas fa-arrow-left"></i>
        </button>
        <h2 className="text-2xl font-black text-slate-900">Hồ sơ cá nhân</h2>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-[2.5rem] p-8 border-4 border-orange-100 shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[5rem] -z-0"></div>
        
        <div className="relative z-10">
          <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-orange-100">
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <button 
            onClick={() => {
              setPreviewUrl(user.avatar);
              setIsEditingAvatar(true);
            }}
            className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-all"
          >
            <i className="fas fa-camera text-xs"></i>
          </button>
        </div>

        <div className="text-center md:text-left z-10 space-y-2">
          <h3 className="text-4xl font-black text-slate-900 leading-tight">{user.name}</h3>
          <p className="text-slate-400 font-bold">{user.email || 'Học viên nhí tài năng'}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
            <div className="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl font-black text-xs flex items-center gap-2">
              <i className="fas fa-fire"></i> {stats.streak} Ngày liên tiếp
            </div>
            <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-xs flex items-center gap-2">
              <i className="fas fa-award"></i> {badges.filter(b => b.unlocked).length} Huy hiệu
            </div>
          </div>
        </div>
      </div>

      {/* Goal Settings */}
      <div className="bg-white rounded-[2.5rem] p-8 border-2 border-orange-50 shadow-sm">
        <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <i className="fas fa-bullseye text-rose-500"></i>
          Mục tiêu hàng ngày
        </h4>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-600">Số từ mới muốn học mỗi ngày:</span>
            <span className="text-2xl font-black text-orange-500">{dailyGoal} từ</span>
          </div>
          <input 
            type="range" 
            min="2" 
            max="30" 
            step="1"
            value={dailyGoal}
            onChange={(e) => handleUpdateGoal(parseInt(e.target.value))}
            className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
             <span>Nhẹ nhàng (2 từ)</span>
             <span>Vừa sức</span>
             <span>Chăm chỉ (30 từ)</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border-2 border-orange-50 shadow-sm text-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đã học</span>
          <p className="text-4xl font-black text-orange-500 mt-2">{stats.totalLearned}</p>
          <p className="text-xs font-bold text-slate-400 mt-1">Từ vựng</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border-2 border-orange-50 shadow-sm text-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng thời gian</span>
          <p className="text-2xl font-black text-blue-500 mt-2">{formatTime(stats.totalSeconds)}</p>
          <p className="text-xs font-bold text-slate-400 mt-1">Tích lũy</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border-2 border-orange-50 shadow-sm text-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Điểm Quiz</span>
          <p className="text-4xl font-black text-emerald-500 mt-2">{stats.quizScore}</p>
          <p className="text-xs font-bold text-slate-400 mt-1">Cao nhất</p>
        </div>
      </div>

      {/* Nhật ký học tập */}
      <div className="bg-white rounded-[2.5rem] p-8 border-2 border-orange-50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <i className="fas fa-calendar-alt text-orange-400"></i>
            Nhật ký chăm chỉ
          </h4>
          {selectedDayInfo && (
            <div className="bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-black animate-scaleIn">
              Ngày {selectedDayInfo.date}: {formatTime(selectedDayInfo.seconds)}
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {last14Days.map((day, idx) => {
            const opacity = day.seconds === 0 ? 'bg-slate-100' : 
                            day.seconds < 60 ? 'bg-orange-200' :
                            day.seconds < 300 ? 'bg-orange-400' : 'bg-orange-600';
            
            return (
              <button
                key={idx}
                onClick={() => setSelectedDayInfo(day)}
                className={`w-12 h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all hover:scale-110 active:scale-90 ${opacity} ${selectedDayInfo?.date === day.date ? 'ring-4 ring-blue-400 ring-offset-2' : ''}`}
              >
                <span className={`text-[8px] font-black uppercase ${day.seconds > 60 ? 'text-white/80' : 'text-slate-400'}`}>
                  {day.displayDate.split('/')[0]}
                </span>
                <span className={`text-[8px] font-black uppercase ${day.seconds > 60 ? 'text-white/80' : 'text-slate-400'}`}>
                  Th.{day.displayDate.split('/')[1]}
                </span>
                {day.seconds > 0 && <i className="fas fa-check-circle text-[10px] text-white"></i>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-white rounded-[2.5rem] p-8 border-2 border-orange-50 shadow-sm">
        <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <i className="fas fa-trophy text-yellow-400"></i>
          Bộ sưu tập huy hiệu
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {badges.map(badge => (
            <div key={badge.id} className={`flex flex-col items-center text-center p-4 rounded-2xl transition-all ${badge.unlocked ? 'opacity-100 grayscale-0' : 'opacity-40 grayscale italic'}`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-inner ${badge.unlocked ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-slate-100 border-2 border-slate-200'}`}>
                {badge.icon}
              </div>
              <p className="text-xs font-black text-slate-800 leading-tight">{badge.name}</p>
              <p className="text-[9px] font-bold text-slate-400 mt-1">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Avatar Edit Modal */}
      {isEditingAvatar && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 animate-scaleIn shadow-2xl border-4 border-orange-400">
            <h3 className="text-xl font-black text-slate-900 text-center mb-6">Thay đổi ảnh đại diện</h3>
            
            <div className="w-32 h-32 bg-orange-50 rounded-[2rem] mx-auto mb-8 flex items-center justify-center overflow-hidden border-4 border-orange-100 shadow-inner relative group">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                 <i className="fas fa-sync text-white text-xl"></i>
              </div>
            </div>

            <div className="space-y-3">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
              >
                <i className="fas fa-upload"></i> Tải ảnh từ máy bé
              </button>

              <div className="relative py-2 flex items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase">Hoặc biến hình</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={avatarSeed}
                  onChange={(e) => {
                    setAvatarSeed(e.target.value);
                    setPreviewUrl(`https://api.dicebear.com/7.x/adventurer/svg?seed=${e.target.value}`);
                  }}
                  placeholder="Tên biến hình..."
                  className="flex-1 p-3 bg-orange-50 border-2 border-orange-100 rounded-xl font-bold outline-none focus:border-orange-500 text-sm"
                />
                <button 
                  onClick={generateRandomAvatar}
                  className="p-3 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-all"
                  title="Ngẫu nhiên"
                >
                  <i className="fas fa-random"></i>
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsEditingAvatar(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-sm">Hủy</button>
              <button onClick={handleSaveAvatar} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-black text-sm shadow-lg shadow-orange-200">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
