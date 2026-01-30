
import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  words: VocabularyItem[];
  onExit: () => void;
}

const VoiceMasterGame: React.FC<Props> = ({ words, onExit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState(0);
  const [gameWords, setGameWords] = useState<VocabularyItem[]>([]);
  const [feedback, setFeedback] = useState<{ text: string, level: number } | null>(null);

  useEffect(() => {
    if (words.length > 0) {
      setGameWords([...words].sort(() => 0.5 - Math.random()).slice(0, 5));
    }
  }, [words]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Mẹ không nghe thấy gì cả! Trình duyệt lỗi rồi.");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript('');
      setFeedback(null);
    };

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      
      const target = gameWords[currentIdx].word.toLowerCase();
      const input = result.toLowerCase().trim();
      
      let matchScore = 0;
      if (input === target) matchScore = 100;
      else if (target.includes(input) || input.includes(target)) matchScore = 70;
      
      if (matchScore >= 80) {
        setFeedback({ text: 'Nở to hơn nở rộ rồi! Quá đỉnh!', level: 100 });
        setScore(s => s + 20);
      } else {
        setFeedback({ text: 'Nở rộ nở to hơn rồi. Cố tí nữa!', level: 50 });
      }
    };

    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const nextWord = () => {
    if (currentIdx < gameWords.length - 1) {
      setCurrentIdx(c => c + 1);
      setTranscript('');
      setFeedback(null);
    } else {
      alert(`Mẹ chiên giòn: Con là Vua Phát Âm với ${score} điểm!`);
      onExit();
    }
  };

  if (gameWords.length === 0) return null;

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-teal-600 p-6 rounded-[2rem] text-white flex justify-between items-center shadow-xl">
        <div>
          <p className="text-[10px] font-black uppercase opacity-60">Vương miện</p>
          <p className="text-3xl font-black text-yellow-300">{score}</p>
        </div>
        <div className="text-center"><h3 className="text-lg font-black uppercase">Vua Phát Âm</h3></div>
        <button onClick={onExit} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><i className="fas fa-times"></i></button>
      </div>

      <div className="bg-white p-12 rounded-[4rem] border-4 border-teal-100 shadow-2xl text-center space-y-10">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đọc to từ này:</p>
          <h2 className="text-6xl font-black text-teal-600">{gameWords[currentIdx].word}</h2>
          <p className="text-lg font-bold text-slate-400">/{gameWords[currentIdx].ipa}/</p>
          <button onClick={() => speak(gameWords[currentIdx].word)} className="text-teal-500 hover:text-teal-700 font-bold"><i className="fas fa-volume-up mr-2"></i> Nghe mẫu</button>
        </div>

        <div className="relative">
          <button 
            onClick={startRecording}
            disabled={isRecording}
            className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all mx-auto ${
              isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-teal-500 text-white hover:scale-105'
            }`}
          >
            <i className="fas fa-microphone"></i>
          </button>
          {isRecording && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 border-4 border-red-500 rounded-full animate-ping opacity-20"></div>}
        </div>

        {transcript && (
          <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Mẹ nghe thấy con nói:</p>
            <p className="text-2xl font-black text-slate-700">"{transcript}"</p>
            {feedback && <p className={`text-lg font-black ${feedback.level === 100 ? 'text-emerald-500' : 'text-rose-500'}`}>{feedback.text}</p>}
          </div>
        )}

        {(feedback || transcript) && !isRecording && (
          <button onClick={nextWord} className="w-full py-5 bg-teal-600 text-white rounded-2xl font-black shadow-lg">Tiếp theo</button>
        )}
      </div>
    </div>
  );
};

export default VoiceMasterGame;
