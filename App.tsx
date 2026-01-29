
import React, { useState, useEffect, useMemo } from 'react';
import { VocabularyItem, Topic, TOPICS, StudyStats, ReadingPassage, User, VirtualGift, LearningTrack } from './types';
import { generateDailySet, generateReadingPassages, getDailyPerformanceReview, generateInitialBatch } from './geminiService';
import VocabularyCard from './components/VocabularyCard';
import ReadingSection from './components/ReadingSection';
import LoginView from './components/LoginView';
import WordGame from './components/WordGame';
import SpellingGame from './components/SpellingGame';
import UnscrambleGame from './components/UnscrambleGame';
import QuizSection from './components/QuizSection';
import ProfileView from './components/ProfileView';
import SentencePractice from './components/SentencePractice';

type AppViewMode = 'dashboard' | 'today' | 'mastered' | 'game-hub' | 'game-match' | 'game-spelling' | 'game-unscramble' | 'game-quiz' | 'game-true-false' | 'game-sentence-builder' | 'game-audio-hunt' | 'game-voice-master' | 'profile' | 'summary' | 'track-select';

const INITIAL_STATS: StudyStats = {
  totalLearned: 0,
  currentDay: 1,
  streak: 0,
  lastStudyDate: '',
  quizScore: 0,
  totalSeconds: 0,
  history: [],
  unlockedGifts: []
};

const GIFTS: Omit<VirtualGift, 'unlockedAt'>[] = [
  { id: 'g1', name: 'Kem socola magic', icon: '🍦' },
  { id: 'g2', name: 'Gấu bông biết nói', icon: '🧸' },
  { id: 'g3', name: 'Siêu xe tia chớp', icon: '🏎️' },
  { id: 'g4', name: 'Vương miện công chúa', icon: '👑' },
  { id: 'g5', name: 'Pizza phô mai kéo sợi', icon: '🍕' },
  { id: 'g6', name: 'Rồng con phun lửa', icon: '🐲' },
  { id: 'g7', name: 'Bánh rán Doremon', icon: '🍩' },
  { id: 'g8', name: 'Kính vạn hoa thần kỳ', icon: '🎡' },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [vocabList, setVocabList] = useState<VocabularyItem[]>([]);
  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Đang chuẩn bị...');
  const [selectedTopic, setSelectedTopic] = useState<Topic | 'Random'>('Random');
  const [selectedGrade, setSelectedGrade] = useState<number>(2);
  const [viewMode, setViewMode] = useState<AppViewMode>('dashboard');
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [currentTodayIdx, setCurrentTodayIdx] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [studyStep, setStudyStep] = useState<'card' | 'writing'>('card');
  const [dailyFeedback, setDailyFeedback] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newGift, setNewGift] = useState<VirtualGift | null>(null);

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

  const handleLogin = async (userData: User, grade: number) => {
    const userKey = `kid-db-${userData.name.toLowerCase().trim()}`;
    const db = localStorage.getItem(userKey);
    let userToSet = { ...userData, grade };
    
    let currentVocab: VocabularyItem[] = [];
    let currentStats = INITIAL_STATS;

    if (db) {
      try {
        const savedData = JSON.parse(db);
        currentVocab = savedData.vocabList || [];
        currentStats = savedData.stats || INITIAL_STATS;
        setPassages(savedData.passages || []);
        setCurrentTodayIdx(savedData.currentTodayIdx || 0);
        if (savedData.grade) {
          userToSet.grade = savedData.grade;
          setSelectedGrade(savedData.grade);
        }
      } catch (e) {}
    }

    setVocabList(currentVocab);
    setStats(currentStats);
    setUser(userToSet);
    localStorage.setItem('kid-english-active-user', JSON.stringify(userToSet));

    if (currentVocab.length === 0) {
      setLoading(true);
      setLoadingMsg('Mẹ chiên giòn chuẩn bị 20 từ vựng khởi đầu để con chơi ngay nhé...');
      try {
        const initialSet = await generateInitialBatch(grade);
        setVocabList(initialSet);
        setStats(s => ({ ...s, totalLearned: initialSet.length }));
      } catch (err) {
        console.error("Lỗi nạp từ:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!currentStats.currentTrack) {
      setViewMode('track-select');
    } else {
      setViewMode('dashboard');
    }
  };

  const saveUserData = () => {
    if (!user) return;
    const userKey = `kid-db-${user.name.toLowerCase().trim()}`;
    const dataToSave = { vocabList, stats, passages, currentTodayIdx, grade: selectedGrade, lastUpdated: new Date().toISOString() };
    localStorage.setItem(userKey, JSON.stringify(dataToSave));
    localStorage.setItem('kid-english-active-user', JSON.stringify(user));
  };

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(saveUserData, 1000);
    return () => clearTimeout(timer);
  }, [vocabList, stats, passages, currentTodayIdx, selectedGrade, user]);

  const handleImportData = (data: any) => {
    setVocabList(data.vocabList || []);
    setStats(data.stats || INITIAL_STATS);
    setPassages(data.passages || []);
    setCurrentTodayIdx(data.currentTodayIdx || 0);
    if (data.grade && user) {
      setSelectedGrade(data.grade);
      setUser({ ...user, grade: data.grade, preferences: data.userPreferences || user.preferences });
    }
    if (user) {
      const userKey = `kid-db-${user.name.toLowerCase().trim()}`;
      localStorage.setItem(userKey, JSON.stringify(data));
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
        
        let newStreak = prev.streak;
        if (prev.lastStudyDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (prev.lastStudyDate === yesterday.toLocaleDateString()) {
            newStreak += 1;
          } else if (!prev.lastStudyDate) {
            newStreak = 1;
          } else {
            newStreak = 1;
          }
        }

        return { 
          ...prev, 
          totalSeconds: prev.totalSeconds + 1, 
          history: updatedHistory,
          streak: newStreak,
          lastStudyDate: today
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [user, isTimerPaused, viewMode]);

  const masteredWords = useMemo(() => vocabList.filter(v => v.isMastered), [vocabList]);

  const todayWords = useMemo(() => {
    const startOfToday = new Date().setHours(0,0,0,0);
    return vocabList.filter(item => item.learnedAt >= startOfToday && !item.isMastered);
  }, [vocabList]);

  const dailyGoal = user?.preferences?.dailyGoal || 10;
  const dailyProgress = Math.min(100, (todayWords.length / dailyGoal) * 100);

  const handleStartDaily = async () => {
    if (!isOnline) { alert("Cần internet để Mẹ soạn bài!"); return; }
    setLoading(true);
    setLoadingMsg('Mẹ đang chọn từ vựng mới toanh cho con đây...');
    try {
      const topic = selectedTopic === 'Random' ? TOPICS[Math.floor(Math.random() * TOPICS.length)] : selectedTopic;
      const excluded = vocabList.map(v => v.word);
      const newItems = await generateDailySet(topic, dailyGoal, selectedGrade, stats.streak, stats.totalLearned, excluded);
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

  const handleNextWord = () => {
    if (currentTodayIdx < todayWords.length - 1) {
      setCurrentTodayIdx(currentTodayIdx + 1);
      setStudyStep('card');
    } else {
      handleFinishDay();
    }
  };

  const handleFinishDay = async () => {
    setLoading(true);
    setLoadingMsg('Mẹ đang gói quà cho con...');
    setIsFullscreen(false);
    try {
      const words = todayWords.map(w => w.word);
      const feedback = await getDailyPerformanceReview(words, stats);
      setDailyFeedback(feedback);
      
      const unlockedIds = stats.unlockedGifts.map(g => g.id);
      const availableGifts = GIFTS.filter(g => !unlockedIds.includes(g.id));
      if (availableGifts.length > 0) {
        const gift = { ...availableGifts[Math.floor(Math.random() * availableGifts.length)], unlockedAt: Date.now() };
        setNewGift(gift);
        setStats(prev => ({ ...prev, unlockedGifts: [...prev.unlockedGifts, gift] }));
      }
      setViewMode('summary');
    } catch (err) {
      setDailyFeedback("Giỏi hơn Cún gián rồi! Con đã hoàn thành bài hôm nay.");
      setViewMode('summary');
    } finally {
      setLoading(false);
    }
  };

  const selectTrack = (track: LearningTrack) => {
    setStats(prev => ({ ...prev, currentTrack: track }));
    const goalMap = { '1_MONTH': 10, '3_MONTHS': 15, '6_MONTHS': 20 };
    if (user) {
      setUser({ ...user, preferences: { ...(user.preferences || { dailyGoal: 10, reminders: false, soundEnabled: true }), dailyGoal: goalMap[track] } });
    }
    setViewMode('dashboard');
  };

  const toggleMastered = (id: string) => {
    setVocabList(prev => prev.map(item => item.id === id ? { ...item, isMastered: !item.isMastered } : item));
  };

  if (!user) return <LoginView onLogin={handleLogin} />;

  return (
    <div className={`min-h-screen bg-rose-50 flex flex-col transition-all ${isFullscreen ? 'p-0' : 'pb-20'}`}>
      
      {loading && (
        <div className="fixed inset-0 z-[200] bg-rose-600/95 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 animate-bounce shadow-2xl text-5xl">🍳</div>
          <h2 className="text-2xl font-black mb-4">{loadingMsg}</h2>
          <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 animate-[loading_2s_infinite]"></div>
          </div>
        </div>
      )}

      {newGift && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 text-center" onClick={() => setNewGift(null)}>
           <div className="bg-white rounded-[4rem] p-12 max-w-sm w-full animate-scaleIn border-8 border-yellow-400 shadow-2xl">
              <div className="text-9xl mb-6 animate-bounce">{newGift.icon}</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Quà của Mẹ!</h2>
              <p className="text-lg font-bold text-rose-500 mb-8">Con đã nhận được: <br/> "{newGift.name}"</p>
              <button className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black text-xl shadow-lg">Cảm ơn mẹ yêu! 💖</button>
           </div>
        </div>
      )}

      {viewMode === 'track-select' ? (
        <div className="min-h-screen bg-rose-500 flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full text-center space-y-8 shadow-2xl">
            <h2 className="text-3xl font-black text-slate-900">Chọn lộ trình của bé</h2>
            <div className="space-y-4">
              <button onClick={() => selectTrack('1_MONTH')} className="w-full p-6 bg-rose-50 border-4 border-rose-100 rounded-3xl text-left flex items-center gap-5 hover:border-rose-500 transition-all">
                <span className="text-4xl">🏅</span>
                <div>
                  <h4 className="font-black text-slate-800">Chiến binh 1 Tháng</h4>
                  <p className="text-xs text-slate-400 font-bold">10 từ/ngày - Khởi đầu mạnh mẽ</p>
                </div>
              </button>
              <button onClick={() => selectTrack('3_MONTHS')} className="w-full p-6 bg-indigo-50 border-4 border-indigo-100 rounded-3xl text-left flex items-center gap-5 hover:border-indigo-500 transition-all">
                <span className="text-4xl">⚔️</span>
                <div>
                  <h4 className="font-black text-slate-800">Dũng sĩ 3 Tháng</h4>
                  <p className="text-xs text-slate-400 font-bold">15 từ/ngày - Chinh phục thử thách</p>
                </div>
              </button>
              <button onClick={() => selectTrack('6_MONTHS')} className="w-full p-6 bg-amber-50 border-4 border-amber-100 rounded-3xl text-left flex items-center gap-5 hover:border-amber-500 transition-all">
                <span className="text-4xl">👑</span>
                <div>
                  <h4 className="font-black text-slate-800">Thần đồng 6 Tháng</h4>
                  <p className="text-xs text-slate-400 font-bold">20 từ/ngày - Trở thành siêu nhân</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {!isFullscreen && (
            <>
              <div className="bg-rose-600 text-white sticky top-0 z-[70] shadow-md">
                <div className="px-6 py-2.5 flex items-center justify-between max-w-4xl mx-auto w-full">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-[10px] font-black uppercase text-rose-200">Bài hôm nay:</span>
                    <div className="flex-1 h-3 bg-rose-900/30 rounded-full overflow-hidden border border-white/10">
                      <div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${dailyProgress}%` }}></div>
                    </div>
                    <span className="text-[10px] font-black">{todayWords.length}/{dailyGoal} từ</span>
                  </div>
                  <div className="ml-6 flex items-center gap-4">
                     <div className="text-yellow-200 font-mono font-bold text-xs"><i className="fas fa-fire mr-1"></i>{stats.streak}</div>
                     <button onClick={() => setViewMode('profile')} className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white/30 hover:scale-110 transition-transform"><img src={user.avatar} className="w-full h-full object-cover" /></button>
                  </div>
                </div>
              </div>

              <header className="bg-white border-b border-rose-100 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewMode('dashboard')}>
                  <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg"><i className="fas fa-heart text-xl"></i></div>
                  <div><h1 className="text-xl font-black text-rose-600">Mẹ chiên giòn</h1><span className="text-[10px] font-black uppercase text-slate-400">Lộ trình {stats.currentTrack}</span></div>
                </div>
                <div className="flex items-center gap-3">
                   <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value as Topic | 'Random')} className="bg-rose-50 p-2.5 rounded-xl text-xs font-black border-2 border-rose-100 text-rose-600 outline-none"><option value="Random">🎲 Ngẫu nhiên</option>{TOPICS.map(t => <option key={t} value={t}>{t}</option>)}</select>
                   <button onClick={handleStartDaily} className="px-6 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-black shadow-lg hover:scale-105 transition-all">Soạn bài mới</button>
                </div>
              </header>
            </>
          )}

          <main className={`flex-grow w-full transition-all ${isFullscreen ? 'fixed inset-0 z-[100] bg-rose-50 overflow-y-auto p-4' : 'max-w-[800px] mx-auto px-6 py-8'}`}>
            
            {viewMode === 'dashboard' ? (
              <div className="animate-fadeIn space-y-10">
                <div className="bg-white rounded-[3rem] p-10 border-4 border-rose-100 shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                  <div className="w-32 h-32 bg-rose-100 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-inner border-4 border-white relative z-10">👩‍🏫</div>
                  <div className="text-center md:text-left space-y-4 flex-1 relative z-10">
                    <h2 className="text-3xl font-black text-slate-900">Chào con yêu {user.name}!</h2>
                    <p className="text-slate-500 font-bold italic">Bé đã học được {formatTime(stats.totalSeconds)} rồi đó. Rất giỏi!</p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <button onClick={() => setViewMode('today')} className="px-10 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-xl flex items-center gap-3 hover:scale-105 transition-all"><i className="fas fa-play"></i> Học bài mới</button>
                      <button onClick={() => setViewMode('mastered')} className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-xl flex items-center gap-3 hover:scale-105 transition-all"><i className="fas fa-check-double"></i> Kho từ của con ({masteredWords.length})</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div onClick={() => setViewMode('game-hub')} className="bg-indigo-500 p-8 rounded-[2.5rem] text-white cursor-pointer hover:scale-[1.02] transition-all shadow-xl group">
                        <div className="text-4xl mb-4 group-hover:rotate-12 transition-transform">🎮</div>
                        <h3 className="text-xl font-black mb-1">Thế giới Trò chơi</h3>
                        <p className="text-white/70 text-sm font-bold">8 trò chơi cực đỉnh luyện siêu trí nhớ.</p>
                    </div>
                    <div onClick={() => setViewMode('profile')} className="bg-amber-500 p-8 rounded-[2.5rem] text-white cursor-pointer hover:scale-[1.02] transition-all shadow-xl group">
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-all">🎁</div>
                        <h3 className="text-xl font-black mb-1">Túi quà của mẹ</h3>
                        <p className="text-white/70 text-sm font-bold">Con đã sưu tập được {stats.unlockedGifts.length} món quà!</p>
                    </div>
                </div>
              </div>
            ) : viewMode === 'mastered' ? (
              <div className="space-y-8 animate-fadeIn">
                 <div className="flex items-center justify-between">
                    <button onClick={() => setViewMode('dashboard')} className="text-rose-500 font-black flex items-center gap-2 hover:translate-x-[-4px] transition-transform"><i className="fas fa-arrow-left"></i> Về trang chủ</button>
                    <h2 className="text-2xl font-black text-slate-900">Từ vựng con đã làm chủ</h2>
                 </div>
                 {masteredWords.length === 0 ? (
                   <div className="p-20 text-center bg-white rounded-[3rem] border-4 border-dashed border-rose-100 text-slate-400 font-bold">Bé chưa có từ nào trong kho ạ. Gà ơi cố lên! 🐣</div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {masteredWords.map(word => (
                        <div key={word.id} className="bg-white p-6 rounded-[2rem] border-2 border-emerald-100 shadow-sm flex justify-between items-center group hover:border-emerald-500 transition-all">
                           <div>
                              <h4 className="text-xl font-black text-slate-800">{word.word}</h4>
                              <p className="text-xs font-bold text-slate-400 italic">{word.vietnameseDefinition}</p>
                           </div>
                           <button onClick={() => toggleMastered(word.id)} className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><i className="fas fa-undo"></i></button>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
            ) : viewMode === 'summary' ? (
              <div className="animate-scaleIn max-w-xl mx-auto space-y-8 my-auto py-10">
                 <div className="bg-white rounded-[4rem] p-12 border-8 border-rose-100 shadow-2xl text-center space-y-6">
                    <div className="text-8xl mb-4">🥳</div>
                    <h2 className="text-3xl font-black text-slate-900">Mẹ dặn con nè</h2>
                    <div className="p-8 bg-rose-50 rounded-[2rem] border-2 border-rose-100 text-slate-700 font-bold leading-relaxed italic whitespace-pre-wrap">"{dailyFeedback}"</div>
                    <button onClick={() => setViewMode('dashboard')} className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all">Dạ, con nhớ rồi mẹ! ❤️</button>
                 </div>
              </div>
            ) : viewMode === 'today' && todayWords.length > 0 ? (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-center bg-white p-4 rounded-3xl border-2 border-rose-100 shadow-sm">
                  <button onClick={() => { if(currentTodayIdx>0) { setCurrentTodayIdx(currentTodayIdx-1); setStudyStep('card'); }}} disabled={currentTodayIdx===0} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 disabled:opacity-30"><i className="fas fa-chevron-left"></i></button>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Từ {currentTodayIdx + 1} / {todayWords.length}</span>
                  </div>
                  <button onClick={() => setStudyStep(studyStep === 'card' ? 'writing' : 'card')} className="px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase">Đổi bước học</button>
                </div>

                {studyStep === 'card' ? (
                  <div className="space-y-8">
                    <VocabularyCard item={todayWords[currentTodayIdx]} onToggleMastered={toggleMastered} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button onClick={() => setStudyStep('writing')} className="py-6 bg-purple-500 text-white rounded-[2rem] font-black shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-lg">Viết câu thử sức <i className="fas fa-pen-nib"></i></button>
                      <button onClick={handleNextWord} className="py-6 bg-rose-500 text-white rounded-[2rem] font-black shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-lg">Sang từ tiếp theo <i className="fas fa-arrow-right"></i></button>
                    </div>
                  </div>
                ) : (
                  <SentencePractice word={todayWords[currentTodayIdx].word} onSuccess={handleNextWord} />
                )}
                {passages.length > 0 && <ReadingSection passages={passages} />}
              </div>
            ) : viewMode === 'game-hub' ? (
               <div className="space-y-8">
                  <div className="text-center"><h2 className="text-3xl font-black text-slate-900">Thế giới 8 Trò chơi</h2><p className="text-slate-500 font-bold">Mẹ soạn đủ mọi trò cho con ôn tập nè!</p></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div onClick={() => setViewMode('game-match')} className="bg-white p-6 rounded-[2rem] border-4 border-amber-100 hover:border-amber-400 cursor-pointer transition-all shadow-lg text-center"><div className="text-4xl mb-3">🧩</div><h4 className="font-black text-xs uppercase">Ghép đôi</h4></div>
                    <div onClick={() => setViewMode('game-spelling')} className="bg-white p-6 rounded-[2rem] border-4 border-indigo-100 hover:border-indigo-400 cursor-pointer transition-all shadow-lg text-center"><div className="text-4xl mb-3">🐝</div><h4 className="font-black text-xs uppercase">Spelling Bee</h4></div>
                    <div onClick={() => setViewMode('game-unscramble')} className="bg-white p-6 rounded-[2rem] border-4 border-rose-100 hover:border-rose-400 cursor-pointer transition-all shadow-lg text-center"><div className="text-4xl mb-3">🔠</div><h4 className="font-black text-xs uppercase">Xếp chữ</h4></div>
                    <div onClick={() => setViewMode('game-quiz')} className="bg-white p-6 rounded-[2rem] border-4 border-emerald-100 hover:border-emerald-400 cursor-pointer transition-all shadow-lg text-center"><div className="text-4xl mb-3">🎯</div><h4 className="font-black text-xs uppercase">Trắc nghiệm</h4></div>
                    <div onClick={() => setViewMode('game-true-false')} className="bg-white p-6 rounded-[2rem] border-4 border-orange-100 hover:border-orange-400 cursor-pointer transition-all shadow-lg text-center"><div className="text-4xl mb-3">⚖️</div><h4 className="font-black text-xs uppercase">Đúng hay Sai</h4></div>
                    <div onClick={() => setViewMode('game-sentence-builder')} className="bg-white p-6 rounded-[2rem] border-4 border-purple-100 hover:border-purple-400 cursor-pointer transition-all shadow-lg text-center"><div className="text-4xl mb-3">🏗️</div><h4 className="font-black text-xs uppercase">Xây câu</h4></div>
                    <div onClick={() => setViewMode('game-audio-hunt')} className="bg-white p-6 rounded-[2rem] border-4 border-blue-100 hover:border-blue-400 cursor-pointer transition-all shadow-lg text-center"><div className="text-4xl mb-3">🎧</div><h4 className="font-black text-xs uppercase">Thợ săn âm</h4></div>
                    <div onClick={() => setViewMode('game-voice-master')} className="bg-white p-6 rounded-[2rem] border-4 border-teal-100 hover:teal-amber-400 cursor-pointer transition-all shadow-lg text-center"><div className="text-4xl mb-3">🎙️</div><h4 className="font-black text-xs uppercase">Vua phát âm</h4></div>
                  </div>
                  <button onClick={() => setViewMode('dashboard')} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs">Về Trang Chủ</button>
               </div>
            ) : viewMode === 'game-match' ? (
               <WordGame vocabList={vocabList} onExit={() => setViewMode('game-hub')} />
            ) : viewMode === 'game-spelling' ? (
               <SpellingGame words={vocabList} onExit={() => setViewMode('game-hub')} />
            ) : viewMode === 'game-unscramble' ? (
               <UnscrambleGame words={vocabList} onExit={() => setViewMode('game-hub')} />
            ) : viewMode === 'game-quiz' ? (
               <QuizSection words={vocabList} onFinish={() => setViewMode('game-hub')} />
            ) : viewMode === 'profile' ? (
               <ProfileView user={user} stats={stats} vocabList={vocabList} passages={passages} currentTodayIdx={currentTodayIdx} onUpdateUser={setUser} onImportData={handleImportData} onBack={() => setViewMode('dashboard')} />
            ) : (
               <div className="text-center py-24 bg-white/50 rounded-[4rem] border-4 border-dashed border-rose-100">
                  <div className="text-8xl mb-6">🎒</div>
                  <h3 className="text-2xl font-black text-slate-800">Con đã hoàn thành hết bài học hôm nay!</h3>
                  <button onClick={handleStartDaily} className="mt-8 px-10 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all">Mẹ ơi soạn thêm bài nữa!</button>
               </div>
            )}
          </main>
        </>
      )}

      <style>{`
        @keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );
};

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}p`;
  return `${m} phút`;
};

export default App;
