
import React, { useState } from 'react';
import { ReadingPassage } from '../types';

interface ReadingCardProps {
  passage: ReadingPassage;
}

const ReadingCard: React.FC<ReadingCardProps> = ({ passage }) => {
  const [showVi, setShowVi] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const speakPassage = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(passage.contentEn);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    
    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-xl font-serif font-black text-slate-900 tracking-tight">
          <i className="fas fa-book-open text-indigo-500 mr-3"></i>
          {passage.title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={speakPassage}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isReading ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
            title={isReading ? "Dừng đọc" : "Đọc mẩu chuyện"}
          >
            <i className={`fas ${isReading ? 'fa-stop' : 'fa-volume-up'}`}></i>
          </button>
          <button
            onClick={() => setShowVi(!showVi)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              showVi ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {showVi ? 'Hide Translation' : 'Show Translation'}
          </button>
        </div>
      </div>
      <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className={`${isReading ? 'ring-2 ring-indigo-100 rounded-2xl p-4 transition-all' : ''}`}>
          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">English Version</h4>
          <p className="text-lg text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
            {passage.contentEn}
          </p>
        </div>
        <div className={`transition-all duration-500 ${showVi ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none absolute'}`}>
          <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4">Vietnamese Version</h4>
          <p className="text-lg text-slate-600 leading-relaxed italic whitespace-pre-wrap">
            {passage.contentVi}
          </p>
        </div>
        {!showVi && (
            <div className="hidden lg:flex items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <div className="text-center p-8">
                    <i className="fas fa-language text-4xl text-slate-200 mb-4"></i>
                    <p className="text-slate-400 font-bold">Click button to reveal translation</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

interface ReadingSectionProps {
  passages: ReadingPassage[];
}

const ReadingSection: React.FC<ReadingSectionProps> = ({ passages }) => {
  if (passages.length === 0) return null;

  return (
    <div className="mt-16 animate-fadeIn">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-serif font-black text-slate-900 mb-3">Luyện đọc mẩu chuyện</h2>
        <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
        <p className="text-slate-500 mt-4 max-w-2xl mx-auto font-medium">
          Áp dụng từ vựng mới học vào các câu chuyện ngắn vui nhộn để ghi nhớ lâu hơn.
        </p>
      </div>
      <div className="space-y-8">
        {passages.map((p, i) => (
          <ReadingCard key={i} passage={p} />
        ))}
      </div>
    </div>
  );
};

export default ReadingSection;
