
import React, { useState, useRef } from 'react';
import { User, StudyStats, VirtualGift, VocabularyItem, ReadingPassage } from '../types';
import { generateAIAvatar } from '../geminiService';

interface Props {
  user: User;
  stats: StudyStats;
  vocabList: VocabularyItem[];
  passages: ReadingPassage[];
  currentTodayIdx: number;
  onUpdateUser: (updatedUser: User) => void;
  onImportData: (data: any) => void;
  onBack: () => void;
  onLogout?: () => void;
}

const ProfileView: React.FC<Props> = ({ 
  user, stats, vocabList, passages, currentTodayIdx, 
  onUpdateUser, onImportData, onBack, onLogout 
}) => {
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState(user.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString();
    const historyItem = stats.history.find(h => h.date === dateStr);
    return {
      label: d.getDate() + '/' + (d.getMonth() + 1),
      seconds: historyItem ? historyItem.seconds : 0
    };
  });

  const maxSeconds = Math.max(...last7Days.map(d => d.seconds), 60);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const handleSaveAvatar = () => {
    onUpdateUser({ ...user, avatar: previewUrl });
    setIsEditingAvatar(false);
  };

  const handleGenerateAI = async () => {
    if (!aiDescription.trim()) return;
    setIsAIGenerating(true);
    try {
      const url = await generateAIAvatar(aiDescription);
      setPreviewUrl(url);
    } catch (err) {
      alert("Mẹ vẽ chưa xong rồi, con thử lại nhé!");
    } finally {
      setIsAIGenerating(false);
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      vocabList,
      stats,
      passages,
      currentTodayIdx,
      grade: user.grade,
      userPreferences: user.preferences,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HanhTrang_MeChienGion_${user.name}_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData.vocabList && importedData.stats) {
          if (window.confirm("Mẹ chiên giòn hỏi: Con muốn nạp hành trang cũ vào không? Dữ liệu hiện tại sẽ bị thay thế nhé!")) {
            onImportData(importedData);
            alert("Đã nạp hành trang thành công! Giỏi hơn Cún gián rồi!");
          }
        } else {
          alert("Tệp này không phải hành trang của Mẹ chiên giòn rồi con ơi!");
        }
      } catch (err) {
        alert("Lỗi đọc tệp rồi, con kiểm tra lại nhé!");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-10">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-rose-500 font-black flex items-center gap-2"><i className="fas fa-arrow-left"></i> Quay lại</button>
        <h2 className="text-2xl font-black text-slate-900 text-center flex-1">Thành tích của con yêu</h2>
        {onLogout && <button onClick={onLogout} className="text-xs font-black text-slate-400">Đăng xuất</button>}
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-[2.5rem] p-8 border-4 border-rose-100 shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-rose-50 rounded-full blur-3xl opacity-50"></div>
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative z-10 transition-transform group-hover:scale-105">
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <button 
            onClick={() => setIsEditingAvatar(true)} 
            className="absolute -bottom-3 -right-3 w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-xl z-20 hover:bg-rose-600 transition-colors"
          >
            <i className="fas fa-magic"></i>
          </button>
        </div>
        <div className="text-center md:text-left relative z-10 flex-1">
          <h3 className="text-4xl font-black text-slate-900 mb-2">{user.name}</h3>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="px-4 py-1.5 bg-rose-50 text-rose-500 rounded-full text-xs font-black uppercase border border-rose-100">Lớp {user.grade}</span>
            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-500 rounded-full text-xs font-black uppercase border border-indigo-100">
               Lộ trình {stats.currentTrack}
            </span>
            <span className="px-4 py-1.5 bg-yellow-50 text-yellow-600 rounded-full text-xs font-black uppercase border border-yellow-100">
               🔥 Streak: {stats.streak} ngày
            </span>
          </div>
        </div>
        
        {/* Export/Import Buttons */}
        <div className="flex flex-col gap-2 relative z-10">
           <button 
            onClick={handleExportData}
            className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-600 transition-all active:scale-95"
           >
             <i className="fas fa-cloud-download-alt"></i> Cất giữ hành trang
           </button>
           <button 
            onClick={handleImportClick}
            className="px-6 py-3 bg-slate-800 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-slate-700 transition-all active:scale-95"
           >
             <i className="fas fa-folder-open"></i> Mở túi hành trang
           </button>
           <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
           />
        </div>
      </div>

      {/* 7-Day Chart */}
      <div className="bg-white rounded-[2.5rem] p-8 border-2 border-rose-50 shadow-sm">
        <h4 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3"><i className="fas fa-chart-bar text-indigo-500"></i> Sự chăm chỉ 7 ngày qua</h4>
        <div className="flex items-end justify-between gap-2 h-48 px-4">
          {last7Days.map((day, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
              <div className="text-[9px] font-black text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{formatTime(day.seconds)}</div>
              <div 
                className={`w-full max-w-[40px] rounded-t-xl transition-all duration-1000 ${day.seconds > 0 ? 'bg-indigo-400' : 'bg-slate-100'}`} 
                style={{ height: `${(day.seconds / maxSeconds) * 100}%`, minHeight: '8px' }}
              ></div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{day.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gifts Bag */}
      <div className="bg-white rounded-[2.5rem] p-8 border-2 border-amber-100 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-50 rounded-full blur-3xl"></div>
        <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 relative z-10"><i className="fas fa-gift text-rose-500"></i> Túi quà Mẹ tặng con ({stats.unlockedGifts.length})</h4>
        {stats.unlockedGifts.length === 0 ? (
          <p className="text-slate-400 font-bold italic py-10 text-center">Con chăm học bài mẹ sẽ tặng quà nhé! Gà ơi cố lên 🐣</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 relative z-10">
            {stats.unlockedGifts.map(gift => (
              <div key={gift.id} className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-white rounded-[1.5rem] border-2 border-amber-100 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform group-hover:rotate-6">{gift.icon}</div>
                <p className="text-[10px] font-black text-slate-800 mt-2 text-center leading-tight">{gift.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Avatar AI Modal */}
      {isEditingAvatar && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 animate-scaleIn shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-900">Xưởng vẽ của Mẹ</h3>
              <button onClick={() => setIsEditingAvatar(false)} className="text-slate-400 hover:text-rose-500"><i className="fas fa-times-circle text-2xl"></i></button>
            </div>
            <div className="space-y-6">
               <div className="relative mx-auto w-48 h-48">
                  <div className="w-48 h-48 rounded-[3rem] overflow-hidden border-8 border-rose-50 shadow-inner flex items-center justify-center bg-slate-50 relative">
                    {isAIGenerating && (
                      <div className="absolute inset-0 z-20 bg-white/50 flex flex-col items-center justify-center gap-2">
                         <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                         <p className="text-[10px] font-black text-rose-500 animate-pulse">ĐANG VẼ...</p>
                      </div>
                    )}
                    <img src={previewUrl} className="w-full h-full object-cover" />
                  </div>
               </div>
               <div className="bg-rose-50 p-6 rounded-[2rem] border-2 border-rose-100 space-y-4">
                  <h4 className="text-xs font-black text-rose-600 uppercase flex items-center gap-2"><i className="fas fa-magic"></i> Mẹ vẽ con như thế nào nhỉ?</h4>
                  <textarea 
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    placeholder="Ví dụ: Một bạn nhỏ dũng cảm cưỡi kỳ lân, mặc áo choàng siêu nhân đỏ rực..."
                    className="w-full p-4 rounded-2xl border-2 border-white focus:border-rose-400 outline-none text-sm font-bold resize-none h-24"
                  />
                  <button 
                    onClick={handleGenerateAI}
                    disabled={isAIGenerating || !aiDescription.trim()}
                    className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black shadow-lg hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <i className="fas fa-palette"></i> {isAIGenerating ? 'Mẹ đang vẽ rồi...' : 'Vẽ cho con một bức thật đẹp!'}
                  </button>
               </div>
               <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsEditingAvatar(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-slate-500 hover:bg-slate-200">Hủy bỏ</button>
                  <button onClick={handleSaveAvatar} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all">Dùng ảnh này</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
