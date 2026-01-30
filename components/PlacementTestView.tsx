
import React, { useState, useEffect } from 'react';
import { PlacementQuestion } from '../types';
import { generatePlacementTest } from '../geminiService';

interface Props {
  onFinish: (level: string) => void;
  onSkip: () => void;
}

const PlacementTestView: React.FC<Props> = ({ onFinish, onSkip }) => {
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const loadTest = async () => {
      try {
        const qs = await generatePlacementTest();
        setQuestions(qs);
      } catch (e) {
        console.error(e);
        // Fallback fake questions if API fails
        setQuestions([
          { id: 1, question: "What is your favorite subject?", options: ["Maths", "Doing", "Play", "Swimming"], correctAnswer: "Maths", difficulty: "Easy" },
          { id: 2, question: "How many ______ are there in your class?", options: ["student", "students", "studying", "study"], correctAnswer: "students", difficulty: "Medium" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    if (!showIntro) loadTest();
  }, [showIntro]);

  const handleAnswer = (option: string) => {
    if (option === questions[currentIdx].correctAnswer) {
      setScore(s => s + 1);
    }

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(c => c + 1);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    setCalculating(true);
    // Logic map cho Lớp 5
    let level = 'Cơ bản'; // < 5 điểm
    if (score >= 8) level = 'Giỏi (Nâng cao)';
    else if (score >= 5) level = 'Khá';
    
    setTimeout(() => {
      onFinish(level);
    }, 2000);
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-lg text-center animate-scaleIn border-8 border-indigo-200">
          <div className="text-8xl mb-6">📝</div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Kiểm Tra Nhanh Lớp 5</h2>
          <p className="text-slate-600 font-bold leading-relaxed mb-8">
            Chào con! Mẹ chiên giòn muốn biết con nhớ từ vựng Lớp 5 đến đâu nè. <br/>
            Con làm bài kiểm tra nhỏ 10 câu nhé?
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => setShowIntro(false)}
              className="w-full py-5 bg-indigo-500 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-600 hover:scale-105 transition-all text-xl"
            >
              Dạ, con làm luôn! 🚀
            </button>
            <button 
              onClick={onSkip}
              className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all text-sm uppercase tracking-widest"
            >
              Bỏ qua, con muốn học luôn ⏩
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || calculating) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 border-8 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-xl font-black text-slate-400 animate-pulse">
          {loading ? "Mẹ đang soạn đề Lớp 5..." : "Mẹ đang chấm điểm & Xếp lớp..."}
        </p>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8 px-4">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Câu {currentIdx + 1}/{questions.length}</span>
          <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-xl border-4 border-indigo-50 space-y-8 animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">🎓</div>
          <h3 className="text-2xl font-black text-slate-800 leading-tight relative z-10">{q.question}</h3>
          
          <div className="grid gap-4 relative z-10">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 font-bold text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all text-left flex items-center gap-4"
              >
                <span className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xs text-slate-400 font-black">{String.fromCharCode(65+i)}</span>
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="text-center mt-6">
            <button onClick={onSkip} className="text-slate-400 text-xs font-black uppercase hover:text-indigo-500">Bỏ qua bài này</button>
        </div>
      </div>
    </div>
  );
};

export default PlacementTestView;
