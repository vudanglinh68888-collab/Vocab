
import React, { useState } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  item: VocabularyItem;
  onToggleMastered: (id: string) => void;
}

const VocabularyCard: React.FC<Props> = ({ item, onToggleMastered }) => {
  const [isListening, setIsListening] = useState(false);
  const [isReadingSentence, setIsReadingSentence] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string, score: number | null }>({ text: '', score: null });

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Máy của con chưa hỗ trợ đọc giọng nói rồi!");
    }
  };

  const calculateReadingScore = (target: string, transcript: string) => {
    const targetWords = target.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/);
    const transcriptWords = transcript.toLowerCase().split(/\s+/);
    
    let matches = 0;
    targetWords.forEach(word => {
      if (transcriptWords.includes(word)) matches++;
    });
    
    return Math.round((matches / targetWords.length) * 100);
  };

  const startListening = (isSentence: boolean = false) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt này chưa hỗ trợ Mẹ nghe con nói. Con thử dùng Chrome nhé!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.continuous = false;
      
      recognition.onstart = () => {
        if (isSentence) setIsReadingSentence(true);
        else setIsListening(true);
        setFeedback({ text: 'Mẹ chiên giòn đang nghe con đây...', score: null });
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const target = isSentence ? item.example : item.word;
        const score = calculateReadingScore(target, transcript);
        
        setFeedback({ 
          text: score >= 80 
            ? `Nở to hơn nở rộ rồi! (Điểm: ${score}/100) - "${transcript}"` 
            : `Nở rộ nở to hơn rồi. Cẩn thận! (Điểm: ${score}/100) - Con nói là: "${transcript}"`, 
          score 
        });
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setFeedback({ text: 'Mẹ chưa nghe rõ, con nói lại nhé!', score: 0 });
        setIsListening(false);
        setIsReadingSentence(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsReadingSentence(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
      setIsReadingSentence(false);
    }
  };

  return (
    <div className={`bg-white rounded-[3rem] shadow-2xl border-4 overflow-hidden transition-all duration-500 ${item.isMastered ? 'border-emerald-200' : 'border-rose-100'}`}>
      <div className={`${item.isMastered ? 'bg-emerald-500' : 'bg-rose-500'} p-10 text-white relative`}>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">Lớp {item.grade} • {item.topic}</span>
            <h2 className="text-6xl font-black tracking-tight break-all">{item.word}</h2>
            <p className="font-mono text-xl opacity-80">/{item.ipa}/</p>
          </div>
          <div className="flex flex-col gap-3">
             <div className="flex gap-4">
              <button onClick={() => speak(item.word)} className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center hover:bg-white/40 shadow-lg"><i className="fas fa-volume-up text-2xl"></i></button>
              <button onClick={() => startListening(false)} className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-white/20 hover:bg-white/40'}`}><i className="fas fa-microphone text-2xl"></i></button>
            </div>
            <button 
              onClick={() => onToggleMastered(item.id)} 
              className={`py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${item.isMastered ? 'bg-white text-emerald-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
            >
              <i className={item.isMastered ? "fas fa-check-circle" : "fas fa-star"}></i>
              {item.isMastered ? "Đã thuộc bài" : "Đã thuộc từ này"}
            </button>
          </div>
        </div>
      </div>
      
      {feedback.text && (
        <div className={`px-10 py-5 font-black text-center animate-fadeIn border-b ${feedback.score && feedback.score >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {feedback.text}
        </div>
      )}

      <div className="p-10 space-y-10">
        <div>
          <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Nghĩa của Mẹ:</h4>
          <p className="text-4xl font-black text-slate-800 leading-tight mb-2">{item.vietnameseDefinition}</p>
          <p className="text-slate-500 italic text-lg leading-relaxed">{item.definition}</p>
        </div>

        <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border-l-8 border-indigo-400 space-y-4">
           <div className="flex justify-between items-center">
             <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Thử thách đọc cả câu:</h4>
             <div className="flex gap-2">
                <button onClick={() => speak(item.example)} className="w-10 h-10 bg-indigo-100 text-indigo-500 rounded-xl flex items-center justify-center"><i className="fas fa-play text-xs"></i></button>
                <button 
                  onClick={() => startListening(true)} 
                  className={`px-4 h-10 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 transition-all ${isReadingSentence ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
                >
                  <i className="fas fa-microphone"></i> Mẹ nghe con đọc
                </button>
             </div>
           </div>
           <p className="text-slate-700 font-bold text-2xl leading-relaxed">"{item.example}"</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
              <h4 className="text-[10px] font-black text-amber-600 uppercase mb-2">Mẹo ghi nhớ hài hước:</h4>
              <p className="text-slate-700 font-black italic text-sm leading-relaxed">"{item.mnemonicHint}"</p>
           </div>
           <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2">Phân tích gốc từ:</h4>
              <p className="text-xs font-bold text-slate-600"><span className="text-indigo-500">{item.rootAnalysis.root}</span>: {item.rootAnalysis.explanation}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyCard;
