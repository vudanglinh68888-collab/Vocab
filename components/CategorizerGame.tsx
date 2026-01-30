
import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  words: VocabularyItem[];
  onExit: () => void;
}

const CategorizerGame: React.FC<Props> = ({ words, onExit }) => {
  const [current, setCurrent] = useState<VocabularyItem | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (words.length > 0) setCurrent(words[Math.floor(Math.random() * words.length)]);
  }, [words]);

  const handleDrop = (category: string) => {
    if (current?.topic === category) {
      setScore(s => s + 20);
    }
    setCurrent(words[Math.floor(Math.random() * words.length)]);
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] border-4 border-amber-100 shadow-2xl text-center space-y-8">
      <div className="bg-amber-500 text-white p-6 rounded-[2rem] shadow-xl">
        <p className="text-[10px] font-black uppercase opacity-60">Sắp xếp vào giỏ</p>
        <h2 className="text-5xl font-black mt-2">{current?.word}</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {['Animals', 'Colors', 'Fruits', 'Alphabet'].map(cat => (
          <button 
            key={cat} 
            onClick={() => handleDrop(cat)}
            className="py-8 bg-amber-50 border-4 border-white rounded-[2rem] font-black text-amber-900 hover:bg-amber-500 hover:text-white transition-all shadow-md"
          >
            Giỏ {cat}
          </button>
        ))}
      </div>
      <div className="text-2xl font-black text-amber-500">Điểm: {score}</div>
      <button onClick={onExit} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs">Về Trang Chủ</button>
    </div>
  );
};

export default CategorizerGame;
