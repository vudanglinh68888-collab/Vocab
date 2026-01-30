
import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  words: VocabularyItem[];
  onExit: () => void;
}

const AudioHuntGame: React.FC<Props> = ({ words, onExit }) => {
  const [currentQ, setCurrentQ] = useState<{ word: string, options: string[], correct: string } | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [count, setCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  const generateQuestion = () => {
    if (words.length < 4) return;
    const correctObj = words[Math.floor(Math.random() * words.length)];
    const distractors = words
      .filter(w => w.id !== correctObj.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.word);
    
    const options = [correctObj.word, ...distractors].sort(() => 0.5 - Math.random());
    setCurrentQ({ word: correctObj.word, options, correct: correctObj.word });
    setTimeLeft(15);
    setFeedback(null);
    speak(correctObj.word);
  };

  useEffect(() => {
    generateQuestion();
  }, [words]);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver && !feedback) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !feedback) {
      handleAnswer('');
    }
  }, [timeLeft, gameOver, feedback]);

  const handleAnswer = (option: string) => {
    if (feedback || gameOver) return;

    if (option === currentQ?.correct) {
      setScore(s => s + 25);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      if (count < 7) {
        setCount(c => c + 1);
        generateQuestion();
      } else {
        setGameOver(true);
      }
    }, 1200);
  };

  if (gameOver) {
    return (
      <div className="bg-white p-12 rounded-[3rem] text-center shadow-2xl border-4 border-blue-200 animate-scaleIn max-w-md mx-auto">
        <div className="text-7xl mb-6">🎧</div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Thợ săn cừ khôi!</h2>
        <p className="text-4xl font-black text-blue-500 mb-6">{score} Điểm</p>
        <button onClick={onExit} className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black shadow-lg">Về Trang Chủ</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-blue-600 p-6 rounded-[2rem] text-white flex justify-between items-center shadow-xl">
        <div>
          <p className="text-[10px] font-black uppercase opacity-60">Săn được</p>
          <p className="text-3xl font-black text-yellow-300">{score}</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-white flex items-center justify-center font-black text-xl">
            {timeLeft}
          </div>
        </div>
        <button onClick={onExit} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><i className="fas fa-times"></i></button>
      </div>

      <div className={`bg-white p-10 rounded-[4rem] border-8 shadow-2xl text-center space-y-8 ${
        feedback === 'correct' ? 'border-emerald-400' : feedback === 'wrong' ? 'border-rose-400' : 'border-blue-100'
      }`}>
        <div className="space-y-4">
          <div className="text-6xl animate-bounce">👂</div>
          <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Mẹ vừa đọc từ nào nhỉ?</h3>
          <button onClick={() => speak(currentQ?.word || '')} className="w-20 h-20 bg-blue-500 text-white rounded-full mx-auto shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
            <i className="fas fa-volume-up text-3xl"></i>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {currentQ?.options.map((opt, i) => (
            <button 
              key={i}
              onClick={() => handleAnswer(opt)}
              className={`py-6 rounded-3xl font-black text-xl shadow-md transition-all ${
                feedback ? (opt === currentQ.correct ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300') : 'bg-blue-50 text-blue-700 hover:bg-blue-500 hover:text-white'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudioHuntGame;
