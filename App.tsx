
import React, { useState, useEffect, useMemo } from 'react';
import { VocabularyItem, Topic, TOPICS, StudyStats, ReadingPassage, User } from './types';
import { generateDailySet, generateReadingPassages, getDailyPerformanceReview } from './geminiService';
import VocabularyCard from './components/VocabularyCard';
import ReadingSection from './components/ReadingSection';
import LoginView from './components/LoginView';
import WordGame from './components/WordGame';
import SpellingGame from './components/SpellingGame';
import UnscrambleGame from './components/UnscrambleGame';
import QuizSection from './components/QuizSection';
import ProfileView from './components/ProfileView';
import SentencePractice from './components/SentencePractice';

type AppViewMode = 'dashboard' | 'today' | 'review' | 'mastered' | 'game-hub' | 'game-match' | 'game-spelling' | 'game-unscramble' | 'quiz' | 'profile' | 'summary';

const INITIAL_STATS: StudyStats = {
  totalLearned: 0,
  currentDay: 1,
  streak: 0,
  lastStudyDate: '',
  quizScore: 0,
  totalSeconds: 0,
  history: []
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | 'Random'>('Random');
  const [selectedGrade, setSelectedGrade] = useState<number>(2);
  const [viewMode, setViewMode] = useState<AppViewMode>('dashboard');
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [currentTodayIdx, setCurrentTodayIdx] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [studyStep, setStudyStep] = useState<'card' | 'writing'>('card');
  const [dailyFeedback, setDailyFeedback] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [stats, setStats] = useState<StudyStats>(INITIAL_STATS);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  useEffect(() => {
    const savedSession = localStorage.getItem('kid-english-active-user');
    if (savedSession) {
      try {
        const userData = JSON.parse(savedSession);
        handleLogin(userData, userData.grade || 2);
      } catch (e) {
        localStorage.removeItem('kid-english-active-user');
      }
    }
  }, []);

  const handleLogin = (userData: User, grade: number) => {
    const userKey = `kid-db-${userData.name.toLowerCase().trim()}`;
    const db = localStorage.getItem(userKey);
    let userToSet = { ...userData, grade };
    setVocabList([]);
    setPassages([]);
    setCurrentTodayIdx(0);
    setStats(INITIAL_STATS);
    if (db) {
      try {
        const savedData = JSON.parse(db);
        setVocabList(savedData.vocabList || []);
        setStats(savedData.stats || INITIAL_STATS);
        setPassages(savedData.passages || []);
        setCurrentTodayIdx(savedData.currentTodayIdx || 0);
        if (savedData.grade) {
          userToSet.grade = savedData.grade;
          setSelectedGrade(savedData.grade);
        }
      } catch (e) {}
    } else {
      setSelectedGrade(grade);
    }
    setUser(userToSet);
    localStorage.setItem('kid-english-active-user', JSON.stringify(userToSet));
    setViewMode('dashboard');
  };

  const saveUserData = () => {
    if (!user) return;
    const userKey = `kid-db-${user.name.toLowerCase().trim()}`;
    const dataToSave = { vocabList, stats, passages, currentTodayIdx, grade: selectedGrade, lastUpdated: new Date().toISOString() };
    localStorage.setItem(userKey, JSON.stringify(dataToSave));
  };

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(saveUserData, 1000);
    return () => clearTimeout(timer);
  }, [vocabList, stats, passages, currentTodayIdx, selectedGrade]);

  const handleLogout = () => {
    if (window.confirm("Con muốn thoát hả? Mẹ lưu rồi nhé!")) {
      saveUserData();
      localStorage.removeItem('kid-english-active-user');
      setUser(null);
      setVocabList([]);
      setPassages([]);
      setCurrentTodayIdx(0);
      setStats(INITIAL_STATS);
      setViewMode('dashboard');
    }
  };

  useEffect(() => {
    if (!user || isTimerPaused || viewMode === 'dashboard') return;
    const interval = setInterval(() => {
      setStats(prev => {
        const today = new Date().toLocaleDateString();
        const updatedHistory = [...prev.history];
        const todayIdx = updatedHistory.findIndex(h => h.date === today);
        if (todayIdx > -1) updatedHistory[todayIdx].seconds += 1;
        else updatedHistory.push({ date: today, seconds: 1 });
        return { ...prev, totalSeconds: prev.totalSeconds + 1, history: updatedHistory };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [user, isTimerPaused, viewMode]);

  const masteredCount = useMemo(() => vocabList.filter(v => v.isMastered).length, [vocabList]);

  const todayWords = useMemo(() => {
    const startOfToday = new Date().setHours(0,0,0,0);
    return vocabList.filter(item => item.learnedAt >= startOfToday && !item.isMastered);
  }, [vocabList]);

  const dailyGoal = user?.preferences?.dailyGoal || 10;
  const dailyProgress = Math.min(100, (todayWords.length / dailyGoal) * 100);

  const handleStartDaily = async () => {
    if (!isOnline) { alert("Cần internet để Bà Bô soạn bài!"); return; }
    setLoading(true);
    try {
      const topic = selectedTopic === 'Random' ? TOPICS[Math.floor(Math.random() * TOPICS.length)] : selectedTopic;
      const newItems = await generateDailySet(topic, dailyGoal, selectedGrade);
      setVocabList(prev => [...newItems, ...prev]);
      setStats(s => ({ ...s, totalLearned: s.totalLearned + newItems.length }));
      const newPassages = await generateReadingPassages(newItems.map(i => i.word), selectedGrade);
      setPassages(newPassages);
      setCurrentTodayIdx(0);
      setStudyStep('card');
      setViewMode('today');
    } catch (err) {
      alert("Lỗi rồi con ơi!");
    } finally {
      setLoading(false);
    }
  };

  const handleFinishDay = async () => {
    setLoading(true);
    setIsFullscreen(false);
    try {
      const words = todayWords.map(w => w.word);
      const feedback = await getDailyPerformanceReview(words, stats);
      setDailyFeedback(feedback);
      setViewMode('summary');
    } catch (err) {
      setDailyFeedback("Con đã hoàn thành bài rồi! Nhanh hơn Bông Béo rồi đấy.");
      setViewMode('summary');
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleMastered = (id: string) => {
    setVocabList(prev => prev.map(item => item.id === id ? { ...item, isMastered: !item.isMastered } : item));
  };

  if (!user) return <LoginView onLogin={handleLogin} />;

  return (
    <div className={`min-h-screen bg-rose-50 flex flex-col font-sans transition-all ${isFullscreen ? 'p-0' : 'pb-20'}`}>
      
      {/* Header chỉ hiện khi không fullscreen */}
      {!isFullscreen && (
        <>
          <div className="bg-rose-600 text-white sticky top-0 z-[70] shadow-md border-b border-rose-700">
            <div className="px-6 py-2.5 flex items-center justify-between max-w-4xl mx-auto w-full">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-[10px] font-black uppercase text-rose-200">Mẹ theo dõi:</span>
                <div className="flex-1 h-3 bg-rose-900/30 rounded-full overflow-hidden border border-white/10">
                  <div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${dailyProgress}%` }}></div>
                </div>
                <span className="text-[10px] font-black">{todayWords.length}/{dailyGoal} từ</span>
              </div>
              <div className="ml-6 flex items-center gap-4">
                 <div className="text-yellow-200 font-mono font-bold text-xs"><i className="fas fa-clock mr-1"></i>{Math.floor(stats.totalSeconds / 60)}p</div>
                 <button onClick={() => setViewMode('profile')} className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white/30"><img src={user.avatar} className="w-full h-full object-cover" /></button>
              </div>
            </div>
          </div>

          <header className="bg-white border-b border-rose-100 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewMode('dashboard')}>
              <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg"><i className="fas fa-heart text-xl"></i></div>
              <div><h1 className="text-xl font-black text-rose-600">Bà Bô Tutor</h1><span className="text-[10px] font-black uppercase text-slate-400">Học cho mẹ vui</span></div>
            </div>
            <div className="flex items-center gap-3">
               <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value as Topic | 'Random')} className="bg-rose-50 p-2.5 rounded-xl text-xs font-black border-2 border-rose-100 text-rose-600"><option value="Random">🎲 Ngẫu nhiên</option>{TOPICS.map(t => <option key={t} value={t}>{t}</option>)}</select>
               <button onClick={handleStartDaily} disabled={loading} className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg">Soạn bài mới</button>
            </div>
          </header>
        </>
      )}

      {/* Main Content */}
      <main className={`flex-grow w-full transition-all ${isFullscreen ? 'fixed inset-0 z-[100] bg-rose-50 overflow-y-auto p-4 md:p-12 flex flex-col' : 'max-w-[800px] mx-auto px-6 py-8'}`}>
        
        {isFullscreen && (
          <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto w-full">
            <button onClick={toggleFullscreen} className="px-4 py-2 bg-white rounded-xl shadow-sm text-rose-500 font-black text-xs uppercase flex items-center gap-2">
              <i className="fas fa-compress"></i> Thoát toàn màn hình
            </button>
            <div className="text-rose-400 font-black text-xs uppercase tracking-widest">Đang tập trung học bài...</div>
          </div>
        )}

        {viewMode === 'dashboard' ? (
          <div className="animate-fadeIn space-y-10">
            <div className="bg-white rounded-[3rem] p-10 border-4 border-rose-100 shadow-xl flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 bg-rose-100 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-inner border-4 border-white">👩‍🏫</div>
              <div className="text-center md:text-left space-y-4 flex-1">
                <h2 className="text-3xl font-black text-slate-900">Chào con yêu {user.name}!</h2>
                <p className="text-slate-500 font-bold">Mẹ đã soạn xong bài Lớp {selectedGrade} cho con. Cố lên con nhé!</p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button onClick={() => setViewMode('today')} className="px-10 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-xl flex items-center gap-3 hover:scale-105 transition-all"><i className="fas fa-play"></i> Bắt đầu học bài</button>
                  <button onClick={() => setViewMode('game-hub')} className="px-10 py-4 bg-amber-500 text-white rounded-2xl font-black shadow-xl flex items-center gap-3 hover:scale-105 transition-all"><i className="fas fa-gamepad"></i> Chơi Game</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={() => setViewMode('game-hub')} className="bg-indigo-500 p-8 rounded-[2.5rem] text-white cursor-pointer hover:scale-[1.02] transition-all shadow-xl group">
                    <div className="text-4xl mb-4 group-hover:rotate-12 transition-transform">🎮</div>
                    <h3 className="text-xl font-black mb-1">Khu vui chơi</h3>
                    <p className="text-white/70 text-sm font-bold">Giải trí sau khi học bài xong con nhé!</p>
                </div>
                <div onClick={() => setViewMode('quiz')} className="bg-emerald-500 p-8 rounded-[2.5rem] text-white cursor-pointer hover:scale-[1.02] transition-all shadow-xl group">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-all">📝</div>
                    <h3 className="text-xl font-black mb-1">Mẹ kiểm tra bài</h3>
                    <p className="text-white/70 text-sm font-bold">Thử sức xem con nhớ được bao nhiêu rồi!</p>
                </div>
            </div>
          </div>
        ) : viewMode === 'summary' ? (
          <div className="animate-scaleIn max-w-xl mx-auto space-y-8 my-auto">
             <div className="bg-white rounded-[3rem] p-12 border-8 border-rose-100 shadow-2xl text-center space-y-6">
                <div className="text-7xl mb-4">🏠</div>
                <h2 className="text-3xl font-black text-slate-900">Lời dặn của Bà Bô</h2>
                <div className="p-8 bg-rose-50 rounded-[2rem] border-2 border-rose-100 text-slate-700 font-bold leading-relaxed italic whitespace-pre-wrap">"{dailyFeedback}"</div>
                <button onClick={() => setViewMode('dashboard')} className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black shadow-lg">Dạ, con nhớ rồi mẹ!</button>
             </div>
          </div>
        ) : viewMode === 'today' && todayWords.length > 0 ? (
          <div className={`space-y-8 flex-grow ${isFullscreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border-2 border-rose-100 shadow-sm sticky top-4 z-50">
              <button onClick={() => { if(currentTodayIdx>0) { setCurrentTodayIdx(currentTodayIdx-1); setStudyStep('card'); }}} disabled={currentTodayIdx===0} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 disabled:opacity-30"><i className="fas fa-chevron-left"></i></button>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Từ {currentTodayIdx + 1} / {todayWords.length}</span>
                {!isFullscreen && (
                  <button onClick={toggleFullscreen} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center text-xs" title="Mở toàn màn hình">
                    <i className="fas fa-expand"></i>
                  </button>
                )}
              </div>
              <button onClick={() => setStudyStep(studyStep === 'card' ? 'writing' : 'card')} className="px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase">Chuyển bước</button>
            </div>

            <div className="animate-fadeIn">
              {studyStep === 'card' ? (
                <div className="space-y-8">
                  <VocabularyCard item={todayWords[currentTodayIdx]} onToggleMastered={toggleMastered} />
                  <button onClick={() => setStudyStep('writing')} className="w-full py-6 bg-rose-500 text-white rounded-[2rem] font-black shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-lg">Mẹ cho con viết thử nào <i className="fas fa-arrow-right"></i></button>
                </div>
              ) : (
                <SentencePractice word={todayWords[currentTodayIdx].word} onSuccess={() => {
                  if (currentTodayIdx < todayWords.length - 1) {
                    setCurrentTodayIdx(currentTodayIdx + 1);
                    setStudyStep('card');
                  } else {
                    handleFinishDay();
                  }
                }} />
              )}
            </div>
            {passages.length > 0 && <ReadingSection passages={passages} />}
          </div>
        ) : viewMode === 'game-hub' ? (
           <div className="space-y-8">
              <div className="text-center"><h2 className="text-3xl font-black text-slate-900">Khu vui chơi của Bà Bô</h2><p className="text-slate-500 font-bold">Chơi xong nhớ quay lại học bài đấy nhé!</p></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => setViewMode('game-match')} className="bg-white p-8 rounded-[2.5rem] border-4 border-amber-100 hover:border-amber-400 cursor-pointer transition-all shadow-lg text-center"><div className="text-5xl mb-4">🧩</div><h4 className="font-black text-lg">Ghép đôi</h4></div>
                <div onClick={() => setViewMode('game-spelling')} className="bg-white p-8 rounded-[2.5rem] border-4 border-indigo-100 hover:border-indigo-400 cursor-pointer transition-all shadow-lg text-center"><div className="text-5xl mb-4">🐝</div><h4 className="font-black text-lg">Spelling Bee</h4></div>
                <div onClick={() => setViewMode('game-unscramble')} className="bg-white p-8 rounded-[2.5rem] border-4 border-rose-100 hover:border-rose-400 cursor-pointer transition-all shadow-lg text-center"><div className="text-5xl mb-4">🔠</div><h4 className="font-black text-lg">Xếp chữ</h4></div>
              </div>
              <button onClick={() => setViewMode('dashboard')} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs">Về Trang Chủ</button>
           </div>
        ) : viewMode === 'game-match' ? (
           <WordGame vocabList={vocabList} onExit={() => setViewMode('game-hub')} />
        ) : viewMode === 'game-spelling' ? (
           <SpellingGame words={vocabList} onExit={() => setViewMode('game-hub')} />
        ) : viewMode === 'game-unscramble' ? (
           <UnscrambleGame words={vocabList} onExit={() => setViewMode('game-hub')} />
        ) : viewMode === 'quiz' ? (
           <QuizSection words={vocabList} onFinish={() => setViewMode('dashboard')} />
        ) : viewMode === 'profile' ? (
          <ProfileView user={user} stats={stats} onUpdateUser={(u) => { setUser(u); saveUserData(); }} onBack={() => setViewMode('dashboard')} onLogout={handleLogout} />
        ) : (
          <div className="text-center py-24 bg-white/50 rounded-[4rem] border-4 border-dashed border-rose-100">
             <div className="text-7xl mb-6">🎒</div>
             <h3 className="text-2xl font-black text-slate-800">Con học hết bài rồi nhé!</h3>
             <button onClick={handleStartDaily} className="mt-8 px-10 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-lg">Mẹ soạn bài mới cho con</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
