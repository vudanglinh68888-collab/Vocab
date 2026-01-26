
import React, { useState } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  item: VocabularyItem;
  onToggleMastered?: (id: string) => void;
}

const VocabularyCard: React.FC<Props> = ({ item, onToggleMastered }) => {
  const [isListening, setIsListening] = useState<'word' | 'sentence' | null>(null);
  const [feedback, setFeedback] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });

  const speak = (text: string, slow = false) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = slow ? 0.6 : 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = (mode: 'word' | 'sentence') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsListening(mode);
      setFeedback({ text: `Bà Bô đang nghe con đọc nè...`, type: null });
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
      const target = (mode === 'word' ? item.word : item.example).toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");

      const similarity = speechToText.split(' ').filter(word => target.includes(word)).length / target.split(' ').length;

      if (similarity > 0.7) {
        setFeedback({ text: '🌟 Giỏi quá! Con của mẹ đọc chuẩn lắm!', type: 'success' });
      } else {
        setFeedback({ text: `Nghe chưa giống lắm, con đọc lại mẹ nghe xem nào!`, type: 'error' });
      }
    };

    recognition.onerror = () => setIsListening(null);
    recognition.onend = () => setIsListening(null);
    recognition.start();
  };

  return (
    <div className={`bg-white rounded-[2.5rem] shadow-xl border-4 transition-all duration-300 ${item.isMastered ? 'border-emerald-200' : 'border-rose-100'}`}>
      <div className={`${item.isMastered ? 'bg-emerald-500' : 'bg-rose-500'} p-8 text-white rounded-t-[2.2rem]`}>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-tighter">Lớp {item.grade}</span>
              <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">{item.topic}</span>
            </div>
            <h2 className="text-5xl font-black tracking-tight">{item.word}</h2>
            <p className="font-mono font-bold text-lg opacity-80">/{item.ipa}/</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => speak(item.word)} className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center hover:bg-white/40 transition-all shadow-lg"><i className="fas fa-volume-up text-xl"></i></button>
            <button onClick={() => startListening('word')} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isListening === 'word' ? 'bg-red-500 animate-pulse' : 'bg-white/20 hover:bg-white/40'}`}><i className="fas fa-microphone-alt text-xl"></i></button>
          </div>
        </div>
      </div>

      {feedback.text && (
        <div className={`px-8 py-4 text-center text-sm font-black animate-fadeIn ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {feedback.text}
        </div>
      )}

      <div className="p-8 space-y-8">
        <div>
          <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Nghĩa là:</h4>
          <p className="text-3xl font-black text-slate-800 leading-tight mb-2">{item.vietnameseDefinition}</p>
          <p className="text-slate-500 font-medium italic text-sm">{item.definition}</p>
        </div>

        <div className="pt-6 border-t border-rose-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Ví dụ của mẹ:</h4>
            <div className="flex gap-2">
              <button onClick={() => speak(item.example)} className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center hover:bg-indigo-100 transition-all shadow-sm"><i className="fas fa-play text-xs"></i></button>
              <button onClick={() => startListening('sentence')} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm ${isListening === 'sentence' ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100'}`}><i className="fas fa-microphone text-xs"></i></button>
            </div>
          </div>
          <div className="bg-indigo-50/50 p-6 rounded-3xl border-l-8 border-indigo-400">
            <p className="text-slate-700 font-bold text-lg leading-relaxed mb-2">"{item.example}"</p>
            <p className="text-slate-400 text-xs font-bold uppercase opacity-60 tracking-wider">Nhấn nút phát để Bà Bô đọc con nghe</p>
          </div>
        </div>

        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 relative overflow-hidden">
          <div className="absolute -top-2 -right-2 text-4xl opacity-10 rotate-12">👩‍🏫</div>
          <h4 className="text-[10px] font-black text-amber-600 uppercase mb-2">Mẹ dạy con ghi nhớ:</h4>
          <p className="text-sm font-bold text-slate-700 leading-relaxed italic">{item.mnemonicHint}</p>
        </div>
      </div>
    </div>
  );
};

export default VocabularyCard;
