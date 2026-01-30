
import React, { useRef } from 'react';

interface Props {
  onContinue: () => void;
  onImport: (data: any) => void;
}

const WelcomeView: React.FC<Props> = ({ onContinue, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData.user && importedData.stats) {
          onImport(importedData);
        } else {
          alert("Tệp hành trang này không đúng định dạng rồi bé ơi!");
        }
      } catch (err) {
        alert("Có lỗi khi đọc tệp hành trang. Con kiểm tra lại nhé!");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-rose-200 rounded-full blur-[100px] opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-200 rounded-full blur-[100px] opacity-50"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 border-8 border-white text-center space-y-10 animate-scaleIn relative z-10">
        <div className="space-y-4">
          <div className="text-8xl animate-bounce">🎒</div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Mẹ chiên giòn</h1>
          <p className="text-slate-500 font-bold">Chào mừng con quay trở lại!</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={onContinue}
            className="w-full py-5 bg-rose-500 text-white rounded-2xl text-xl font-black shadow-xl hover:bg-rose-600 hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            <i className="fas fa-play"></i> Tiếp tục học
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-black tracking-widest">Hoặc</span>
            </div>
          </div>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-5 bg-white text-indigo-600 border-2 border-indigo-100 rounded-2xl text-lg font-black shadow-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-3"
          >
            <i className="fas fa-cloud-upload-alt"></i> Nạp hành trang cũ
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

        <p className="text-xs text-slate-400 font-bold px-4">
          *Chọn "Nạp hành trang" nếu con học trên máy khác hoặc muốn khôi phục dữ liệu từ file đã lưu.
        </p>
      </div>
    </div>
  );
};

export default WelcomeView;
