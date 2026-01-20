
import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  vocabList: VocabularyItem[];
  onExit: () => void;
}

interface Card {
  id: string;
  content: string;
  type: 'word' | 'meaning';
  matchId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const WordGame: React.FC<Props> = ({ vocabList, onExit }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (vocabList.length < 4) {
      setErrorMsg("Bé ơi! Cần học ít nhất 4 từ vựng mới chơi được game Ghép Đôi nhé. Bé hãy quay lại học thêm vài từ nữa nha! 🎒");
      return;
    }
    initGame();
  }, [vocabList]);

  const initGame = () => {
    // Select up to 6 random words from the learned list
    const gameWords = [...vocabList].sort(() => 0.5 - Math.random()).slice(0, 6);
    
    const wordCards: Card[] = gameWords.map(w => ({
      id: `word-${w.id}`,
      content: w.word,
      type: 'word',
      matchId: w.id,
      isFlipped: false,
      isMatched: false
    }));

    const meaningCards: Card[] = gameWords.map(w => ({
      id: `mean-${w.id}`,
      content: w.vietnameseDefinition,
      type: 'meaning',
      matchId: w.id,
      isFlipped: false,
      isMatched: false
    }));

    // Shuffle all 12 cards together
    const allCards = [...wordCards, ...meaningCards].sort(() => 0.5 - Math.random());
    setCards(allCards);
    setScore(0);
    setMoves(0);
    setGameOver(false);
    setSelectedCards([]);
  };

  const handleCardClick = (card: Card) => {
    if (card.isFlipped || card.isMatched || selectedCards.length === 2) return;

    // Flip the clicked card
    const updatedCards = cards.map(c => 
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newSelected;

      if (first.matchId === second.matchId) {
        // MATCH FOUND
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.matchId === first.matchId ? { ...c, isMatched: true } : c
          ));
          setScore(s => s + 20);
          setSelectedCards([]);
          
          // Check for game completion
          const remaining = updatedCards.filter(c => !c.isMatched && c.id !== first.id && c.id !== second.id).length;
          if (remaining === 0) {
            setGameOver(true);
          }
        }, 600);
      } else {
        // NO MATCH
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first.id || c.id === second.id ? { ...c, isFlipped: false } : c
          ));
          setSelectedCards([]);
        }, 1200);
      }
    }
  };

  if (errorMsg) {
    return (
      <div className="bg-white p-12 rounded-[3rem] text-center shadow-2xl border-4 border-orange-200 animate-scaleIn">
        <div className="text-7xl mb-6">🐻‍❄️</div>
        <h2 className="text-2xl font-black text-slate-800 mb-4">Gấu Tutor thông báo</h2>
        <p className="text-slate-600 font-bold mb-8 leading-relaxed px-4">{errorMsg}</p>
        <button onClick={onExit} className="px-10 py-4 bg-orange-500 text-white rounded-2xl font-black shadow-lg hover:bg-orange-600 transition-all active:scale-95">
          Vâng ạ, con đi học đây!
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="bg-white p-12 rounded-[3rem] text-center shadow-2xl border-4 border-emerald-200 animate-scaleIn">
        <div className="text-7xl mb-6">🎖️</div>
        <h2 className="text-4xl font-black text-emerald-600 mb-2">Thắng rồi!</h2>
        <p className="text-xl font-bold text-slate-600 mb-8">
          Bé đã ghép đúng hết trong <span className="text-blue-500">{moves} lượt</span>.
          <br/>
          Ghi được <span className="text-orange-500">{score} điểm</span>!
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={initGame} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-600 transition-all">Chơi tiếp</button>
          <button onClick={onExit} className="px-8 py-4 bg-slate-200 text-slate-600 rounded-2xl font-black hover:bg-slate-300 transition-all">Nghỉ ngơi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-indigo-900 p-6 rounded-[2rem] text-white shadow-xl">
        <div className="text-left">
          <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Điểm số</p>
          <p className="text-3xl font-black text-yellow-400">{score}</p>
        </div>
        <div className="text-center hidden md:block">
          <h3 className="text-lg font-black uppercase tracking-tighter">Magic Matcher</h3>
          <p className="text-xs opacity-60">Luyện trí nhớ cùng từ vựng</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Số lượt</p>
          <p className="text-3xl font-black text-blue-300">{moves}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-white/50 rounded-[3rem] border-4 border-dashed border-indigo-100 backdrop-blur-sm">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card)}
            className={`
              relative h-36 md:h-44 rounded-3xl transition-all duration-500 perspective-1000
              ${card.isFlipped || card.isMatched ? 'cursor-default' : 'hover:scale-105 active:scale-95'}
              ${card.isMatched ? 'opacity-0 pointer-events-none invisible' : ''}
            `}
          >
            <div className={`
              w-full h-full relative transition-transform duration-500 transform-style-3d
              ${card.isFlipped ? 'rotate-y-180' : ''}
            `}>
              {/* CARD BACK (HIDDEN FACE) */}
              <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white rounded-3xl flex items-center justify-center shadow-lg">
                <span className="text-4xl text-white/40 font-black">?</span>
              </div>

              {/* CARD FRONT (CONTENT FACE) */}
              <div className={`
                absolute inset-0 backface-hidden rotate-y-180 rounded-3xl flex items-center justify-center p-4 text-center shadow-xl border-4
                ${card.type === 'word' ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-emerald-100 border-emerald-300 text-emerald-900'}
              `}>
                <span className={`font-black leading-tight ${card.content.length > 12 ? 'text-xs' : 'text-sm md:text-base'}`}>
                  {card.content}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="text-center">
        <button onClick={onExit} className="text-slate-400 hover:text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] transition-colors py-4 px-8">
          <i className="fas fa-times-circle mr-2"></i> Rời khỏi trò chơi
        </button>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default WordGame;
