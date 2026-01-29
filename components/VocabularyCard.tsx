
import React, { useState } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  item: VocabularyItem;
  onToggleMastered?: (id: string) => void;
}

const VocabularyCard: React.FC<Props> = ({ item, onToggleMastered }) => {
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string, score: number | null }>({ text: '', score: null });

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => { setIsListening(true); setFeedback({ text: 'Mẹ đang nghe...', score: null }); };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      const score = transcript.includes(item.word.toLowerCase()) ? 100 : 50;
      setFeedback({ 
        text: score >= 80 ? 'Nở to hơn nở rộ rồi! Chuẩn lắm con!' : 'Nở rộ nở to hơn rồi. Cẩn thận! Phát âm lại mẹ nghe.', 
        score 
      });
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className={`bg-white rounded-[3rem] shadow-2xl border-4 overflow-hidden transition-all duration-500 ${item.isMastered ? 'border-emerald-200' : 'border-rose-100'}`}>
      <div className={`${item.isMastered ? 'bg-emerald-500' : 'bg-rose-500'} p-10 text-white`}>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">Lớp {item.grade}</span>
            <h2 className="text-6xl font-black tracking-tight">{item.word}</h2>
            <p className="font-mono text-xl opacity-80">/{item.ipa}/</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => speak(item.word)} className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center hover:bg-white/40 shadow-lg"><i className="fas fa-volume-up text-2xl"></i></button>
            <button onClick={startListening} className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-white/20 hover:bg-white/40'}`}><i className="fas fa-microphone text-2xl"></i></button>
          </div>
        </div>
      </div>
      
      {feedback.text && (
        <div className={`px-10 py-5 font-black text-center animate-fadeIn ${feedback.score && feedback.score >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {feedback.text}
        </div>
      )}

      <div className="p-10 space-y-10">
        <div>
          <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Nghĩa từ vựng:</h4>
          <p className="text-4xl font-black text-slate-800 leading-tight mb-2">{item.vietnameseDefinition}</p>
          <p className="text-slate-500 italic text-lg leading-relaxed">{item.definition}</p>
        </div>
        <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border-l-8 border-indigo-400">
           <div className="flex justify-between items-center mb-4">
             <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Câu ví dụ:</h4>
             <button onClick={() => speak(item.example)} className="w-10 h-10 bg-indigo-100 text-indigo-500 rounded-xl flex items-center justify-center"><i className="fas fa-play text-xs"></i></button>
           </div>
           <p className="text-slate-700 font-bold text-xl leading-relaxed">"{item.example}"</p>
        </div>
        <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100">
          <h4 className="text-[10px] font-black text-amber-600 uppercase mb-2">Mẹ dặn cách nhớ:</h4>
          <p className="text-slate-700 font-black italic text-lg leading-relaxed">"{item.mnemonicHint}"</p>
        </div>
      </div>
    </div>
  );
};

export default VocabularyCard;
