
import React, { useState } from 'react';
import { evaluateSentence } from '../geminiService';

interface Props {
  word: string;
  onSuccess: () => void;
}

const SentencePractice: React.FC<Props> = ({ word, onSuccess }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number, feedback: string, correction: string, vietnamese: string } | null>(null);

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      const evaluation = await evaluateSentence(word, input);
      setResult(evaluation);
    } catch (err) {
      alert("Mẹ thấy lỗi rồi, con thử lại nhé!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border-4 border-purple-100 shadow-xl space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 bg-purple-500 rounded-3xl flex items-center justify-center text-white shadow-lg text-2xl"><i className="fas fa-pen-nib"></i></div>
        <div>
          <h3 className="text-2xl font-black text-slate-900">Mẹ cho con viết thử nhé</h3>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Hãy đặt câu với từ: <span className="text-purple-600">"{word}"</span></p>
        </div>
      </div>

      <div className="space-y-6">
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Con nhập câu vào đây cho mẹ xem nào..."
          className="w-full h-40 p-8 bg-slate-50 border-4 border-slate-100 rounded-[2.5rem] font-bold text-xl text-slate-700 focus:border-purple-500 outline-none transition-all resize-none shadow-inner"
        />
        
        {!result ? (
          <button 
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            className="w-full py-5 bg-purple-500 text-white rounded-3xl font-black shadow-xl hover:bg-purple-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
          >
            {loading ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-check-circle"></i>}
            Đưa Bà Bô chấm bài
          </button>
        ) : (
          <div className="space-y-8 animate-scaleIn">
            <div className={`p-8 rounded-[3rem] border-4 flex flex-col md:flex-row items-center gap-8 shadow-lg ${result.score >= 80 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
               <div className="w-24 h-24 rounded-full bg-white shadow-xl flex flex-col items-center justify-center flex-shrink-0 border-4 border-emerald-100">
                  <span className="text-sm font-black text-slate-400 uppercase leading-none mb-1">Điểm</span>
                  <span className={`text-3xl font-black ${result.score >= 80 ? 'text-emerald-600' : 'text-rose-600'}`}>{result.score}</span>
               </div>
               <div className="text-center md:text-left flex-1 space-y-2">
                  <p className="text-xl font-black text-slate-800 leading-tight">"{result.feedback}"</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dịch: {result.vietnamese}</span>
                  </div>
               </div>
               <div className="text-4xl">
                  {result.score >= 80 ? '🚀' : '⏰'}
               </div>
            </div>

            {result.correction && result.correction !== input && (
              <div className="bg-blue-50 p-8 rounded-[2.5rem] border-l-8 border-blue-400 shadow-sm relative overflow-hidden">
                <div className="absolute top-4 right-4 text-blue-100 text-4xl"><i className="fas fa-lightbulb"></i></div>
                <h4 className="text-[10px] font-black text-blue-500 uppercase mb-3 tracking-widest">Mẹ gợi ý con viết như này:</h4>
                <p className="text-blue-900 font-black text-lg italic leading-relaxed">"{result.correction}"</p>
              </div>
            )}

            <button 
              onClick={() => { setInput(''); setResult(null); onSuccess(); }}
              className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black shadow-xl hover:scale-[1.02] transition-all text-lg"
            >
              Học tiếp từ mới thôi con!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentencePractice;
