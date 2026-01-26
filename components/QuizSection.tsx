
import React, { useState, useEffect } from 'react';
import { VocabularyItem } from '../types';

interface Props {
  words: VocabularyItem[];
  onFinish: () => void;
}

type QuizType = 'meaning' | 'listening';

const QuizSection: React.FC<Props> = ({ words, onFinish }) => {
  const [questions, setQuestions] = useState<{ word: string, correct: string, options: string[], type: QuizType }[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (words.length < 4) return;
    const shuffled = [...words].sort(() => 0.5 - Math.random()).slice(0, 10);
    const qSet = shuffled.map((w, index) => {
      const distractors = words
        .filter(other => other.id !== w.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(other => other.vietnameseDefinition);
      
      const type: QuizType = index % 2 === 0 ? 'meaning' : 'listening';
      
      return {
        word: w.word,
        correct: w.vietnameseDefinition,
        options: [w.vietnameseDefinition, ...distractors].sort(() => 0.5 - Math.random()),
        type
      };
    });
    setQuestions(qSet);
  }, [words]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleAnswer = (opt: string) => {
    setSelected(opt);
    setShowResult(true);
    if (opt === questions[currentIdx].correct) {
      setScore(s => s + 1);
      const audio = new Audio('https://www.soundjay.com/buttons/button-3.mp3');
      audio.play().catch(() => {});
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowResult(false);
      setSelected(null);
    } else {
      setShowResult(true);
    }
  };

  if (words.length < 4) {
    return <div className="p-10 text-center bg-white rounded-3xl border-4 border-rose-100">Bà Bô dặn: Con học ít nhất 4 từ rồi mẹ mới cho làm bài kiểm tra nhé! 📚</div>;
  }

  if (currentIdx === questions.length - 1 && showResult && selected) {
    return (
      <div className="bg-white p-12 rounded-[3rem] border-4 border-rose-200 text-center shadow-xl animate-scaleIn">
        <div className="text-7xl mb-6">🎖️</div>
        <h2 className="text-3xl font-black text-slate-800">Hoàn thành bài tập của mẹ!</h2>
        <p className="text-xl font-bold text-rose-500 mt-4">Điểm con đạt được: {score} / {questions.length}</p>
        <p className="text-sm text-slate-400 mt-2 font-bold">{score >= 8 ? "Bà Bô: Con mẹ giỏi quá xá!" : "Bà Bô: Lần sau cố gắng hơn con nhé!"}</p>
        <button onClick={onFinish} className="mt-8 px-12 py-5 bg-rose-500 text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all">Về trang chủ</button>
      </div>
    );
  }

  const q = questions[currentIdx];
  if (!q) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-white p-6 rounded-3xl border-2 border-rose-100 shadow-sm flex items-center justify-between">
         <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Mẹ kiểm tra: {currentIdx + 1}/{questions.length}</span>
         <div className="w-32 h-3 bg-rose-50 rounded-full overflow-hidden border border-rose-100">
            <div className="h-full bg-rose-500 transition-all shadow-[0_0_8px_rgba(244,63,94,0.3)]" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-12 border-4 border-rose-50 shadow-xl text-center relative overflow-hidden">
        {q.type === 'listening' && (
          <div className="absolute top-4 right-4 animate-pulse">
            <i className="fas fa-headphones text-rose-200 text-2xl"></i>
          </div>
        )}
        
        <p className="text-rose-500 text-[10px] font-black uppercase mb-4 tracking-tighter">
          {q.type === 'meaning' ? "Bà Bô hỏi: Từ này nghĩa là gì con nhỉ?" : "Bà Bô bảo: Nghe mẹ đọc rồi chọn nghĩa đúng nhé!"}
        </p>

        {q.type === 'meaning' ? (
          <h3 className="text-6xl font-black text-slate-900 mb-10 tracking-tight">{q.word}</h3>
        ) : (
          <div className="mb-10">
            <button onClick={() => speak(q.word)} className="w-24 h-24 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all mx-auto border-4 border-white">
               <i className="fas fa-volume-up text-3xl"></i>
            </button>
            <p className="mt-4 text-xs font-bold text-slate-400">Nhấn để nghe lại</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => !showResult && handleAnswer(opt)}
              disabled={showResult}
              className={`p-6 rounded-2xl font-black transition-all border-b-4 ${
                showResult 
                  ? opt === q.correct ? 'bg-emerald-500 text-white border-emerald-700' : opt === selected ? 'bg-rose-500 text-white border-rose-700' : 'bg-slate-50 text-slate-300 border-slate-100'
                  : 'bg-white text-slate-700 border-rose-100 hover:border-rose-400 hover:bg-rose-50 shadow-sm'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {showResult && (
          <button onClick={nextQuestion} className="mt-10 w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-lg animate-fadeIn flex items-center justify-center gap-3 hover:bg-slate-800">
             {currentIdx < questions.length - 1 ? 'Mẹ kiểm tra câu tiếp' : 'Xem kết quả cuối'}
             <i className="fas fa-arrow-right"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizSection;
