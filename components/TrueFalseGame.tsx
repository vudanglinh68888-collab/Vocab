
import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  words: VocabularyItem[];
  onExit: () => void;
}

const TrueFalseGame: React.FC<Props> = ({ words, onExit }) => {
  const [currentQ, setCurrentQ] = useState<{ word: string, definition: string, isCorrect: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [count, setCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const generateQuestion = () => {
    if (words.length < 2) return;
    const wordObj = words[Math.floor(Math.random() * words.length)];
    const isCorrect = Math.random() > 0.5;
    let displayDef = wordObj.vietnameseDefinition;

    if (!isCorrect) {
      const otherWords = words.filter(w => w.id !== wordObj.id);
      displayDef = otherWords[Math.floor(Math.random() * otherWords.length)].vietnameseDefinition;
    }

    setCurrentQ({ word: wordObj.word, definition: displayDef, isCorrect });
    setTimeLeft(10);
    setFeedback(null);
  };

  useEffect(() => {
    generateQuestion();
  }, [words]);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver && !feedback) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !feedback) {
      handleAnswer(null);
    }
  }, [timeLeft, gameOver, feedback]);

  const handleAnswer = (userChoice: boolean | null) => {
    if (feedback || gameOver) return;

    const isRight = userChoice === currentQ?.isCorrect;
    if (isRight) {
      setScore(s => s + 10);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      if (count < 9) {
        setCount(c => c + 1);
        generateQuestion();
      } else {
        setGameOver(true);
      }
    }, 1000);
  };

  if (gameOver) {
    return (
      <div className="bg-white p-12 rounded-[3rem] text-center shadow-2xl border-4 border-orange-200 animate-scaleIn max-w-md mx-auto">
        <div className="text-7xl mb-6">⚖️</div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Hết giờ rồi!</h2>
        <p className="text-4xl font-black text-orange-500 mb-6">{score} Điểm</p>
        <p className="text-lg font-bold text-slate-500 mb-8">
          {score >= 80 ? "Nở to hơn nở rộ rồi! Con phản xạ nhanh quá!" : "Nở rộ nở to hơn rồi. Cẩn thận! Lần sau nhanh tay hơn nhé."}
        </p>
        <button onClick={onExit} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black shadow-lg">Về Trang Chủ</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-orange-500 p-6 rounded-[2rem] text-white flex justify-between items-center shadow-xl">
        <div>
          <p className="text-[10px] font-black uppercase opacity-60">Điểm</p>
          <p className="text-3xl font-black text-yellow-300">{score}</p>
        </div>
        <div className="text-center">
          <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center font-black text-xl ${timeLeft < 4 ? 'animate-pulse text-yellow-300' : ''}`}>
            {timeLeft}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase opacity-60">Câu</p>
          <p className="text-3xl font-black">{count + 1}/10</p>
        </div>
      </div>

      <div className={`bg-white p-12 rounded-[4rem] border-8 shadow-2xl text-center space-y-8 transition-all duration-300 ${
        feedback === 'correct' ? 'border-emerald-400 bg-emerald-50' : 
        feedback === 'wrong' ? 'border-rose-400 bg-rose-50' : 'border-orange-100'
      }`}>
        <div className="space-y-2">
          <h3 className="text-5xl font-black text-slate-900 mb-4">{currentQ?.word}</h3>
          <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">Có phải là:</p>
          <p className="text-3xl font-black text-orange-500 italic">"{currentQ?.definition}"</p>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4">
          <button 
            onClick={() => handleAnswer(true)}
            className="py-6 bg-emerald-500 text-white rounded-3xl font-black text-2xl shadow-lg hover:scale-105 transition-all active:scale-95"
          >
            ĐÚNG ✅
          </button>
          <button 
            onClick={() => handleAnswer(false)}
            className="py-6 bg-rose-500 text-white rounded-3xl font-black text-2xl shadow-lg hover:scale-105 transition-all active:scale-95"
          >
            SAI ❌
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrueFalseGame;
