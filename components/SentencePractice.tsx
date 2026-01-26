
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
      alert("Lỗi kiểm tra câu, bé thử lại nhé!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border-4 border-purple-100 shadow-xl space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg"><i className="fas fa-pen-nib"></i></div>
        <div>
          <h3 className="text-xl font-black text-slate-900">Thử thách Writing</h3>
          <p className="text-xs font-bold text-slate-400">Hãy đặt một câu tiếng Anh có từ <span className="text-purple-600">"{word}"</span></p>
        </div>
      </div>

      <div className="space-y-4">
        <textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu của bé vào đây..."
          className="w-full h-32 p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-slate-700 focus:border-purple-500 outline-none transition-all resize-none"
        />
        
        {!result ? (
          <button 
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            className="w-full py-4 bg-purple-500 text-white rounded-2xl font-black shadow-xl hover:bg-purple-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-paper-plane"></i>}
            Gửi Gấu Tutor chấm điểm
          </button>
        ) : (
          <div className="space-y-6 animate-scaleIn">
            <div className={`p-6 rounded-3xl border-2 flex items-center gap-6 ${result.score >= 80 ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}>
               <div className="w-20 h-20 rounded-full bg-white shadow-inner flex items-center justify-center flex-shrink-0 border-4 border-emerald-100">
                  <span className="text-2xl font-black text-emerald-600">{result.score}</span>
               </div>
               <div>
                  <p className="text-sm font-black text-slate-800 leading-tight">"{result.feedback}"</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Dịch: {result.vietnamese}</p>
               </div>
            </div>

            {result.correction && result.correction !== input && (
              <div className="bg-blue-50 p-6 rounded-3xl border-l-8 border-blue-400">
                <h4 className="text-[10px] font-black text-blue-500 uppercase mb-2">Gợi ý sửa lại</h4>
                <p className="text-slate-700 font-bold">{result.correction}</p>
              </div>
            )}

            <button 
              onClick={() => { setInput(''); setResult(null); onSuccess(); }}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg"
            >
              Học từ tiếp theo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentencePractice;
