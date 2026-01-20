
import React, { useState, useEffect, useMemo } from 'react';
import { VocabularyItem, Topic, TOPICS, StudyStats, ReadingPassage, QuizQuestion } from './types';
import { generateDailySet, analyzeSpecificWord, getTutorAdvice, generateReadingPassages, generateQuiz } from './geminiService';
import VocabularyCard from './components/VocabularyCard';
import ReadingSection from './components/ReadingSection';
import QuizSection from './components/QuizSection';
import ReviewSection from './components/ReviewSection';

const App: React.FC = () => {
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic>('Education');
  const [searchQuery, setSearchQuery] = useState('');
  const [tutorAdvice, setTutorAdvice] = useState('Welcome back! Ready to conquer 5,000 words?');
  const [viewMode, setViewMode] = useState<'all' | 'today' | 'review' | 'mastered' | 'quiz'>('today');

  const [stats, setStats] = useState<StudyStats>({
    totalLearned: 0,
    currentDay: 1,
    streak: 0,
    lastStudyDate: '',
    quizScore: 0
  });

  useEffect(() => {
    const savedVocab = localStorage.getItem('ielts-vocab-list');
    const savedStats = localStorage.getItem('ielts-study-stats');
    const savedPassages = localStorage.getItem('ielts-daily-passages');
    if (savedVocab) setVocabList(JSON.parse(savedVocab));
    if (savedStats) setStats(JSON.parse(savedStats));
    if (savedPassages) setPassages(JSON.parse(savedPassages));
  }, []);

  useEffect(() => {
    localStorage.setItem('ielts-vocab-list', JSON.stringify(vocabList));
    localStorage.setItem('ielts-study-stats', JSON.stringify(stats));
    localStorage.setItem('ielts-daily-passages', JSON.stringify(passages));
  }, [vocabList, stats, passages]);

  // Unified review collection based on nextReviewAt
  const dueReviews = useMemo(() => {
    const now = Date.now();
    return vocabList.filter(i => !i.isMastered && i.nextReviewAt <= now);
  }, [vocabList]);

  const todayWords = useMemo(() => {
    const startOfToday = new Date().setHours(0,0,0,0);
    return vocabList.filter(item => item.learnedAt >= startOfToday && !item.isMastered);
  }, [vocabList]);

  const masteredWords = useMemo(() => vocabList.filter(item => item.isMastered), [vocabList]);

  const handleStartDaily = async () => {
    setLoading(true);
    try {
      const newItems = await generateDailySet(selectedTopic, 12);
      setVocabList(prev => [...newItems, ...prev]);
      const newStats = { ...stats, totalLearned: stats.totalLearned + newItems.length, currentDay: stats.currentDay + 1 };
      setStats(newStats);
      setPassages(await generateReadingPassages(newItems.map(i => i.word)));
      setTutorAdvice(await getTutorAdvice(newStats));
      setViewMode('today');
    } catch (err) { alert("Tutor is busy."); } finally { setLoading(false); }
  };

  const handleStartQuiz = async () => {
    if (vocabList.length < 5) { alert("Learn at least 5 words to start a quiz!"); return; }
    setLoading(true);
    try {
      const questions = await generateQuiz(vocabList.slice(0, 15));
      setQuizQuestions(questions);
      setViewMode('quiz');
    } catch (err) { alert("Failed to generate quiz."); } finally { setLoading(false); }
  };

  // SRS Interval Logic
  // Level 0 -> +1 day
  // Level 1 -> +3 days
  // Level 2 -> +7 days
  // Level 3 -> +30 days
  // Level 4 -> Mastered
  const updateSRS = (id: string, success: boolean) => {
    setVocabList(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const intervals = [oneDay, 3 * oneDay, 7 * oneDay, 30 * oneDay];
      
      let nextLevel = success ? Math.min(4, (item.srsLevel || 0) + 1) : 0;
      let nextMastered = nextLevel === 4;
      let nextReviewAt = success ? now + (intervals[nextLevel] || intervals[3]) : now + oneDay;

      return {
        ...item,
        srsLevel: nextLevel,
        isMastered: nextMastered,
        nextReviewAt: nextReviewAt,
        reviewCount: (item.reviewCount || 0) + 1
      };
    }));
  };

  const removeWord = (id: string) => {
    setVocabList(prev => prev.filter(item => item.id !== id));
    setStats(s => ({ ...s, totalLearned: Math.max(0, s.totalLearned - 1) }));
  };

  const toggleMastered = (id: string) => {
    setVocabList(prev => prev.map(item => item.id === id ? { ...item, isMastered: !item.isMastered, srsLevel: !item.isMastered ? 4 : 0 } : item));
  };

  const filteredDisplay = useMemo(() => {
    let base = vocabList;
    if (viewMode === 'today') base = todayWords;
    if (viewMode === 'mastered') base = masteredWords;
    return base.filter(v => v.word.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [vocabList, viewMode, searchQuery, todayWords, masteredWords]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-20">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-user-tie text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">IELTS <span className="text-indigo-600">ACADEMY</span></h1>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">Spaced Repetition Mastery</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center bg-slate-100 rounded-2xl px-6 py-2 gap-8 border border-slate-200">
             <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase">Mastered</span>
                <span className="text-sm font-black text-emerald-600">{masteredWords.length}</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase">Total Items</span>
                <span className="text-sm font-black text-slate-700">{stats.totalLearned}</span>
             </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={handleStartQuiz}
              disabled={loading}
              className="px-6 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-sm font-black shadow-sm hover:bg-indigo-50 transition-all"
            >
              <i className="fas fa-brain mr-2"></i> Quiz
            </button>
            <button 
              onClick={handleStartDaily}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-lg hover:bg-indigo-700 transition-all"
            >
              {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-bolt mr-2"></i>}
              Next Set
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-[1800px] mx-auto px-6 py-10 w-full space-y-10">
        
        <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex-shrink-0 flex items-center justify-center border-2 border-white">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Tutor" className="w-10 h-10" />
          </div>
          <p className="text-lg text-slate-700 font-medium italic">"{tutorAdvice}"</p>
        </div>

        <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto gap-2">
             <button onClick={() => setViewMode('today')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all ${viewMode === 'today' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Learning Today</button>
             <button onClick={() => setViewMode('review')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all ${viewMode === 'review' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Review Due ({dueReviews.length})</button>
             <button onClick={() => setViewMode('mastered')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all ${viewMode === 'mastered' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Mastery Vault</button>
             <button onClick={() => setViewMode('all')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase transition-all ${viewMode === 'all' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Full Library</button>
        </div>

        {loading ? (
             <div className="py-20 flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <p className="text-xl font-black text-slate-800">Updating Your Roadmap...</p>
             </div>
        ) : (
          <>
            {viewMode === 'quiz' ? (
              <QuizSection questions={quizQuestions} onFinish={(s) => { setStats(ps => ({ ...ps, quizScore: ps.quizScore + s })); setViewMode('today'); }} />
            ) : viewMode === 'review' ? (
              <div className="space-y-20">
                <ReviewSection 
                    words={dueReviews} 
                    title="Spaced Repetition Session" 
                    onResult={updateSRS}
                    onComplete={() => setViewMode('today')}
                />
                {dueReviews.length === 0 && (
                   <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                      <i className="fas fa-calendar-check text-5xl text-emerald-200 mb-6"></i>
                      <h3 className="text-2xl font-black text-slate-800">Clear Roadmap!</h3>
                      <p className="text-slate-400 mt-2">No reviews scheduled for right now. Go learn something new!</p>
                   </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredDisplay.map(item => (
                  <VocabularyCard key={item.id} item={item} onRemove={removeWord} onToggleMastered={toggleMastered} />
                ))}
                {viewMode === 'today' && passages.length > 0 && <ReadingSection passages={passages} />}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
