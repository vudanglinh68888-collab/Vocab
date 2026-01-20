
import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  words: VocabularyItem[];
  title: string;
  onReviewComplete: (id: string, quality: number) => void;
  onPause: (paused: boolean) => void;
  onExit: () => void;
}

const ReviewSection: React.FC<Props> = ({ words, title, onReviewComplete, onPause, onExit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [userMeaningInput, setUserMeaningInput] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [checkResult, setCheckResult] = useState<'none' | 'correct' | 'incorrect'>('none');

  if (words.length === 0) {
    return (
      <div className="bg-white p-12 rounded-[2.5rem] border-4 border-orange-100 text-center shadow-xl">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          <i className="fas fa-check-circle"></i>
        </div>
        <h2 className="text-2xl font-black text-slate-800">Bé giỏi quá!</h2>
        <p className="text-slate-500 mt-2">Hiện tại không còn từ nào cần ôn tập nữa.</p>
        <button onClick={onExit} className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-xl font-bold">Về trang chủ</button>
      </div>
    );
  }

  const current = words[currentIdx];

  const handlePauseToggle = () => {
    const newState = !isPaused;
    setIsPaused(newState);
    onPause(newState);
  };

  const handleCheckMeaning = () => {
    const normalizedInput = userMeaningInput.toLowerCase().trim();
    const normalizedCorrect = current.vietnameseDefinition.toLowerCase().trim();
    
    // Simple check: if input is part of definition or vice versa
    if (normalizedInput && (normalizedCorrect.includes(normalizedInput) || normalizedInput.includes(normalizedCorrect))) {
      setCheckResult('correct');
      setIsRevealed(true);
    } else {
      setCheckResult('incorrect');
      // Still reveal to let them see
      setIsRevealed(true);
    }
  };

  const handleRating = (quality: number) => {
    onReviewComplete(current.id, quality);
    if (currentIdx < words.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setIsRevealed(false);
      setUserMeaningInput('');
      setCheckResult('none');
    } else {
      onExit();
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setIsRevealed(false);
      setUserMeaningInput('');
      setCheckResult('none');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
      {/* Navigation Buttons */}
      <div className="flex justify-between items-center bg-white p-3 rounded-2xl border-2 border-orange-100 shadow-sm">
         <button onClick={handleBack} disabled={currentIdx === 0} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl font-black text-[10px] uppercase disabled:opacity-30">
            <i className="fas fa-chevron-left"></i> Quay lại
         </button>
         <button onClick={handlePauseToggle} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${isPaused ? 'bg-amber-100 text-amber-600' : 'text-slate-500 hover:bg-slate-50'}`}>
            <i className={`fas ${isPaused ? 'fa-play' : 'fa-pause'}`}></i> {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
         </button>
         <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-xl font-black text-[10px] uppercase">
            <i className="fas fa-stop"></i> Dừng học
         </button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-black text-slate-900 leading-none">{title}</h2>
        <p className="text-slate-400 mt-2 font-bold uppercase text-[9px] tracking-widest">{currentIdx + 1} / {words.length} từ</p>
      </div>

      <div className={`bg-white rounded-[2.5rem] border-4 border-orange-100 shadow-xl overflow-hidden flex flex-col min-h-[450px] relative transition-all ${isPaused ? 'blur-md pointer-events-none grayscale' : ''}`}>
        <div className="flex-grow p-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Từ vựng</span>
            <h3 className="text-5xl font-black text-slate-900">{current.word}</h3>
            <p className="text-slate-400 font-mono font-bold text-sm">/{current.ipa}/</p>
          </div>
          
          <div className="w-full space-y-4">
            {!isRevealed ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase text-left block ml-4">Nghĩa tiếng Việt là gì bé nhỉ?</label>
                  <input 
                    type="text"
                    value={userMeaningInput}
                    onChange={(e) => setUserMeaningInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheckMeaning()}
                    placeholder="Gõ nghĩa vào đây..."
                    className="w-full p-4 bg-orange-50 border-2 border-orange-100 rounded-2xl text-center font-bold text-slate-800 outline-none focus:border-orange-500"
                  />
                </div>
                <button 
                  onClick={handleCheckMeaning}
                  disabled={!userMeaningInput.trim()}
                  className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black shadow-lg disabled:opacity-50"
                >
                  Kiểm tra đáp án
                </button>
                <button onClick={() => setIsRevealed(true)} className="text-[10px] font-black text-slate-400 uppercase hover:text-orange-500 transition-colors">Em không nhớ, xem luôn!</button>
              </div>
            ) : (
              <div className="w-full animate-fadeIn space-y-6">
                 <div className={`p-6 rounded-3xl border-2 transition-all ${checkResult === 'correct' ? 'bg-emerald-50 border-emerald-200' : checkResult === 'incorrect' ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                       {checkResult === 'correct' && <span className="text-emerald-600 font-black text-xs uppercase"><i className="fas fa-check"></i> Đúng rồi!</span>}
                       {checkResult === 'incorrect' && <span className="text-rose-600 font-black text-xs uppercase"><i className="fas fa-times"></i> Chưa chính xác</span>}
                    </div>
                    <p className="text-2xl font-black text-slate-900">{current.vietnameseDefinition}</p>
                    <p className="mt-3 text-slate-500 text-xs italic leading-relaxed">"{current.example}"</p>
                 </div>
                 
                 <div className="space-y-4 pt-2">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bé thấy từ này thế nào?</p>
                   <div className="grid grid-cols-3 gap-2">
                     <button onClick={() => handleRating(0)} className="py-3 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase shadow-md shadow-rose-200">Quên</button>
                     <button onClick={() => handleRating(1)} className="py-3 bg-orange-500 text-white rounded-xl font-black text-[10px] uppercase shadow-md shadow-orange-200">Bình thường</button>
                     <button onClick={() => handleRating(2)} className="py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase shadow-md shadow-emerald-200">Dễ ợt!</button>
                   </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isPaused && (
        <div className="fixed inset-0 z-[100] bg-orange-500/80 backdrop-blur-sm flex items-center justify-center p-6 text-center text-white">
           <div className="animate-scaleIn space-y-6">
              <div className="text-8xl">☕</div>
              <h2 className="text-4xl font-black">Đang tạm nghỉ...</h2>
              <p className="font-bold opacity-80">Gấu Tutor cũng đang uống trà, bé nghỉ tí rồi học tiếp nhé!</p>
              <button 
                onClick={handlePauseToggle}
                className="px-10 py-4 bg-white text-orange-600 rounded-2xl text-xl font-black shadow-2xl hover:scale-105 transition-all"
              >
                Tiếp tục học thôi!
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
