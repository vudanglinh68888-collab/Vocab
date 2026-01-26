
import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  words: VocabularyItem[];
  onExit: () => void;
}

const UnscrambleGame: React.FC<Props> = ({ words, onExit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [userSelection, setUserSelection] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [gameWords, setGameWords] = useState<VocabularyItem[]>([]);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    if (words.length > 0) {
      setGameWords([...words].sort(() => 0.5 - Math.random()).slice(0, 8));
    }
  }, [words]);

  useEffect(() => {
    if (gameWords.length > 0 && currentIdx < gameWords.length) {
      const word = gameWords[currentIdx].word.toUpperCase();
      const s = word.split('').sort(() => 0.5 - Math.random());
      setScrambled(s);
      setUserSelection([]);
      setShowResult(null);
    }
  }, [currentIdx, gameWords]);

  const handleCharClick = (char: string, index: number) => {
    if (showResult) return;
    const newScrambled = [...scrambled];
    newScrambled.splice(index, 1);
    setScrambled(newScrambled);
    setUserSelection([...userSelection, char]);
  };

  const handleUndo = (char: string, index: number) => {
    if (showResult) return;
    const newUserSelection = [...userSelection];
    newUserSelection.splice(index, 1);
    setUserSelection(newUserSelection);
    setScrambled([...scrambled, char]);
  };

  const checkResult = () => {
    const target = gameWords[currentIdx].word.toUpperCase();
    const current = userSelection.join('');
    
    if (current === target) {
      setScore(s => s + 15);
      setShowResult('correct');
    } else {
      setShowResult('wrong');
    }

    setTimeout(() => {
      if (currentIdx < gameWords.length - 1) {
        setCurrentIdx(c => c + 1);
      } else {
        alert(`Bà Bô: Con rất cố gắng! Tổng điểm Xếp Chữ: ${score + (current === target ? 15 : 0)}`);
        onExit();
      }
    }, 1500);
  };

  if (gameWords.length === 0) return null;

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-rose-600 p-6 rounded-[2rem] text-white flex justify-between items-center shadow-xl">
        <div>
          <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Điểm số</p>
          <p className="text-3xl font-black text-yellow-300">{score}</p>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-black uppercase tracking-tight">Xếp Chữ</h3>
          <p className="text-[10px] opacity-60">Câu {currentIdx + 1}/{gameWords.length}</p>
        </div>
        <button onClick={onExit} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20"><i className="fas fa-times"></i></button>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border-4 border-rose-100 shadow-2xl space-y-8 text-center">
        <div className="space-y-2">
          <div className="text-5xl mb-4">🔠</div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nghĩa của từ này là:</p>
          <h4 className="text-2xl font-black text-rose-500">{gameWords[currentIdx].vietnameseDefinition}</h4>
        </div>

        {/* User Workspace */}
        <div className="flex flex-wrap justify-center gap-3 min-h-[60px] p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          {userSelection.map((char, i) => (
            <button 
              key={i} 
              onClick={() => handleUndo(char, i)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-md transition-all ${
                showResult === 'correct' ? 'bg-emerald-500 text-white' : 
                showResult === 'wrong' ? 'bg-rose-500 text-white' : 
                'bg-white text-rose-600'
              }`}
            >
              {char}
            </button>
          ))}
        </div>

        {/* Available Pool */}
        <div className="flex flex-wrap justify-center gap-3">
          {scrambled.map((char, i) => (
            <button 
              key={i} 
              onClick={() => handleCharClick(char, i)}
              className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 border-b-4 border-slate-300 flex items-center justify-center text-xl font-black hover:bg-white hover:border-rose-400 hover:text-rose-500 transition-all active:scale-95"
            >
              {char}
            </button>
          ))}
        </div>

        {userSelection.length === gameWords[currentIdx].word.length && !showResult && (
          <button 
            onClick={checkResult}
            className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black shadow-lg hover:bg-rose-600 animate-bounce mt-4"
          >
            Mẹ ơi con xếp xong rồi!
          </button>
        )}
      </div>
    </div>
  );
};

export default UnscrambleGame;
