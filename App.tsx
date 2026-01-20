
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
  const [isSyncing, setIsSyncing] = useState(false);

  const [stats, setStats] = useState<StudyStats>({
    totalLearned: 0,
    currentDay: 1,
    streak: 0,
    lastStudyDate: '',
    quizScore: 0,
    totalSeconds: 0,
    history: []
  });

  // Kiểm tra trạng thái mạng
  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  // Tự động khôi phục tài khoản đã đăng nhập
  useEffect(() => {
    const savedSession = localStorage.getItem('kid-english-active-user');
    if (savedSession) {
      try {
        const userData = JSON.parse(savedSession);
        handleLogin(userData, userData.grade || 2);
      } catch (e) {
        console.error("Session restore error", e);
      }
    }
  }, []);

  const handleLogin = (userData: User, grade: number) => {
    const finalUser = { ...userData, grade };
    setUser(finalUser);
    setSelectedGrade(grade);
    
    // Lưu phiên làm việc hiện tại
    localStorage.setItem('kid-english-active-user', JSON.stringify(finalUser));
    
    // Tải dữ liệu riêng của người dùng này
    const userKey = `kid-db-${userData.name.toLowerCase().trim()}`;
    const db = localStorage.getItem(userKey);
    
    if (db) {
      try {
        const savedData = JSON.parse(db);
        setVocabList(savedData.vocabList || []);
        setStats(savedData.stats || stats);
        setPassages(savedData.passages || []);
        setCurrentTodayIdx(savedData.currentTodayIdx || 0);
      } catch (e) {
        console.error("Database parse error", e);
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bé có muốn thoát không? Mọi tiến trình đã được Gấu Tutor lưu lại rồi nhé!")) {
      // Trước khi thoát, lưu lại lần cuối
      saveUserData();
      localStorage.removeItem('kid-english-active-user');
      setUser(null);
      setVocabList([]);
      setPassages([]);
      setCurrentTodayIdx(0);
    }
  };

  // Implement handleImportData to update app state from imported backup file
  const handleImportData = (data: any) => {
    if (data.user) setUser(data.user);
    if (data.stats) setStats(data.stats);
    if (data.vocabList) setVocabList(data.vocabList);
    if (data.passages) setPassages(data.passages);
    if (data.currentTodayIdx !== undefined) setCurrentTodayIdx(data.currentTodayIdx);
  };

  // Hàm lưu dữ liệu vào "Máy chủ" (LocalStorage giả lập)
  const saveUserData = () => {
    if (!user) return;
    const userKey = `kid-db-${user.name.toLowerCase().trim()}`;
    const dataToSave = {
      vocabList,
      stats,
      passages,
      currentTodayIdx,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(userKey, JSON.stringify(dataToSave));
  };

  // Tự động lưu khi có thay đổi quan trọng
  useEffect(() => {
    const timer = setTimeout(saveUserData, 1000);
    return () => clearTimeout(timer);
  }, [vocabList, stats, passages, currentTodayIdx]);

  // Đếm ngược thời gian học tập
  useEffect(() => {
    if (!user || isTimerPaused) return;
    const interval = setInterval(() => {
      setStats(prev => {
        const today = new Date().toLocaleDateString();
        const updatedHistory = [...prev.history];
        const todayIdx = updatedHistory.findIndex(h => h.date === today);
        if (todayIdx > -1) {
          updatedHistory[todayIdx].seconds += 1;
        } else {
          updatedHistory.push({ date: today, seconds: 1 });
        }
        return { ...prev, totalSeconds: prev.totalSeconds + 1, history: updatedHistory };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [user, isTimerPaused]);

  // Tính toán tiến độ
  const masteredCount = useMemo(() => vocabList.filter(v => v.isMastered).length, [vocabList]);
  const progress5000 = Math.min(100, (masteredCount / 5000) * 100);

  const todayWords = useMemo(() => {
    const startOfToday = new Date().setHours(0,0,0,0);
    return vocabList.filter(item => item.learnedAt >= startOfToday && !item.isMastered);
  }, [vocabList]);

  const dailyGoal = user?.preferences?.dailyGoal || 10;
  const dailyProgress = Math.min(100, (todayWords.length / dailyGoal) * 100);

  const handleStartDaily = async () => {
    if (!isOnline) {
      alert("Cần internet để tải bài học mới nhé bé ơi!");
      return;
    }
    setLoading(true);
    try {
      const topic = selectedTopic === 'Random' ? TOPICS[Math.floor(Math.random() * TOPICS.length)] : selectedTopic;
      const newItems = await generateDailySet(topic, dailyGoal, selectedGrade);
      setVocabList(prev => [...newItems, ...prev]);
      setStats(s => ({ ...s, totalLearned: s.totalLearned + newItems.length }));
      const newPassages = await generateReadingPassages(newItems.map(i => i.word), selectedGrade);
      setPassages(newPassages);
      setCurrentTodayIdx(0);
      setViewMode('today');
    } catch (err) {
      alert("Gấu Tutor đang bận tí, bé thử lại sau nhé!");
    } finally {
      setLoading(false);
    }
  };

  const toggleMastered = (id: string) => {
    setVocabList(prev => prev.map(item => item.id === id ? { ...item, isMastered: !item.isMastered } : item));
  };

  if (!user) return <LoginView onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col font-sans pb-20">
      {/* Global Progress Bar: 5000 Words Goal */}
      <div className="bg-indigo-700 text-white px-6 py-1.5 flex items-center justify-between sticky top-0 z-[70] shadow-md">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Hành trình 5000 từ:</span>
          <div className="flex-1 h-2 bg-indigo-900/50 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-1000 shadow-[0_0_10px_rgba(251,191,36,0.5)]" 
              style={{ width: `${progress5000}%` }}
            ></div>
          </div>
          <span className="text-[10px] font-black">{masteredCount}/5000</span>
        </div>
        {!isOnline && (
          <div className="ml-4 px-3 py-0.5 bg-rose-500 rounded-full text-[9px] font-black uppercase animate-pulse">
            Ngoại tuyến
          </div>
        )}
      </div>

      <div className="bg-slate-900 text-white sticky top-[33px] z-[60] shadow-xl">
        <div className="px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <span className="text-[9px] font-black uppercase text-orange-400">Hôm nay:</span>
            <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden relative">
              <div 
                className={`h-full transition-all duration-1000 ${todayWords.length >= dailyGoal ? 'bg-emerald-500' : 'bg-orange-500'}`} 
                style={{ width: `${dailyProgress}%` }}
              ></div>
            </div>
            <span className="text-xs font-black">{todayWords.length}/{dailyGoal}</span>
          </div>
          <div className="ml-6 flex items-center gap-3">
             <div className="text-emerald-400 font-mono font-bold text-xs">{Math.floor(stats.totalSeconds / 60)}m {stats.totalSeconds % 60}s</div>
             <button onClick={() => setViewMode('profile')} className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 hover:border-orange-500 transition-all">
                <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
             </button>
             <button onClick={handleLogout} className="text-white/40 hover:text-white transition-colors" title="Thoát tài khoản">
                <i className="fas fa-sign-out-alt"></i>
             </button>
          </div>
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
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
             </div>
             <button 
                onClick={handleStartDaily} 
                disabled={loading || !isOnline} 
                className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-black shadow-md hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-rocket mr-2"></i>}
                Học bài mới
              </button>
          </div>

          <div className="flex items-center gap-2 border-l-2 border-slate-100 pl-3">
            <button onClick={() => setViewMode('game')} className="px-4 py-3 bg-purple-500 text-white rounded-2xl text-xs font-black shadow-lg hover:bg-purple-600 transition-all">
              Ghép Từ
            </button>
            <button onClick={() => setViewMode('quiz')} className="px-4 py-3 bg-blue-500 text-white rounded-2xl text-xs font-black shadow-lg hover:bg-blue-600 transition-all">
              Kiểm tra
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-[1000px] mx-auto px-6 py-8 w-full">
        {viewMode === 'profile' ? (
          <ProfileView 
            user={user} 
            stats={stats} 
            onUpdateUser={(u) => { setUser(u); saveUserData(); }} 
            onBack={() => setViewMode('today')}
            vocabList={vocabList}
            passages={passages}
            onImportData={(data) => { handleImportData(data); saveUserData(); }}
          />
        ) : (
          <>
            {viewMode !== 'game' && viewMode !== 'quiz' && (
              <div className="flex bg-white p-2 rounded-3xl border-2 border-orange-100 gap-2 mb-10 shadow-sm max-w-md mx-auto">
                <button onClick={() => setViewMode('today')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${viewMode === 'today' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500 hover:bg-orange-50'}`}>Hôm nay ({todayWords.length})</button>
                <button onClick={() => setViewMode('review')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${viewMode === 'review' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-500 hover:bg-rose-50'}`}>Ôn tập</button>
                <button onClick={() => setViewMode('mastered')} className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${viewMode === 'mastered' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:bg-emerald-50'}`}>Đã thuộc</button>
              </div>
            )}

            {viewMode === 'game' ? (
              <WordGame vocabList={vocabList} onExit={() => setViewMode('today')} />
            ) : viewMode === 'quiz' ? (
              <QuizSection words={vocabList} onFinish={() => setViewMode('today')} />
            ) : viewMode === 'review' ? (
              <ReviewSection words={vocabList.filter(v => !v.isMastered)} title="Ôn tập kiến thức" onReviewComplete={() => {}} onPause={setIsTimerPaused} onExit={() => setViewMode('today')} />
            ) : viewMode === 'today' && todayWords.length > 0 ? (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex justify-between items-center bg-white p-3 rounded-2xl border-2 border-orange-100 shadow-sm mb-4">
                  <button onClick={() => setCurrentTodayIdx(Math.max(0, currentTodayIdx - 1))} disabled={currentTodayIdx === 0} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl font-black text-[10px] uppercase disabled:opacity-30">
                      Quay lại
                  </button>
                  <div className="text-[10px] font-black text-slate-400">Từ {currentTodayIdx + 1} / {todayWords.length}</div>
                  <button onClick={() => setIsTimerPaused(!isTimerPaused)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-xl font-black text-[10px] uppercase">
                      <i className={`fas ${isTimerPaused ? 'fa-play' : 'fa-pause'}`}></i>
                  </button>
                </div>
                
                <div className={isTimerPaused ? 'blur-md pointer-events-none grayscale' : ''}>
                  <VocabularyCard key={todayWords[currentTodayIdx]?.id} item={todayWords[currentTodayIdx]} onToggleMastered={toggleMastered} />
                  <div className="flex justify-center mt-6">
                      {currentTodayIdx < todayWords.length - 1 ? (
                        <button onClick={() => setCurrentTodayIdx(currentTodayIdx + 1)} className="px-12 py-5 bg-orange-500 text-white rounded-[2rem] font-black shadow-xl hover:scale-105 transition-all">Từ tiếp theo <i className="fas fa-arrow-right ml-2"></i></button>
                      ) : (
                        <div className="text-center p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-100">
                           <p className="font-black text-emerald-600">Bé đã hoàn thành bài học hôm nay! 🏆</p>
                           <button onClick={() => setViewMode('profile')} className="mt-4 text-xs font-black text-emerald-500 underline">Xem huy hiệu</button>
                        </div>
                      )}
                  </div>
                </div>
                {passages.length > 0 && <ReadingSection passages={passages} />}
              </div>
            ) : (
              <div className="space-y-6">
                {(viewMode === 'mastered' ? vocabList.filter(v => v.isMastered) : vocabList).map(item => (
                  <VocabularyCard key={item.id} item={item} onToggleMastered={toggleMastered} />
                ))}
                {vocabList.length === 0 && (
                  <div className="text-center py-24 bg-white/40 rounded-[4rem] border-4 border-dashed border-orange-100">
                      <div className="text-7xl mb-6">🎒</div>
                      <h3 className="text-2xl font-black text-slate-800">Chào mừng {user.name}!</h3>
                      <p className="text-sm font-bold text-slate-400 mt-2">Nhấn "Học bài mới" để bắt đầu nhé.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
