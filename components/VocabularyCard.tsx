
import React from 'react';
import { VocabularyItem } from '../types';

interface Props {
  item: VocabularyItem;
  onRemove?: (id: string) => void;
  onToggleMastered?: (id: string) => void;
}

const VocabularyCard: React.FC<Props> = ({ item, onRemove, onToggleMastered }) => {
  const daysSinceLearned = Math.floor((Date.now() - item.learnedAt) / (1000 * 60 * 60 * 24));
  
  const getReviewTag = () => {
    if (item.isMastered) return null;
    if (daysSinceLearned === 3) return { label: '3-Day Review', color: 'bg-amber-500' };
    if (daysSinceLearned === 7) return { label: 'Weekly Review', color: 'bg-indigo-500' };
    if (daysSinceLearned === 30) return { label: 'Monthly Review', color: 'bg-violet-500' };
    return null;
  };

  const reviewTag = getReviewTag();

  return (
    <div className={`bg-white rounded-[2.5rem] shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-xl group mb-6 ${item.isMastered ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 hover:border-indigo-200'}`}>
      {/* Header Row */}
      <div className={`${item.isMastered ? 'bg-emerald-900' : 'bg-slate-900'} p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 transition-colors duration-500`}>
        <div className="flex items-center gap-8">
          <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-3xl shadow-lg transition-colors ${item.isMastered ? 'bg-emerald-600 shadow-emerald-900/50' : 'bg-indigo-600 shadow-indigo-900/50'}`}>
             <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Level</span>
             <span className="text-2xl font-black">{item.cefr}</span>
          </div>
          <div>
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-5xl font-serif font-black tracking-tight text-white">{item.word}</h2>
              {item.isMastered && (
                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-emerald-900/40">
                  <i className="fas fa-check-circle"></i> Mastered
                </span>
              )}
              {reviewTag && !item.isMastered && (
                <span className={`${reviewTag.color} text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse`}>
                  {reviewTag.label}
                </span>
              )}
              <button 
                onClick={() => {
                  const utterance = new SpeechSynthesisUtterance(item.word);
                  utterance.lang = 'en-US';
                  window.speechSynthesis.speak(utterance);
                }}
                className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-indigo-500 transition-all active:scale-90"
              >
                <i className="fas fa-volume-up text-xl"></i>
              </button>
            </div>
            <div className="flex items-center gap-3 mt-2">
               <p className="text-indigo-300 font-mono text-xl font-bold">{item.ipa}</p>
               <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
               <span className="text-slate-400 font-black text-xs uppercase tracking-widest">{item.topic}</span>
               <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
               <span className="text-slate-500 text-xs italic">Learned {daysSinceLearned === 0 ? 'today' : `${daysSinceLearned}d ago`}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {onToggleMastered && (
            <button 
              onClick={() => onToggleMastered(item.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${item.isMastered ? 'bg-white text-emerald-900' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
              title={item.isMastered ? "Return to active study" : "Mark as Mastered"}
            >
              <i className={`fas ${item.isMastered ? 'fa-undo' : 'fa-check'}`}></i>
              {item.isMastered ? 'Unmaster' : 'Mastered'}
            </button>
          )}
          {onRemove && (
            <button 
              onClick={() => onRemove(item.id)}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-white/50 hover:bg-rose-500 hover:text-white transition-all border border-white/10"
              title="Forget word"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          )}
        </div>
      </div>

      {/* Main 4-Column Content */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 lg:divide-x divide-slate-100 ${item.isMastered ? 'opacity-70' : ''}`}>
        
        {/* COL 1: Basic Info */}
        <div className="p-10 bg-white">
          <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-6 flex items-center">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span> Basic Knowledge
          </h4>
          <div className="space-y-6">
            <div>
              <p className="text-slate-900 leading-relaxed font-bold text-xl mb-2">{item.definition}</p>
              <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-sm">
                VN: {item.vietnameseDefinition}
              </div>
            </div>
            <div className="pt-6 border-t border-slate-50">
              <h5 className="text-[10px] font-black text-slate-300 uppercase mb-3">Usage Example</h5>
              <p className="text-slate-600 italic border-l-4 border-slate-200 pl-5 text-base leading-relaxed">
                "{item.example}"
              </p>
            </div>
          </div>
        </div>

        {/* COL 2: Memory Hints */}
        <div className="p-10 bg-slate-50/30">
          <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-6 flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span> Memory Anchor
          </h4>
          
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm mb-6">
            <div className="flex justify-around items-center mb-4">
               <div className="text-center">
                 <div className="text-[9px] text-slate-400 font-black mb-1">PRE</div>
                 <div className="text-lg font-black text-slate-800">{item.rootAnalysis.prefix || '-'}</div>
               </div>
               <div className="w-px h-8 bg-slate-100"></div>
               <div className="text-center">
                 <div className="text-[9px] text-slate-400 font-black mb-1">ROOT</div>
                 <div className="text-lg font-black text-indigo-600">{item.rootAnalysis.root}</div>
               </div>
               <div className="w-px h-8 bg-slate-100"></div>
               <div className="text-center">
                 <div className="text-[9px] text-slate-400 font-black mb-1">SUF</div>
                 <div className="text-lg font-black text-slate-800">{item.rootAnalysis.suffix || '-'}</div>
               </div>
            </div>
            <p className="text-xs text-slate-500 italic leading-relaxed text-center pt-2">
              {item.rootAnalysis.explanation}
            </p>
          </div>

          <div className="bg-amber-100/40 p-6 rounded-[2rem] border border-amber-200/50 relative group/hint">
            <i className="fas fa-lightbulb absolute right-4 top-4 text-amber-300 text-2xl group-hover/hint:scale-125 transition-transform"></i>
            <h5 className="text-[10px] font-black text-amber-800 uppercase mb-3 tracking-widest">Mnemonic Trick</h5>
            <p className="text-sm text-amber-900 leading-relaxed font-bold">
              {item.mnemonicHint}
            </p>
          </div>
        </div>

        {/* COL 3: IELTS Strategy */}
        <div className="p-10 bg-white">
          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-6 flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span> Strategic Links
          </h4>
          
          <div className="space-y-8">
            <div>
              <h5 className="text-[10px] font-black text-emerald-700 uppercase mb-3 tracking-tighter">Academic Alternatives</h5>
              <div className="flex flex-wrap gap-2">
                {item.synonyms.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-colors cursor-default">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-[10px] font-black text-rose-700 uppercase mb-3 tracking-tighter">Direct Opposites</h5>
              <div className="flex flex-wrap gap-2">
                {item.antonyms.map((a, i) => (
                  <span key={i} className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-xl text-xs font-black border border-rose-100 hover:bg-rose-600 hover:text-white transition-colors cursor-default">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex gap-4">
               <i className="fas fa-award text-indigo-400 text-xl"></i>
               <p className="text-xs text-indigo-800 leading-relaxed font-bold">
                 Use this to boost Lexical Resource in Writing Task 2 essays.
               </p>
            </div>
          </div>
        </div>

        {/* COL 4: Paraphrasing Vault */}
        <div className="p-10 bg-slate-50/30">
          <h4 className="text-[10px] font-black text-violet-600 uppercase tracking-[0.2em] mb-6 flex items-center">
            <span className="w-2 h-2 bg-violet-500 rounded-full mr-3"></span> Re-writing Vault
          </h4>
          
          <div className="space-y-4">
            {item.ieltsParaphrases.map((p, i) => (
              <div key={i} className="group/p flex items-center p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-violet-500 transition-all">
                <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 mr-4 text-xs font-black group-hover/p:bg-violet-600 group-hover/p:text-white transition-colors">
                  {i + 1}
                </div>
                <span className="text-sm text-slate-800 font-bold leading-snug">{p}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-10 pt-8 border-t border-slate-200 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <i className="fas fa-file-alt"></i>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reading Patterns</p>
                <p className="text-[11px] font-bold text-slate-500 italic leading-none">Frequently tested in matching features</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyCard;
