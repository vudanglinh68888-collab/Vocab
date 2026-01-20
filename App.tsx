
import React, { useState, useEffect } from 'react';
import { VocabularyItem, Topic, TOPICS } from './types';
import { generateVocabulary, analyzeSpecificWord } from './geminiService';
import VocabularyCard from './components/VocabularyCard';

const App: React.FC = () => {
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic>('Education');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newWordInput, setNewWordInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ielts-vocab-list');
    if (saved) {
      try {
        setVocabList(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved vocab", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ielts-vocab-list', JSON.stringify(vocabList));
  }, [vocabList]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const newItem = await generateVocabulary(selectedTopic);
      setVocabList(prev => [newItem, ...prev]);
    } catch (err) {
      alert("Failed to generate word. Please check your API connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordInput.trim()) return;
    
    setLoading(true);
    try {
      const newItem = await analyzeSpecificWord(newWordInput);
      setVocabList(prev => [newItem, ...prev]);
      setNewWordInput('');
      setShowForm(false);
    } catch (err) {
      alert("Failed to analyze word. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeWord = (id: string) => {
    setVocabList(prev => prev.filter(item => item.id !== id));
  };

  const filteredVocab = vocabList.filter(v => 
    v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
              <i className="fas fa-book-open text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-serif font-black text-slate-900 leading-none">IELTS <span className="text-indigo-600">PRO</span></h1>
              <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mt-1">Vocabulary Masterclass</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
             <button 
              onClick={() => setShowForm(!showForm)}
              className="flex items-center px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              <i className={`fas ${showForm ? 'fa-times' : 'fa-search-plus'} mr-2 text-indigo-500`}></i>
              {showForm ? 'Close' : 'Analyze Word'}
            </button>
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-sparkles mr-2"></i>
              )}
              AI Generate
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Controls Section */}
        <div className="mb-10 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-full md:w-1/3 relative">
            <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Quick search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl w-full focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
            />
          </div>
          
          <div className="w-full md:w-1/3 relative">
            <i className="fas fa-layer-group absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <select 
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value as Topic)}
              className="pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl w-full appearance-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold text-slate-700 cursor-pointer"
            >
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex-grow flex items-center justify-end">
             <div className="px-6 py-4 bg-indigo-50 rounded-2xl flex items-center gap-4">
                <div className="text-right">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Library Size</p>
                   <p className="text-xl font-black text-indigo-700">{vocabList.length} Words</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-600">
                   <i className="fas fa-chart-line"></i>
                </div>
             </div>
          </div>
        </div>

        {/* Custom Input Form */}
        {showForm && (
          <div className="mb-10 animate-slideDown">
            <form onSubmit={handleAddCustomWord} className="bg-gradient-to-r from-slate-900 to-indigo-900 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mr-4">
                    <i className="fas fa-wand-magic-sparkles text-indigo-300"></i>
                  </span>
                  Deep Linguistic Analysis
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="text" 
                    value={newWordInput}
                    onChange={(e) => setNewWordInput(e.target.value)}
                    placeholder="Enter an academic word (e.g. 'Nuanced')"
                    className="flex-grow px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/40 focus:ring-4 focus:ring-indigo-500/50 outline-none font-bold"
                    autoFocus
                  />
                  <button 
                    type="submit"
                    disabled={loading || !newWordInput.trim()}
                    className="px-10 py-4 bg-white text-indigo-900 rounded-2xl font-black shadow-xl hover:bg-indigo-50 transition-all disabled:opacity-50"
                  >
                    Analyze Now
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            </form>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-indigo-100 rounded-full"></div>
              <div className="w-24 h-24 border-8 border-transparent border-t-indigo-600 rounded-full animate-spin absolute top-0 left-0"></div>
              <i className="fas fa-brain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-indigo-600 animate-pulse"></i>
            </div>
            <div className="text-center">
              <p className="text-2xl text-slate-800 font-black">AI is Curating Knowledge</p>
              <p className="text-slate-400 font-medium">Extracting etymology and high-level paraphrases...</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && (
          <div className="flex flex-col">
            {filteredVocab.map(item => (
              <VocabularyCard 
                key={item.id} 
                item={item} 
                onRemove={removeWord}
              />
            ))}
            
            {filteredVocab.length === 0 && (
              <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-200">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <i className="fas fa-ghost text-5xl text-slate-200"></i>
                </div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">Your library is empty</h3>
                <p className="text-slate-400 mt-4 max-w-md mx-auto text-lg">
                  Choose a topic and let AI generate high-level vocabulary to boost your IELTS score.
                </p>
                <button 
                  onClick={handleGenerate}
                  className="mt-10 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-2xl shadow-indigo-100 hover:scale-105 transition-transform"
                >
                  Generate First Word
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-8">
             <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs">
                <i className="fas fa-graduation-cap"></i>
             </div>
             <span className="font-serif font-bold text-slate-900 text-xl tracking-tight">IELTS MASTER</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            Designed for Band 7.5+ aspirants. Powered by Google Gemini.
          </p>
          <div className="mt-8 flex gap-8">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"><i className="fab fa-instagram"></i></a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
