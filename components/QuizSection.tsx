
import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface Props {
  questions: QuizQuestion[];
  onFinish: (score: number) => void;
}

const QuizSection: React.FC<Props> = ({ questions, onFinish }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const current = questions[currentIdx];

  const handleSelect = (opt: string) => {
    if (showResult) return;
    setSelectedOption(opt);
    setShowResult(true);
    if (opt.toLowerCase() === current.correctAnswer.toLowerCase()) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
      onFinish(score + (selectedOption?.toLowerCase() === current.correctAnswer.toLowerCase() ? 1 : 0));
    }
  };

  if (isFinished) {
    return (
      <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-200 shadow-xl max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
          <i className="fas fa-trophy"></i>
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4">Quiz Complete!</h2>
        <p className="text-slate-500 mb-8 text-lg font-medium">You scored <span className="text-indigo-600 font-black">{score}</span> out of {questions.length}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-white p-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-4">
         <div className="h-2 flex-grow bg-slate-100 rounded-full overflow-hidden ml-4">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500" 
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            ></div>
         </div>
         <span className="px-4 text-xs font-black text-slate-400 uppercase">Question {currentIdx + 1}/{questions.length}</span>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-100 bg-slate-50/50">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-4">
            {current.type === 'multiple-choice' ? 'Multiple Choice' : 'Context Completion'}
          </span>
          <h3 className="text-2xl font-serif font-black text-slate-900 leading-snug">
            {current.question}
          </h3>
        </div>

        <div className="p-10 space-y-4">
          {current.options ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {current.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(opt)}
                  className={`p-6 rounded-2xl text-left border-2 transition-all font-bold ${
                    showResult 
                      ? opt === current.correctAnswer 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900' 
                        : opt === selectedOption 
                          ? 'border-rose-500 bg-rose-50 text-rose-900' 
                          : 'border-slate-100 opacity-50'
                      : 'border-slate-100 hover:border-indigo-500 bg-slate-50 hover:bg-white'
                  }`}
                >
                  <span className="mr-3 opacity-30"># {i + 1}</span>
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
               <input 
                 type="text"
                 placeholder="Type your answer..."
                 className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-bold focus:border-indigo-500 outline-none transition-all"
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && !showResult) handleSelect(e.currentTarget.value);
                 }}
               />
               <button 
                 onClick={(e) => {
                    const input = (e.currentTarget.previousSibling as HTMLInputElement).value;
                    handleSelect(input);
                 }}
                 disabled={showResult}
                 className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black disabled:opacity-50"
               >
                 Submit Answer
               </button>
            </div>
          )}

          {showResult && (
            <div className="mt-8 animate-slideUp">
              <div className={`p-6 rounded-3xl border ${selectedOption?.toLowerCase() === current.correctAnswer.toLowerCase() ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                <div className="flex items-start gap-4">
                  <i className={`fas ${selectedOption?.toLowerCase() === current.correctAnswer.toLowerCase() ? 'fa-check-circle' : 'fa-times-circle'} text-2xl mt-1`}></i>
                  <div>
                    <h4 className="font-black text-sm uppercase mb-1">
                      {selectedOption?.toLowerCase() === current.correctAnswer.toLowerCase() ? 'Correct!' : 'Incorrect'}
                    </h4>
                    <p className="text-sm font-medium opacity-80 leading-relaxed">
                      {current.explanation}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleNext}
                className="mt-6 w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
              >
                Next Question
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizSection;
