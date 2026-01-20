
import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  words: VocabularyItem[];
  onFinish: () => void;
}

const QuizSection: React.FC<Props> = ({ words, onFinish }) => {
  const [questions, setQuestions] = useState<{ word: string, correct: string, options: string[] }[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (words.length < 4) return;
    const shuffled = [...words].sort(() => 0.5 - Math.random()).slice(0, 10);
    const qSet = shuffled.map(w => {
      const distractors = words
        .filter(other => other.id !== w.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(other => other.vietnameseDefinition);
      return {
        word: w.word,
        correct: w.vietnameseDefinition,
        options: [w.vietnameseDefinition, ...distractors].sort(() => 0.5 - Math.random())
      };
    });
    setQuestions(qSet);
  }, [words]);

  const handleAnswer = (opt: string) => {
    setSelected(opt);
    setShowResult(true);
    if (opt === questions[currentIdx].correct) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowResult(false);
      setSelected(null);
    } else {
      setShowResult(true); // Để hiển thị màn hình cuối
    }
  };

  if (words.length < 4) {
    return <div className="p-10 text-center">Bé cần học ít nhất 4 từ để làm bài kiểm tra nhé!</div>;
  }

  if (currentIdx === questions.length - 1 && showResult && selected) {
    return (
      <div className="bg-white p-12 rounded-[2.5rem] border-4 border-blue-100 text-center shadow-xl animate-scaleIn">
        <div className="text-6xl mb-6">🏆</div>
        <h2 className="text-3xl font-black text-slate-800">Hoàn thành bài tập!</h2>
        <p className="text-xl font-bold text-blue-500 mt-4">Điểm của bé: {score} / {questions.length}</p>
        <button onClick={onFinish} className="mt-8 px-10 py-4 bg-blue-500 text-white rounded-2xl font-black shadow-lg">Quay lại học tiếp</button>
      </div>
    );
  }

  const q = questions[currentIdx];
  if (!q) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-white p-6 rounded-3xl border-2 border-blue-100 shadow-sm flex items-center justify-between">
         <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Câu hỏi {currentIdx + 1}/{questions.length}</span>
         <div className="w-32 h-2 bg-blue-50 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 border-4 border-blue-50 shadow-xl text-center">
        <p className="text-blue-500 text-[10px] font-black uppercase mb-4 tracking-tighter">Từ này có nghĩa là gì bé ơi?</p>
        <h3 className="text-6xl font-black text-slate-900 mb-10">{q.word}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => !showResult && handleAnswer(opt)}
              disabled={showResult}
              className={`p-5 rounded-2xl font-black transition-all border-b-4 ${
                showResult 
                  ? opt === q.correct ? 'bg-emerald-500 text-white border-emerald-700' : opt === selected ? 'bg-rose-500 text-white border-rose-700' : 'bg-slate-100 text-slate-400 border-slate-200'
                  : 'bg-white text-slate-700 border-slate-100 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {showResult && (
          <button onClick={nextQuestion} className="mt-10 w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg animate-fadeIn flex items-center justify-center gap-3">
             {currentIdx < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}
             <i className="fas fa-arrow-right"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizSection;
