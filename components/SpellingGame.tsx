
import React, { useState, useEffect, useRef } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  words: VocabularyItem[];
  onExit: () => void;
}

const SpellingGame: React.FC<Props> = ({ words, onExit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameWords, setGameWords] = useState<VocabularyItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (words.length > 0) {
      setGameWords([...words].sort(() => 0.5 - Math.random()).slice(0, 10));
    }
  }, [words]);

  useEffect(() => {
    if (gameWords.length > 0 && currentIdx < gameWords.length) {
      speak(gameWords[currentIdx].word);
      inputRef.current?.focus();
    }
  }, [currentIdx, gameWords]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || showFeedback) return;

    const target = gameWords[currentIdx].word.toLowerCase();
    const userInput = input.toLowerCase().trim();

    if (userInput === target) {
      setScore(s => s + 10);
      setShowFeedback('correct');
    } else {
      setShowFeedback('wrong');
    }

    setTimeout(() => {
      setShowFeedback(null);
      setInput('');
      if (currentIdx < gameWords.length - 1) {
        setCurrentIdx(c => c + 1);
      } else {
        alert(`Bà Bô: Giỏi lắm! Con đã hoàn thành Spelling Bee với ${score + (userInput === target ? 10 : 0)} điểm!`);
        onExit();
      }
    }, 1500);
  };

  if (gameWords.length === 0) return null;

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-indigo-600 p-6 rounded-[2rem] text-white flex justify-between items-center shadow-xl">
        <div>
          <p className="text-[10px] font-black uppercase opacity-60">Điểm số</p>
          <p className="text-3xl font-black text-yellow-400">{score}</p>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-black uppercase">Spelling Bee</h3>
          <p className="text-[10px] opacity-60">Câu {currentIdx + 1}/{gameWords.length}</p>
        </div>
        <button onClick={onExit} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20"><i className="fas fa-times"></i></button>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border-4 border-indigo-100 shadow-2xl text-center space-y-8 relative">
        <div className="text-6xl">🐝</div>
        <div className="space-y-4">
          <button onClick={() => speak(gameWords[currentIdx].word)} className="w-20 h-20 bg-indigo-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg hover:scale-105 active:scale-95 transition-all">
            <i className="fas fa-volume-up text-2xl"></i>
          </button>
          <p className="text-sm font-bold text-slate-400">Nghe Bà Bô đọc rồi viết lại nhé!</p>
          <p className="text-xs font-black text-indigo-400 italic">Nghĩa: {gameWords[currentIdx].vietnameseDefinition}</p>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <input 
            ref={inputRef}
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!!showFeedback}
            placeholder="..."
            className={`w-full p-6 bg-slate-50 border-4 rounded-3xl text-center text-3xl font-black outline-none transition-all ${
              showFeedback === 'correct' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
              showFeedback === 'wrong' ? 'border-rose-500 bg-rose-50 text-rose-700' :
              'border-slate-100 focus:border-indigo-500'
            }`}
          />
          {showFeedback === 'wrong' && (
            <p className="text-xs font-black text-rose-500 mt-2">Đúng phải là: <span className="uppercase">{gameWords[currentIdx].word}</span></p>
          )}
        </form>

        <button 
          onClick={() => handleSubmit()}
          className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-600 transition-all"
        >
          Mẹ kiểm tra cho con
        </button>
      </div>
    </div>
  );
};

export default SpellingGame;
