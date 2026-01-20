
import React, { useState, useEffect, useMemo } from 'react';
import { VocabularyItem, Topic, TOPICS, StudyStats, ReadingPassage, User, ViewMode } from './types';
import { generateDailySet, generateReadingPassages } from './geminiService';
import VocabularyCard from './components/VocabularyCard';
import ReadingSection from './components/ReadingSection';
import ReviewSection from './components/ReviewSection';
import LoginView from './components/LoginView';
import WordGame from './components/WordGame';
import QuizSection from './components/QuizSection';
import ProfileView from './components/ProfileView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | 'Random'>('Random');
  const [selectedGrade, setSelectedGrade] = useState<number>(2);
  const [viewMode, setViewMode] = useState<'today' | 'review' | 'mastered' | 'game' | 'quiz' | 'profile'>('today');
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [currentTodayIdx, setCurrentTodayIdx] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [stats, setStats] = useState<StudyStats>({
    totalLearned: 0,
    currentDay: 1,
    streak: 0,
    lastStudyDate: '',
    quizScore: 0,
    totalSeconds: 0,
    history: []
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const lastSessionUser = localStorage.getItem('kid-english-current-session');
    if (lastSessionUser) {
      const userData = JSON.parse(lastSessionUser);
      handleLogin(userData, userData.grade || 2);
    }
  }, []);

  const updateStreak = (currentStats: StudyStats) => {
    const today = new Date().toLocaleDateString();
    if (currentStats.lastStudyDate === today) return currentStats;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString();
    let newStreak = currentStats.streak;
    if (!currentStats.lastStudyDate) newStreak = 1;
    else if (currentStats.lastStudyDate === yesterdayStr) newStreak += 1;
    else newStreak = 1;
    return { ...currentStats, streak: newStreak, lastStudyDate: today };
  };

  const handleLogin = (userData: User, grade: number) => {
    const finalUser = { 
      ...userData, 
      grade,
      preferences: userData.preferences || { dailyGoal: 10, reminders: true, soundEnabled: true }
    };
    setUser(finalUser);
    setSelectedGrade(grade);
    
    localStorage.setItem('kid-english-current-session', JSON.stringify(finalUser));
    
    const userKey = `kid-user-${userData.name.toLowerCase().trim()}`;
    const savedVocab = localStorage.getItem(`${userKey}-vocab`);
    const savedStats = localStorage.getItem(`${userKey}-stats`);
    const savedPassages = localStorage.getItem(`${userKey}-passages`);
    
    if (savedVocab) {
      setVocabList(JSON.parse(savedVocab));
    } else {
      setVocabList([]);
    }

    if (savedStats) {
      setStats(updateStreak(JSON.parse(savedStats)));
    } else {
      setStats({
        totalLearned: 0,
        currentDay: 1,
        streak: 0,
        lastStudyDate: '',
        quizScore: 0,
        totalSeconds: 0,
        history: []
      });
    }

    if (savedPassages) {
      setPassages(JSON.parse(savedPassages));
    } else {
      setPassages([]);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setVocabList([]);
    setPassages([]);
    localStorage.removeItem('kid-english-current-session');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('kid-english-current-session', JSON.stringify(updatedUser));
  };

  useEffect(() => {
    if (!user || isTimerPaused) return;
    const interval = setInterval(() => {
      setStats(prev => {
        const today = new Date().toLocaleDateString();
        const updatedHistory = [...prev.history];
        const todayIndex = updatedHistory.findIndex(h => h.date === today);
        if (todayIndex > -1) {
          updatedHistory[todayIndex] = { ...updatedHistory[todayIndex], seconds: updatedHistory[todayIndex].seconds + 1 };
        } else {
          updatedHistory.push({ date: today, seconds: 1 });
        }
        return { ...prev, totalSeconds: prev.totalSeconds + 1, history: updatedHistory };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [user, isTimerPaused]);

  useEffect(() => {
    if (!user) return;
    const userKey = `kid-user-${user.name.toLowerCase().trim()}`;
    localStorage.setItem(`${userKey}-vocab`, JSON.stringify(vocabList));
    localStorage.setItem(`${userKey}-stats`, JSON.stringify(stats));
    localStorage.setItem(`${userKey}-passages`, JSON.stringify(passages));
  }, [vocabList, stats, passages, user]);

  const todayWords = useMemo(() => {
    const startOfToday = new Date().setHours(0,0,0,0);
    return vocabList.filter(item => item.learnedAt >= startOfToday && !item.isMastered);
  }, [vocabList]);

  const dailyGoal = user?.preferences?.dailyGoal || 10;
  const dailyProgress = Math.min(100, (todayWords.length / dailyGoal) * 100);
  const isGoalMet = todayWords.length >= dailyGoal;

  const reviewDueWords = useMemo(() => {
    const now = Date.now();
    return vocabList.filter(item => !item.isMastered && item.nextReview <= now);
  }, [vocabList]);

  const masteredWords = useMemo(() => vocabList.filter(item => item.isMastered), [vocabList]);

  const handleStartDaily = async () => {
    if (!isOnline) {
      alert("Bé ơi, cần internet để tải bài học mới nhé! Bé có thể ôn tập các từ đã học ở chế độ ngoại tuyến.");
      return;
    }
    setLoading(true);
    try {
      const topicToFetch = selectedTopic === 'Random' ? TOPICS[Math.floor(Math.random() * TOPICS.length)] : selectedTopic;
      const count = Math.max(5, dailyGoal - todayWords.length);
      const newItems = await generateDailySet(topicToFetch, count, selectedGrade);
      setVocabList(prev => [...newItems, ...prev]);
      setStats(s => ({ ...s, totalLearned: s.totalLearned + newItems.length }));
      const newPassages = await generateReadingPassages(newItems.map(i => i.word), selectedGrade);
      setPassages(newPassages);
      setCurrentTodayIdx(0);
      setViewMode('today');
    } catch (err) { 
      alert("Lỗi tải bài học! Bé thử lại hoặc chọn chủ đề khác nhé."); 
    } finally { 
      setLoading(false); 
    }
  };

  const toggleMastered = (id: string) => {
    setVocabList(prev => prev.map(item => item.id === id ? { ...item, isMastered: !item.isMastered } : item));
  };

  const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

  if (!user) return <LoginView onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col font-sans pb-20">
      <div className="bg-slate-900 text-white sticky top-0 z-[60] shadow-xl">
        {!isOnline && (
          <div className="bg-amber-500 text-slate-900 text-[10px] font-black py-1 px-4 text-center uppercase tracking-widest flex items-center justify-center gap-2">
            <i className="fas fa-plane-departure"></i> Chế độ ngoại tuyến: Dữ liệu của {user.name} đã được nạp!
          </div>
        )}
        <div className="px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <span className="text-[9px] font-black uppercase text-orange-400">Hôm nay:</span>
            <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden relative">
              <div className={`h-full transition-all duration-1000 ${isGoalMet ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${dailyProgress}%` }}></div>
            </div>
            <span className={`text-xs font-black ${isGoalMet ? 'text-emerald-400' : 'text-white'}`}>
              {todayWords.length}/{dailyGoal}
              {isGoalMet && <i className="fas fa-check-circle ml-1"></i>}
            </span>
          </div>
          <div className="ml-6 flex items-center gap-3">
             <div className="text-emerald-400 font-mono font-bold text-xs">{formatDuration(stats.totalSeconds)}</div>
             <button onClick={() => setViewMode('profile')} className="w-8 h-8 rounded-full overflow-hidden border border-white/20 hover:ring-2 ring-orange-500 transition-all">
                <img src={user.avatar} className="w-full h-full object-cover" />
             </button>
             <button onClick={handleLogout} className="text-white/40 hover:text-white" title="Đăng xuất tài khoản"><i className="fas fa-sign-out-alt"></i></button>
          </div>
        </div>
        <div className="px-6 pb-2 border-t border-white/5 flex gap-4">
           <div className="flex items-center gap-1 text-orange-400">
              <i className="fas fa-fire text-xs"></i>
              <span className="text-[11px] font-black">{stats.streak} ngày</span>
           </div>
           <div className="flex items-center gap-1 text-blue-400">
              <i className="fas fa-graduation-cap text-xs"></i>
              <span className="text-[11px] font-black">Lớp {selectedGrade}</span>
           </div>
           <div className="ml-auto text-[9px] font-black text-slate-500 uppercase">Tài khoản: {user.name}</div>
        </div>
      </div>

      <header className="bg-white border-b border-orange-100 px-6 h-auto md:h-24 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewMode('today')}>
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200"><i className="fas fa-star text-xl"></i></div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none">KidEnglish</h1>
            <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Magic Learning</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center bg-orange-50 p-1.5 rounded-2xl border-2 border-orange-100 gap-1">
             <div className="px-3 flex items-center gap-2">
                <i className="fas fa-bookmark text-orange-400 text-xs"></i>
                <select 
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value as Topic | 'Random')}
                  className="bg-transparent border-none text-slate-700 text-xs font-black appearance-none cursor-pointer outline-none"
                  disabled={!isOnline}
                >
                  <option value="Random">🎲 Ngẫu nhiên</option>
                  {TOPICS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
             </div>
             <button 
                onClick={handleStartDaily} 
                disabled={loading || !isOnline} 
                className={`px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-black shadow-md hover:bg-orange-600 transition-all active:scale-95 flex items-center gap-2 ${loading || !isOnline ? 'opacity-50' : ''}`}
              >
                {loading ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-rocket"></i>}
                {isOnline ? 'Học bài mới' : 'Ngoại tuyến'}
              </button>
          </div>

          <div className="flex items-center gap-2 border-l-2 border-slate-100 pl-3">
            <button onClick={() => setViewMode('game')} className="px-4 py-3 bg-purple-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-purple-100 hover:bg-purple-600 transition-all active:scale-95 flex items-center gap-2">
              <i className="fas fa-puzzle-piece"></i> Ghép Từ
            </button>
            <button onClick={() => setViewMode('quiz')} className="px-4 py-3 bg-blue-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2">
              <i className="fas fa-feather-alt"></i> Kiểm tra
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-[1000px] mx-auto px-6 py-8 w-full">
        {viewMode === 'profile' ? (
          <ProfileView 
            user={user} 
            stats={stats} 
            onUpdateUser={handleUpdateUser} 
            onBack={() => setViewMode('today')} 
          />
        ) : (
          <>
            {isGoalMet && viewMode === 'today' && (
              <div className="mb-8 bg-emerald-500 text-white p-6 rounded-[2rem] shadow-xl flex items-center justify-between animate-bounceIn border-4 border-white">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">🌟</div>
                  <div>
                    <h3 className="text-xl font-black">Bé giỏi quá!</h3>
                    <p className="text-sm font-bold opacity-90">Bé đã hoàn thành mục tiêu {dailyGoal} từ cho hôm nay!</p>
                  </div>
                </div>
                <div className="text-3xl">🏆</div>
              </div>
            )}

            {viewMode !== 'game' && viewMode !== 'quiz' && (
              <div className="flex bg-white p-2 rounded-3xl border-2 border-orange-100 gap-2 mb-10 shadow-sm max-w-md mx-auto">
                <button onClick={() => { setViewMode('today'); setCurrentTodayIdx(0); }} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${viewMode === 'today' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500 hover:bg-orange-50'}`}>Hôm nay ({todayWords.length})</button>
                <button onClick={() => setViewMode('review')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${viewMode === 'review' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-500 hover:bg-rose-50'}`}>Ôn tập ({reviewDueWords.length})</button>
                <button onClick={() => setViewMode('mastered')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${viewMode === 'mastered' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:bg-emerald-50'}`}>Đã thuộc ({masteredWords.length})</button>
              </div>
            )}

            {viewMode === 'game' ? (
              <div className="max-w-4xl mx-auto">
                <WordGame vocabList={vocabList} onExit={() => setViewMode('today')} />
              </div>
            ) : viewMode === 'quiz' ? (
              <QuizSection words={vocabList} onFinish={() => setViewMode('today')} />
            ) : viewMode === 'review' ? (
              <ReviewSection words={reviewDueWords} title="Vòng Quay Ôn Tập" onReviewComplete={(id, quality) => {
                 // Spaced Repetition logic implementation could go here
              }} onPause={setIsTimerPaused} onExit={() => setViewMode('today')} />
            ) : viewMode === 'today' && todayWords.length > 0 ? (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex justify-between items-center bg-white p-3 rounded-2xl border-2 border-orange-100 shadow-sm mb-4">
                  <button onClick={() => setCurrentTodayIdx(Math.max(0, currentTodayIdx - 1))} disabled={currentTodayIdx === 0} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl font-black text-[10px] uppercase disabled:opacity-30">
                      <i className="fas fa-chevron-left"></i> Quay lại
                  </button>
                  <button onClick={() => setIsTimerPaused(!isTimerPaused)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${isTimerPaused ? 'bg-amber-100 text-amber-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                      <i className={`fas ${isTimerPaused ? 'fa-play' : 'fa-pause'}`}></i> {isTimerPaused ? 'Tiếp tục' : 'Tạm dừng'}
                  </button>
                  <button onClick={() => setViewMode('mastered')} className="flex items-center gap-2 px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-xl font-black text-[10px] uppercase">
                      <i className="fas fa-stop"></i> Dừng học
                  </button>
                </div>
                
                <div className={`transition-all duration-300 ${isTimerPaused ? 'blur-md pointer-events-none grayscale' : ''}`}>
                  <VocabularyCard key={todayWords[currentTodayIdx].id} item={todayWords[currentTodayIdx]} onToggleMastered={toggleMastered} />
                  <div className="flex justify-center mt-6">
                      {currentTodayIdx < todayWords.length - 1 ? (
                        <button onClick={() => setCurrentTodayIdx(currentTodayIdx + 1)} className="px-12 py-5 bg-orange-500 text-white rounded-[2rem] font-black shadow-xl hover:scale-105 hover:bg-orange-600 transition-all">Từ tiếp theo <i className="fas fa-arrow-right ml-2"></i></button>
                      ) : (
                        <button onClick={() => setViewMode('today')} className="px-12 py-5 bg-emerald-500 text-white rounded-[2rem] font-black shadow-xl hover:scale-105 hover:bg-emerald-600 transition-all">Hoàn thành bài học! 🏆</button>
                      )}
                  </div>
                </div>
                
                {passages.length > 0 && <ReadingSection passages={passages} />}
              </div>
            ) : (
              <div className="space-y-6">
                {(viewMode === 'mastered' ? masteredWords : vocabList).map(item => (
                  <VocabularyCard key={item.id} item={item} onToggleMastered={toggleMastered} />
                ))}
                {vocabList.length === 0 && (
                  <div className="text-center py-24 bg-white/40 rounded-[4rem] border-4 border-dashed border-orange-100">
                      <div className="text-7xl mb-6">🎒</div>
                      <h3 className="text-2xl font-black text-slate-800">Bắt đầu hành trình nào!</h3>
                      <p className="text-sm font-bold text-slate-400 mt-2 max-w-xs mx-auto">Chào mừng {user.name}, hãy chọn chủ đề bé yêu thích phía trên và nhấn "Học bài mới" nhé!</p>
                  </div>
                )}
                {viewMode === 'mastered' && masteredWords.length === 0 && vocabList.length > 0 && (
                  <div className="text-center py-24 bg-white/40 rounded-[4rem] border-4 border-dashed border-orange-100">
                      <div className="text-7xl mb-6">🌟</div>
                      <h3 className="text-2xl font-black text-slate-800">Chưa có từ nào thuộc hẳn</h3>
                      <p className="text-sm font-bold text-slate-400 mt-2 max-w-xs mx-auto">Bé hãy nhấn "Thuộc rồi" ở các thẻ từ vựng để đưa chúng vào danh sách này nhé!</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {isTimerPaused && (
        <div className="fixed inset-0 z-[100] bg-orange-500/80 backdrop-blur-sm flex items-center justify-center p-6 text-center text-white">
          <div className="animate-scaleIn space-y-6">
              <div className="text-8xl">☕</div>
              <h2 className="text-4xl font-black">Đang tạm nghỉ...</h2>
              <button onClick={() => setIsTimerPaused(false)} className="px-10 py-4 bg-white text-orange-600 rounded-2xl text-xl font-black shadow-2xl transition-all">Tiếp tục học thôi!</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
