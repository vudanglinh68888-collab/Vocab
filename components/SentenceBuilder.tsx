
import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  words: VocabularyItem[];
  onExit: () => void;
}

const SentenceBuilder: React.FC<Props> = ({ words, onExit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scrambledWords, setScrambledWords] = useState<{ id: string, text: string }[]>([]);
  const [userSelection, setUserSelection] = useState<{ id: string, text: string }[]>([]);
  const [score, setScore] = useState(0);
  const [gameWords, setGameWords] = useState<VocabularyItem[]>([]);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    if (words.length > 0) {
      setGameWords([...words].sort(() => 0.5 - Math.random()).slice(0, 5));
    }
  }, [words]);

  useEffect(() => {
    if (gameWords.length > 0 && currentIdx < gameWords.length) {
      const sentence = gameWords[currentIdx].example;
      const parts = sentence.split(' ').map((word, i) => ({ id: `${i}-${word}`, text: word }));
      setScrambledWords([...parts].sort(() => 0.5 - Math.random()));
      setUserSelection([]);
      setShowResult(null);
    }
  }, [currentIdx, gameWords]);

  const handleWordClick = (word: { id: string, text: string }) => {
    if (showResult) return;
    setScrambledWords(prev => prev.filter(w => w.id !== word.id));
    setUserSelection(prev => [...prev, word]);
  };

  const handleUndo = (word: { id: string, text: string }) => {
    if (showResult) return;
    setUserSelection(prev => prev.filter(w => w.id !== word.id));
    setScrambledWords(prev => [...prev, word]);
  };

  const checkResult = () => {
    const target = gameWords[currentIdx].example;
    const current = userSelection.map(w => w.text).join(' ');
    
    if (current === target) {
      setScore(s => s + 20);
      setShowResult('correct');
    } else {
      setShowResult('wrong');
    }

    setTimeout(() => {
      if (currentIdx < gameWords.length - 1) {
        setCurrentIdx(c => c + 1);
      } else {
        const finalScore = score + (current === target ? 20 : 0);
        alert(`Mẹ chiên giòn: ${finalScore >= 80 ? 'Nở to hơn nở rộ rồi!' : 'Nở rộ nở to hơn rồi. Cẩn thận!'} Bé được ${finalScore} điểm xây câu.`);
        onExit();
      }
    }, 2000);
  };

  if (gameWords.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-purple-600 p-6 rounded-[2rem] text-white flex justify-between items-center shadow-xl">
        <div>
          <p className="text-[10px] font-black uppercase opacity-60">Điểm xây dựng</p>
          <p className="text-3xl font-black text-yellow-300">{score}</p>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-black uppercase tracking-tight">Xây Câu Cùng Mẹ</h3>
          <p className="text-[10px] opacity-60">Tòa nhà {currentIdx + 1}/{gameWords.length}</p>
        </div>
        <button onClick={onExit} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20"><i className="fas fa-times"></i></button>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border-4 border-purple-100 shadow-2xl space-y-8 text-center">
        <div className="space-y-2">
          <div className="text-5xl mb-4">🏗️</div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Dịch nghĩa câu này là:</p>
          <h4 className="text-xl font-black text-purple-600 italic">"{gameWords[currentIdx].vietnameseDefinition}"</h4>
          <p className="text-[10px] font-bold text-slate-400 mt-2">(Từ khóa chính: {gameWords[currentIdx].word})</p>
        </div>

        {/* Construction Site */}
        <div className={`flex flex-wrap justify-center gap-2 min-h-[120px] p-6 bg-slate-50 rounded-[2rem] border-4 border-dashed transition-all ${
          showResult === 'correct' ? 'border-emerald-400 bg-emerald-50' : 
          showResult === 'wrong' ? 'border-rose-400 bg-rose-50' : 'border-slate-200'
        }`}>
          {userSelection.map((word, i) => (
            <button 
              key={word.id} 
              onClick={() => handleUndo(word)}
              className="px-4 py-2 rounded-xl bg-white border-2 border-purple-200 text-slate-800 font-bold text-sm shadow-sm hover:bg-rose-50 hover:border-rose-300 transition-all"
            >
              {word.text}
            </button>
          ))}
          {showResult === 'wrong' && (
            <div className="w-full mt-4 p-3 bg-white/80 rounded-xl text-xs font-bold text-rose-500">
              Mẹ nhắc nè: "{gameWords[currentIdx].example}"
            </div>
          )}
        </div>

        {/* Bricks Pool */}
        <div className="flex flex-wrap justify-center gap-3">
          {scrambledWords.map((word) => (
            <button 
              key={word.id} 
              onClick={() => handleWordClick(word)}
              className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 border-2 border-purple-100 font-bold text-sm hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all active:scale-95"
            >
              {word.text}
            </button>
          ))}
        </div>

        {scrambledWords.length === 0 && !showResult && (
          <button 
            onClick={checkResult}
            className="w-full py-5 bg-purple-500 text-white rounded-2xl font-black shadow-lg hover:bg-purple-600 transition-all"
          >
            Mẹ ơi con xây xong rồi! 🧱
          </button>
        )}
      </div>
    </div>
  );
};

export default SentenceBuilder;
