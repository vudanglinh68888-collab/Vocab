
import React, { useState, useEffect } from 'react';
import { PlacementQuestion } from '../types';
import { generateWeeklyTest } from '../geminiService';

interface Props {
  weekNumber: number;
  grade: number;
  historyTopics: string[];
  onFinish: (score: number) => void;
  onExit: () => void;
}

const WeeklyQuizView: React.FC<Props> = ({ weekNumber, grade, historyTopics, onFinish, onExit }) => {
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  useEffect(() => {
    const loadTest = async () => {
      try {
        const qs = await generateWeeklyTest(grade, historyTopics);
        setQuestions(qs);
      } catch (e) {
        console.error(e);
        // Fallback
        setQuestions([
          { id: 1, question: "Sample Question 1", options: ["A", "B", "C", "D"], correctAnswer: "A", difficulty: "Easy" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadTest();
  }, [grade, historyTopics]);

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedOpt(option);
    setIsAnswered(true);

    if (option === questions[currentIdx].correctAnswer) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(c => c + 1);
        setIsAnswered(false);
        setSelectedOpt(null);
      } else {
        setShowResult(true);
      }
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xl font-black text-indigo-900 animate-pulse">Mẹ đang soạn đề kiểm tra Tuần {weekNumber}...</p>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-lg text-center animate-scaleIn border-8 border-indigo-300">
          <div className="text-8xl mb-6">{percentage >= 80 ? '🏆' : percentage >= 50 ? '👍' : '📚'}</div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Kết quả Tuần {weekNumber}</h2>
          <p className="text-5xl font-black text-indigo-500 mb-6">{score}/{questions.length}</p>
          <p className="text-slate-600 font-bold leading-relaxed mb-8">
            {percentage >= 80 ? "Xuất sắc! Con đã nắm rất chắc bài tuần qua." : 
             percentage >= 50 ? "Khá lắm! Cố gắng ôn thêm những từ con sai nhé." : 
             "Cần cố gắng hơn! Mẹ con mình cùng ôn lại bài nào."}
          </p>
          <button 
            onClick={() => onFinish(score)}
            className="w-full py-5 bg-indigo-500 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-600 hover:scale-105 transition-all text-xl"
          >
            Hoàn thành & Lưu điểm
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-6">
       <div className="w-full max-w-2xl flex justify-between items-center mb-6">
          <button onClick={onExit} className="text-slate-400 font-black hover:text-rose-500"><i className="fas fa-times"></i> Thoát</button>
          <div className="text-indigo-900 font-black uppercase tracking-widest">Bài kiểm tra tuần {weekNumber}</div>
       </div>

       <div className="w-full max-w-2xl bg-white p-10 rounded-[2.5rem] shadow-xl border-b-8 border-indigo-200">
          <div className="flex justify-between items-center mb-8">
             <span className="text-xs font-black text-slate-400">Câu {currentIdx + 1}/{questions.length}</span>
             <div className="h-3 w-32 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
             </div>
          </div>

          <h3 className="text-2xl font-black text-slate-800 mb-8 leading-snug">{q.question}</h3>

          <div className="grid gap-4">
             {q.options.map((opt, i) => {
               let stateClass = "bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300";
               if (isAnswered) {
                 if (opt === q.correctAnswer) stateClass = "bg-emerald-100 border-emerald-400 text-emerald-800";
                 else if (opt === selectedOpt) stateClass = "bg-rose-100 border-rose-400 text-rose-800";
                 else stateClass = "opacity-50";
               }

               return (
                 <button
                   key={i}
                   onClick={() => handleAnswer(opt)}
                   disabled={isAnswered}
                   className={`p-5 rounded-2xl border-2 font-bold text-left transition-all ${stateClass}`}
                 >
                   <span className="mr-3 font-black opacity-50">{String.fromCharCode(65+i)}.</span> {opt}
                 </button>
               )
             })}
          </div>
       </div>
    </div>
  );
};

export default WeeklyQuizView;
