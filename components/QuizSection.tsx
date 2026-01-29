
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
      setShowResult(true);
    }
  };

  if (currentIdx === questions.length - 1 && showResult && selected) {
    const isSuccess = score >= 8;
    return (
      <div className="bg-white p-12 rounded-[3rem] border-8 border-rose-100 text-center shadow-2xl animate-scaleIn">
        <div className="text-8xl mb-6">{isSuccess ? '🌸' : '⏳'}</div>
        <h2 className="text-3xl font-black text-slate-800">Mẹ chấm điểm đây!</h2>
        <p className={`text-4xl font-black mt-4 ${isSuccess ? 'text-emerald-500' : 'text-rose-500'}`}>{score} / {questions.length}</p>
        <p className="text-xl font-bold text-slate-600 mt-6 leading-relaxed">
          {isSuccess ? "Mẹ chiên giòn: Nở to hơn nở rộ rồi! Con của mẹ quá xuất sắc!" : "Mẹ chiên giòn: Nở rộ nở to hơn rồi. Cẩn thận! Phải tập trung hơn nhé con!"}
        </p>
        <button onClick={onFinish} className="mt-10 px-12 py-5 bg-rose-500 text-white rounded-2xl font-black shadow-lg">Dạ, con nhớ rồi mẹ!</button>
      </div>
    );
  }

  const q = questions[currentIdx];
  if (!q) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-white p-6 rounded-3xl border-2 border-rose-100 shadow-sm flex items-center justify-between">
         <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Câu {currentIdx + 1}/{questions.length}</span>
         <div className="flex-1 mx-6 h-3 bg-rose-50 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
         </div>
      </div>
      <div className="bg-white rounded-[3rem] p-12 border-4 border-rose-50 shadow-xl text-center">
        <h3 className="text-5xl font-black text-slate-900 mb-10">{q.type === 'meaning' ? q.word : '🎧 (Nghe từ)'}</h3>
        {q.type === 'listening' && (
          <button onClick={() => { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(q.word); u.lang = 'en-US'; window.speechSynthesis.speak(u); }} className="mb-10 w-20 h-20 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg"><i className="fas fa-volume-up text-2xl"></i></button>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => !showResult && handleAnswer(opt)} className={`p-6 rounded-2xl font-black border-b-4 transition-all ${showResult ? (opt === q.correct ? 'bg-emerald-500 text-white' : opt === selected ? 'bg-rose-500 text-white' : 'bg-slate-50 text-slate-200') : 'bg-white border-rose-100 hover:bg-rose-50 shadow-sm'}`}>{opt}</button>
          ))}
        </div>
        {showResult && <button onClick={nextQuestion} className="mt-10 w-full py-5 bg-slate-900 text-white rounded-2xl font-black">Tiếp tục</button>}
      </div>
    </div>
  );
};

export default QuizSection;
