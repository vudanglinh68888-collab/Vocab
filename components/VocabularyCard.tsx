
import React, { useState } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  item: VocabularyItem;
}

const VocabularyCard: React.FC<Props> = ({ item }) => {
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setFeedback({ text: 'Bé đọc đi nào...', type: null });
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
      const targetWord = item.word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");

      if (speechToText === targetWord) {
        setFeedback({ text: '🌟 Tuyệt quá! Bé phát âm đúng rồi!', type: 'success' });
        // Phát âm thanh chúc mừng nhỏ
        const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-37a.mp3');
        audio.play().catch(() => {});
      } else {
        setFeedback({ text: `Bé đọc là "${speechToText}", thử lại nhé!`, type: 'error' });
      }
    };

    recognition.onerror = () => {
      setFeedback({ text: 'Gấu không nghe rõ, bé thử lại nhé!', type: 'error' });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className={`bg-white rounded-[2rem] shadow-xl border-4 overflow-hidden transition-all duration-300 ${item.isMastered ? 'border-emerald-200' : 'border-orange-100'}`}>
      <div className={`${item.isMastered ? 'bg-emerald-500' : 'bg-orange-500'} p-6 text-white flex justify-between items-center`}>
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex flex-col items-center justify-center border-2 border-white/30 backdrop-blur-sm">
             <span className="text-[8px] font-black uppercase opacity-80">Lớp</span>
             <span className="text-xl font-black">{item.grade}</span>
          </div>
          <div>
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-black tracking-tight">{item.word}</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => speak(item.word)}
                  className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/40 transition-all shadow-sm"
                  title="Nghe phát âm"
                >
                  <i className="fas fa-volume-up"></i>
                </button>
                <button 
                  onClick={startListening}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${isListening ? 'bg-red-500 animate-pulse' : 'bg-white/20 hover:bg-white/40'}`}
                  title="Tập đọc"
                >
                  <i className={`fas ${isListening ? 'fa-microphone' : 'fa-microphone-alt'}`}></i>
                </button>
              </div>
            </div>
            <p className="font-mono font-bold text-sm opacity-90 mt-1">/{item.ipa}/</p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{item.topic}</span>
      </div>

      {feedback.text && (
        <div className={`px-6 py-3 text-center text-sm font-black animate-fadeIn ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-orange-50">
        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-[10px] font-black text-orange-400 uppercase mb-1">Nghĩa tiếng Việt</h4>
            <p className="text-2xl font-black text-slate-800">{item.vietnameseDefinition}</p>
          </div>
          <div className="pt-4 border-t border-orange-50">
            <h4 className="text-[10px] font-black text-blue-400 uppercase mb-2">Ví dụ vui</h4>
            <p className="text-slate-700 font-bold italic text-base leading-relaxed bg-blue-50 p-4 rounded-2xl border-l-4 border-blue-400">
              "{item.example}"
            </p>
          </div>
        </div>

        <div className="p-6 bg-orange-50/20 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100">
            <h4 className="text-[10px] font-black text-amber-600 uppercase mb-1">Mẹo siêu nhớ 💡</h4>
            <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
              {item.mnemonicHint}
            </p>
          </div>
          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
             <span>Lần ôn tới: {new Date(item.nextReview).toLocaleDateString()}</span>
             {item.interval > 0 && <span>Khoảng cách: {item.interval} ngày</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyCard;
