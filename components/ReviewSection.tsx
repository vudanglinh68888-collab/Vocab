
import React, { useState } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  words: VocabularyItem[];
  title: string;
  onResult: (id: string, success: boolean) => void;
  onComplete: () => void;
}

const ReviewSection: React.FC<Props> = ({ words, title, onResult, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);

  const current = words[currentIdx];

  const handleAction = (success: boolean) => {
    onResult(current.id, success);
    if (currentIdx < words.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setUserInput('');
      setIsRevealed(false);
    } else {
      onComplete();
    }
  };

  if (words.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-3xl font-serif font-black text-slate-900">{title}</h2>
        <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{currentIdx + 1} of {words.length} items</span>
            <div className="h-1.5 w-32 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all" style={{ width: `${((currentIdx + 1) / words.length) * 100}%` }}></div>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden min-h-[450px] flex flex-col relative">
        <div className="absolute top-8 left-8">
            <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Level {current.srsLevel}
            </span>
        </div>
        
        <div className="flex-grow p-12 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6">Target Vocabulary</span>
          <h3 className="text-6xl font-serif font-black text-slate-900 mb-8 tracking-tight">{current.word}</h3>
          <p className="text-slate-400 text-sm italic mb-10">"{current.example}"</p>
          
          {!isRevealed ? (
            <div className="w-full space-y-6">
               <div className="relative">
                 <input 
                   type="text"
                   autoFocus
                   placeholder="Nhập nghĩa tiếng Việt..."
                   value={userInput}
                   onChange={(e) => setUserInput(e.target.value)}
                   className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-center text-xl font-bold focus:border-indigo-500 outline-none transition-all placeholder:text-slate-200"
                   onKeyDown={(e) => { if (e.key === 'Enter') setIsRevealed(true); }}
                 />
               </div>
               <button 
                 onClick={() => setIsRevealed(true)}
                 className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all"
               >
                 Check Meaning
               </button>
            </div>
          ) : (
            <div className="w-full animate-bounceIn space-y-8">
               <div className="p-10 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 shadow-inner">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-2">Vietnamese Translation</span>
                  <p className="text-4xl font-black text-slate-900">{current.vietnameseDefinition}</p>
                  <div className="mt-4 pt-4 border-t border-indigo-100/50">
                    <p className="text-slate-600 italic text-sm">{current.definition}</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => handleAction(false)}
                   className="py-5 bg-white border-2 border-rose-100 text-rose-600 rounded-3xl font-black hover:bg-rose-50 transition-all flex flex-col items-center gap-1"
                 >
                   <span className="text-xs">FORGOT</span>
                   <span className="text-[10px] opacity-60">Review in 1 Day</span>
                 </button>
                 <button 
                   onClick={() => handleAction(true)}
                   className="py-5 bg-emerald-600 text-white rounded-3xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex flex-col items-center gap-1"
                 >
                   <span className="text-xs">REMEMBERED</span>
                   <span className="text-[10px] opacity-60">Level Up!</span>
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
