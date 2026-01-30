
import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  words: VocabularyItem[];
  onExit: () => void;
}

const WordSearchGame: React.FC<Props> = ({ words, onExit }) => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [gameWords, setGameWords] = useState<string[]>([]);

  useEffect(() => {
    const list = [...words].sort(() => 0.5 - Math.random()).slice(0, 4).map(w => w.word.toUpperCase());
    setGameWords(list);
    
    const size = 8;
    let newGrid = Array(size).fill(null).map(() => Array(size).fill('').map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))));
    
    list.forEach((word, wordIdx) => {
      const row = wordIdx;
      for(let i = 0; i < word.length && i < size; i++) {
        newGrid[row][i] = word[i];
      }
    });
    setGrid(newGrid);
  }, [words]);

  return (
    <div className="bg-white p-10 rounded-[3rem] border-4 border-indigo-100 shadow-2xl text-center space-y-8">
      <h3 className="text-2xl font-black text-indigo-600 uppercase">Thợ Săn Chữ Cái</h3>
      <div className="grid grid-cols-8 gap-1 bg-indigo-50 p-4 rounded-3xl border-4 border-white shadow-inner">
        {grid.map((row, r) => row.map((char, c) => (
          <div key={`${r}-${c}`} className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center font-black text-indigo-900 shadow-sm text-sm md:text-lg">
            {char}
          </div>
        ))) }
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {gameWords.map(w => (
          <span key={w} className={`px-4 py-2 rounded-xl font-black text-xs border-2 ${foundWords.includes(w) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
            {w}
          </span>
        ))}
      </div>
      <button onClick={onExit} className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black shadow-lg">Về Trang Chủ</button>
    </div>
  );
};

export default WordSearchGame;
