
import React, { useState } from 'react';
import { ReadingPassage } from '../types';

interface ReadingCardProps {
  passage: ReadingPassage;
}

const ReadingCard: React.FC<ReadingCardProps> = ({ passage }) => {
  const [showVi, setShowVi] = useState(false);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-xl font-serif font-black text-slate-900 tracking-tight">
          <i className="fas fa-book-open text-indigo-500 mr-3"></i>
          {passage.title}
        </h3>
        <button
          onClick={() => setShowVi(!showVi)}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            showVi ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {showVi ? 'Hide Translation' : 'Show Translation'}
        </button>
      </div>
      <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">English Version</h4>
          <p className="text-lg text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
            {passage.contentEn}
          </p>
        </div>
        <div className={`transition-all duration-500 ${showVi ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none absolute'}`}>
          <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4">Vietnamese Version</h4>
          <p className="text-lg text-slate-600 leading-relaxed italic whitespace-pre-wrap">
            {passage.contentVi}
          </p>
        </div>
        {!showVi && (
            <div className="hidden lg:flex items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <div className="text-center p-8">
                    <i className="fas fa-language text-4xl text-slate-200 mb-4"></i>
                    <p className="text-slate-400 font-bold">Click button to reveal translation</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

interface ReadingSectionProps {
  passages: ReadingPassage[];
}

const ReadingSection: React.FC<ReadingSectionProps> = ({ passages }) => {
  if (passages.length === 0) return null;

  return (
    <div className="mt-16 animate-fadeIn">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-serif font-black text-slate-900 mb-3">Today's Reading Practice</h2>
        <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
        <p className="text-slate-500 mt-4 max-w-2xl mx-auto font-medium">
          Apply your newly learned vocabulary in context with these academic passages designed for IELTS training.
        </p>
      </div>
      <div className="space-y-8">
        {passages.map((p, i) => (
          <ReadingCard key={i} passage={p} />
        ))}
      </div>
    </div>
  );
};

export default ReadingSection;
