
import React from 'react';
import { VocabularyItem } from '../types';

interface Props {
  item: VocabularyItem;
  onRemove?: (id: string) => void;
}

const VocabularyCard: React.FC<Props> = ({ item, onRemove }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl mb-8 group">
      {/* Header Row */}
      <div className="bg-slate-900 p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="text-center px-4 py-2 bg-indigo-600 rounded-xl">
             <span className="text-[10px] block font-bold uppercase tracking-widest opacity-80">CEFR</span>
             <span className="text-xl font-bold">{item.cefr}</span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-serif font-bold tracking-tight text-white">{item.word}</h2>
              <button 
                onClick={() => {
                  const utterance = new SpeechSynthesisUtterance(item.word);
                  utterance.lang = 'en-US';
                  window.speechSynthesis.speak(utterance);
                }}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-indigo-500 transition-colors"
              >
                <i className="fas fa-volume-up"></i>
              </button>
            </div>
            <p className="text-indigo-300 font-mono text-lg">{item.ipa} <span className="mx-2 text-slate-600">|</span> <span className="text-slate-400 text-sm italic font-sans">{item.topic}</span></p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {onRemove && (
            <button 
              onClick={() => onRemove(item.id)}
              className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-sm font-bold"
            >
              <i className="fas fa-trash-alt mr-2"></i> Remove
            </button>
          )}
        </div>
      </div>

      {/* Main 4-Column Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 min-h-[350px]">
        
        {/* COL 1: Basic Info */}
        <div className="p-8 border-r border-slate-100 bg-white">
          <div className="mb-6">
            <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span> Basic Info
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-slate-800 leading-relaxed font-medium text-lg">{item.definition}</p>
                <p className="text-indigo-600 font-bold mt-2 text-base">Meaning: {item.vietnameseDefinition}</p>
              </div>
              <div className="pt-4">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2 italic">Contextual Example</h5>
                <p className="text-slate-500 italic border-l-4 border-slate-200 pl-4 text-sm leading-relaxed">
                  "{item.example}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COL 2: Memory Hints */}
        <div className="p-8 border-r border-slate-100 bg-slate-50/50">
          <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span> Memory Hints
          </h4>
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <div className="flex justify-between mb-3">
               <div className="text-center">
                 <div className="text-[9px] text-slate-400 font-bold">PREFIX</div>
                 <div className="text-sm font-bold text-slate-700">{item.rootAnalysis.prefix || '-'}</div>
               </div>
               <div className="text-center px-4 border-x border-slate-100">
                 <div className="text-[9px] text-slate-400 font-bold">ROOT</div>
                 <div className="text-sm font-bold text-indigo-600 uppercase">{item.rootAnalysis.root}</div>
               </div>
               <div className="text-center">
                 <div className="text-[9px] text-slate-400 font-bold">SUFFIX</div>
                 <div className="text-sm font-bold text-slate-700">{item.rootAnalysis.suffix || '-'}</div>
               </div>
            </div>
            <p className="text-xs text-slate-500 italic leading-relaxed border-t border-slate-50 pt-2">
              {item.rootAnalysis.explanation}
            </p>
          </div>

          <div className="bg-amber-100/50 p-5 rounded-2xl border border-amber-200/50 relative overflow-hidden">
            <i className="fas fa-lightbulb absolute -right-2 -bottom-2 text-amber-200 text-4xl opacity-50 rotate-12"></i>
            <h5 className="text-[10px] font-bold text-amber-700 uppercase mb-2">Mnemonic Tip</h5>
            <p className="text-sm text-amber-900 leading-relaxed font-medium">
              {item.mnemonicHint}
            </p>
          </div>
        </div>

        {/* COL 3: IELTS Context */}
        <div className="p-8 border-r border-slate-100 bg-white">
          <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-6 flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> IELTS Context
          </h4>
          
          <div className="space-y-6">
            <div>
              <h5 className="text-[10px] font-bold text-emerald-600 uppercase mb-2 tracking-tighter">Academic Synonyms</h5>
              <div className="flex flex-wrap gap-2">
                {item.synonyms.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100 transition-transform hover:-translate-y-1">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-[10px] font-bold text-rose-600 uppercase mb-2 tracking-tighter">Common Antonyms</h5>
              <div className="flex flex-wrap gap-2">
                {item.antonyms.map((a, i) => (
                  <span key={i} className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold border border-rose-100 transition-transform hover:-translate-y-1">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
               <div className="flex items-start gap-2">
                 <i className="fas fa-star text-indigo-400 mt-1 text-xs"></i>
                 <p className="text-[11px] text-indigo-700 leading-relaxed">
                   <strong>Lexical Resource:</strong> Using this word instead of more common alternatives can improve your score for Writing Task 2.
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* COL 4: Paraphrase */}
        <div className="p-8 bg-slate-50/50">
          <h4 className="text-xs font-black text-violet-600 uppercase tracking-widest mb-6 flex items-center">
            <span className="w-2 h-2 bg-violet-500 rounded-full mr-2"></span> Paraphrase
          </h4>
          
          <div className="space-y-3">
            {item.ieltsParaphrases.map((p, i) => (
              <div key={i} className="group/item flex items-center p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-violet-400 transition-all hover:shadow-md">
                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 mr-3 text-[10px] font-bold group-hover/item:bg-violet-600 group-hover/item:text-white transition-colors">
                  {i + 1}
                </div>
                <span className="text-sm text-slate-700 font-semibold">{p}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-200">
             <div className="flex items-center gap-2 text-slate-400">
                <i className="fas fa-history text-xs"></i>
                <span className="text-[10px] uppercase font-bold tracking-widest">Often seen in Reading Tasks</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyCard;
