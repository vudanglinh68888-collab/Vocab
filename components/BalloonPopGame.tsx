
import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  words: VocabularyItem[];
  onExit: () => void;
}

const BalloonPopGame: React.FC<Props> = ({ words, onExit }) => {
  const [target, setTarget] = useState<VocabularyItem | null>(null);
  const [balloons, setBalloons] = useState<{ id: number, word: string, x: number, speed: number }[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (words.length > 0) {
      setTarget(words[Math.floor(Math.random() * words.length)]);
    }
    const interval = setInterval(() => {
      setBalloons(prev => [
        ...prev.filter(b => b.speed < 100),
        { id: Date.now(), word: words[Math.floor(Math.random() * words.length)].word, x: Math.random() * 80, speed: 0 }
      ]);
    }, 2000);
    return () => clearInterval(interval);
  }, [words]);

  useEffect(() => {
    const move = setInterval(() => {
      setBalloons(prev => prev.map(b => ({ ...b, speed: b.speed + 1 })));
    }, 50);
    return () => clearInterval(move);
  }, []);

  const handlePop = (word: string, id: number) => {
    if (word === target?.word) {
      setScore(s => s + 10);
      setTarget(words[Math.floor(Math.random() * words.length)]);
    } else {
      setScore(s => Math.max(0, s - 5));
    }
    setBalloons(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="relative h-[500px] bg-sky-100 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl p-6">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-6 py-2 rounded-full font-black text-rose-500 z-10 shadow-lg border-2 border-rose-100">
        Tìm từ: <span className="text-2xl ml-2">{target?.vietnameseDefinition}</span>
      </div>
      <div className="absolute top-4 right-4 bg-yellow-400 text-white w-12 h-12 rounded-full flex items-center justify-center font-black shadow-lg">
        {score}
      </div>
      <button onClick={onExit} className="absolute top-4 left-4 text-slate-400 hover:text-rose-500 font-black"><i className="fas fa-times-circle text-2xl"></i></button>

      {balloons.map(b => (
        <button
          key={b.id}
          onClick={() => handlePop(b.word, b.id)}
          className="absolute w-20 h-24 bg-rose-400 rounded-full flex items-center justify-center text-white font-black text-xs shadow-xl transition-all hover:scale-110 active:scale-90"
          style={{ left: `${b.x}%`, bottom: `${b.speed}%`, backgroundColor: `hsl(${b.id % 360}, 70%, 60%)` }}
        >
          {b.word}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-white/40"></div>
        </button>
      ))}
    </div>
  );
};

export default BalloonPopGame;
