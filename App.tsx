
import React, { useState, useEffect } from 'react';
import { User, StudyStats, LessonState, VocabularyItem } from './types';
import { generateLessonForDay } from './geminiService';
import LoginView from './components/LoginView';
import LessonView from './components/LessonView';
import PlacementTestView from './components/PlacementTestView';
import WordGame from './components/WordGame';
import SpellingGame from './components/SpellingGame';
import UnscrambleGame from './components/UnscrambleGame';
import BalloonPopGame from './components/BalloonPopGame';
import WordSearchGame from './components/WordSearchGame';
import CategorizerGame from './components/CategorizerGame';
import SentenceBuilder from './components/SentenceBuilder';
import ReviewSection from './components/ReviewSection';
import WeeklyQuizView from './components/WeeklyQuizView';
import WelcomeView from './components/WelcomeView';

type AppViewMode = 'welcome' | 'dashboard' | 'lesson' | 'game-hub' | 'setup' | 'summary' | 'review' | 'placement' | 'weekly-quiz' | 'game-1' | 'game-2' | 'game-3' | 'game-4' | 'game-5' | 'game-6';

// Helper to get consistent local date string (YYYY-MM-DD)
const getLocalDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [viewMode, setViewMode] = useState<AppViewMode>('welcome');
  const [loading, setLoading] = useState(false);
  const [dailyTimer, setDailyTimer] = useState(0);

  // Smart Timer Logic: Only runs when not in welcome/login and user exists
  useEffect(() => {
    if (!user || !stats || viewMode === 'welcome' || viewMode === 'placement') return;
    
    const interval = setInterval(() => {
      setDailyTimer(prev => prev + 1);
    }, 1000);

    // Auto-save timer every 30 seconds
    const saveInterval = setInterval(() => {
       if(user && stats) {
         const updatedStats = { ...stats, dailyStudySeconds: dailyTimer };
         // Don't trigger a full re-render of stats here, just save silently to LS
         const userKey = `kid-db-${user.name.toLowerCase().trim()}`;
         localStorage.setItem(userKey, JSON.stringify({ stats: updatedStats, grade: user.grade, proficiencyLevel: user.proficiencyLevel }));
         
         // Update history for current day if exists, for graph accuracy
         updateHistorySilently(updatedStats, dailyTimer);
       }
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(saveInterval);
    };
  }, [user, stats, dailyTimer, viewMode]);

  const updateHistorySilently = (currentStats: StudyStats, seconds: number) => {
    const today = getLocalDateString();
    const historyIndex = currentStats.history.findIndex(h => h.date === today);
    if (historyIndex >= 0) {
        // We generally rely on 'completeLesson' to finalize history, 
        // but for the chart to update "live" or save partial progress, we could update the last history entry
        // However, to keep it simple and safe, we rely on dailyStudySeconds property
    }
  };

  // 1. Handle "Continue Learning"
  const handleContinue = () => {
    const savedUser = localStorage.getItem('kid-english-active-user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
        const userKey = `kid-db-${u.name.toLowerCase().trim()}`;
        const db = localStorage.getItem(userKey);
        if (db) {
          const parsedDB = JSON.parse(db);
          setStats(parsedDB.stats);
          
          // Reset daily timer if new day
          const today = getLocalDateString();
          if (parsedDB.stats.lastStudyDate !== today) {
            setDailyTimer(0);
          } else {
            setDailyTimer(parsedDB.stats.dailyStudySeconds || 0);
          }
          setViewMode('dashboard');
        } else {
          setViewMode('placement'); 
        }
      } catch (e) {
        console.error("Error loading saved user", e);
        localStorage.removeItem('kid-english-active-user');
        setViewMode('dashboard'); // Will trigger LoginView inside render
      }
    } else {
      // No active user, go to login (which is handled when user is null)
      setViewMode('dashboard');
    }
  };

  // 2. Handle "Upload Project"
  const handleImportProject = (data: any) => {
    try {
      const { user: importedUser, stats: importedStats } = data;
      
      // Update State
      setUser(importedUser);
      setStats(importedStats);
      
      // Update Timer
      const today = getLocalDateString();
      if (importedStats.lastStudyDate === today) {
        setDailyTimer(importedStats.dailyStudySeconds || 0);
      } else {
        setDailyTimer(0);
      }

      // Save to LocalStorage
      localStorage.setItem('kid-english-active-user', JSON.stringify(importedUser));
      const userKey = `kid-db-${importedUser.name.toLowerCase().trim()}`;
      localStorage.setItem(userKey, JSON.stringify({ stats: importedStats, grade: importedUser.grade, proficiencyLevel: importedUser.proficiencyLevel }));

      alert(`Đã nạp thành công hành trang của ${importedUser.name}!`);
      setViewMode('dashboard');
    } catch (e) {
      console.error(e);
      alert("File dự án bị lỗi cấu trúc. Vui lòng kiểm tra lại.");
    }
  };

  const handleLogin = (userData: any, grade: number) => {
    const effectiveGrade = grade || 5;
    const newUser = { ...userData, grade: effectiveGrade, proficiencyLevel: 'Unknown' };
    setUser(newUser);
    localStorage.setItem('kid-english-active-user', JSON.stringify(newUser));
    
    const userKey = `kid-db-${newUser.name.toLowerCase().trim()}`;
    const db = localStorage.getItem(userKey);
    
    if (db) {
      try {
        const loadedStats = JSON.parse(db).stats;
        setStats(loadedStats);
        setViewMode('dashboard');
      } catch (e) {
        setViewMode('placement');
      }
    } else {
      setViewMode('placement');
    }
  };

  const handlePlacementFinish = async (level: string) => {
    if (!user) return;
    const updatedUser = { ...user, proficiencyLevel: level };
    setUser(updatedUser);
    localStorage.setItem('kid-english-active-user', JSON.stringify(updatedUser));
    await initializeLearningPath(level, updatedUser);
  };

  const handlePlacementSkip = async () => {
    if (!user) return;
    const level = 'Tiêu chuẩn (Lớp 5)';
    const updatedUser = { ...user, proficiencyLevel: level };
    setUser(updatedUser);
    localStorage.setItem('kid-english-active-user', JSON.stringify(updatedUser));
    await initializeLearningPath(level, updatedUser);
  };

  const initializeLearningPath = async (level: string, currentUser: User) => {
     const newStats: StudyStats = {
      totalLearned: 0,
      streak: 0,
      lastStudyDate: '',
      dailyStudySeconds: 0,
      weeklyScores: [],
      unlockedGifts: [],
      currentTrack: `SGK Lớp 5 - ${level}`,
      history: []
    };
    setStats(newStats); 
    
    setLoading(true);
    try {
      // Pass null history for first lesson
      const lesson = await generateLessonForDay(1, currentUser.grade || 5, level, "");
      const finalStats = { ...newStats, learningState: lesson };
      setStats(finalStats);
      saveData(finalStats, currentUser);
      setViewMode('dashboard');
    } catch (e) {
      console.error(e);
      alert("Mẹ đang bận quá, chưa soạn bài kịp. Con thử lại chút nữa nhé!");
    } finally {
      setLoading(false);
    }
  };

  const saveData = (newStats: StudyStats, currentUser = user) => {
    if (!currentUser) return;
    // Update dailyStudySeconds before saving
    const statsToSave = { ...newStats, dailyStudySeconds: dailyTimer };
    const userKey = `kid-db-${currentUser.name.toLowerCase().trim()}`;
    localStorage.setItem(userKey, JSON.stringify({ stats: statsToSave, grade: currentUser.grade, proficiencyLevel: currentUser.proficiencyLevel }));
  };

  const startLesson = async () => {
    if (!stats) return;
    if (loading) return; 

    const today = getLocalDateString();

    // Case 1: Completed today -> Suggest review
    if (stats.learningState?.completed && stats.learningState.completedAt === today) {
      alert("Mẹ dặn nè: Hôm nay con học xong rồi! Để dành mai học tiếp bài mới cho ngấm nhé. Giờ con vào Xưởng trò chơi ôn tập nha! ❤️");
      return;
    }

    // Case 2: Check for Weekly Quiz (Day 7, 14, 21...)
    const currentDay = stats.learningState?.day || 1;
    if (currentDay > 1 && currentDay % 7 === 0 && !stats.learningState?.completed) {
      setViewMode('weekly-quiz');
      return;
    }

    // Case 3: Completed previously -> Generate NEXT lesson
    if (stats.learningState?.completed) {
      const nextDay = stats.learningState.day + 1;
      
      if (nextDay % 7 === 0) {
         setViewMode('weekly-quiz');
         return;
      }

      setLoading(true);
      try {
        const historyContext = stats.history
          .slice(-3) 
          .map(h => h.topic)
          .join(", ");

        const lesson = await generateLessonForDay(
          nextDay, 
          user?.grade || 5, 
          user?.proficiencyLevel,
          historyContext
        );
        
        const updatedStats = { ...stats, learningState: lesson };
        setStats(updatedStats);
        saveData(updatedStats);
        setViewMode('lesson');
      } catch (err) {
        alert("Có lỗi khi tạo bài học mới. Con kiểm tra mạng rồi thử lại nhé!");
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setViewMode('lesson');
    }
  };

  const completeLesson = () => {
    if (!stats || !stats.learningState) return;
    const today = getLocalDateString();
    
    const updatedLesson = { ...stats.learningState, completed: true, completedAt: today };
    const historyExists = stats.history.some(h => h.day === updatedLesson.day);
    
    let newHistory = [...stats.history];
    if (!historyExists) {
      newHistory.push({ 
        day: updatedLesson.day, 
        topic: updatedLesson.topic, 
        words: updatedLesson.vocabulary.map(v => v.word),
        date: today,
        // Save the accumulated daily timer as the "seconds" for this record roughly
        seconds: dailyTimer 
      });
    } else {
        // Update existing history entry with current timer
        newHistory = newHistory.map(h => h.day === updatedLesson.day ? { ...h, seconds: dailyTimer } : h);
    }

    const updatedStats: StudyStats = {
      ...stats,
      totalLearned: stats.totalLearned + (historyExists ? 0 : updatedLesson.vocabulary.length),
      streak: stats.lastStudyDate === today ? stats.streak : stats.streak + 1,
      lastStudyDate: today,
      learningState: updatedLesson,
      history: newHistory
    };
    
    setStats(updatedStats);
    saveData(updatedStats);
    setViewMode('summary');
  };

  const handleWeeklyQuizFinish = (score: number) => {
    if (!stats || !stats.learningState) return;
    const today = getLocalDateString();
    
    const weekNum = Math.floor(stats.learningState.day / 7);
    const newWeeklyScores = [...(stats.weeklyScores || []), { week: weekNum, score, date: today }];

    const updatedLesson = { ...stats.learningState, completed: true, completedAt: today };
    
    const updatedStats: StudyStats = {
      ...stats,
      weeklyScores: newWeeklyScores,
      learningState: updatedLesson,
      lastStudyDate: today
    };
    
    setStats(updatedStats);
    saveData(updatedStats);
    setViewMode('dashboard');
  };

  const handleDownloadProject = () => {
    if (!user || !stats) return;
    const dataToExport = {
      user: user,
      stats: { ...stats, dailyStudySeconds: dailyTimer },
      exportDate: new Date().toISOString(),
      appVersion: "1.3.0"
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DuAn_TiengAnh_${user.name}_Day${stats.learningState?.day || 0}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getAllLearnedWords = () => {
    if (!stats) return [];
    return stats.learningState?.vocabulary || [];
  };
  
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Helper to generate chart bars for the last 7 days
  const renderStudyChart = () => {
      if (!stats) return null;
      const today = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() - (6 - i));
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          
          // Find history entry for this date OR use current dailyTimer if it's today
          let seconds = 0;
          if (dateStr === getLocalDateString()) {
             seconds = dailyTimer;
          } else {
             const entry = stats.history.find(h => h.date === dateStr);
             seconds = entry ? (entry.seconds || 0) : 0;
          }
          return { label: `${d.getDate()}/${d.getMonth()+1}`, seconds };
      });
      
      const maxSec = Math.max(...last7Days.map(d => d.seconds), 60); // min scale 1 min

      return (
          <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm mt-6">
              <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <i className="fas fa-chart-bar text-rose-500"></i> Thời gian học tuần qua
              </h4>
              <div className="flex items-end justify-between gap-2 h-32">
                  {last7Days.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                           <div className="w-full bg-slate-100 rounded-t-lg relative overflow-hidden group-hover:bg-slate-200 transition-colors" style={{ height: '100%' }}>
                               <div 
                                  className="absolute bottom-0 left-0 right-0 bg-rose-400 rounded-t-lg transition-all duration-1000"
                                  style={{ height: `${(d.seconds / maxSec) * 100}%` }}
                               ></div>
                           </div>
                           <span className="text-[9px] font-bold text-slate-400">{d.label}</span>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  // View Mode: Welcome
  if (viewMode === 'welcome') {
    return <WelcomeView onContinue={handleContinue} onImport={handleImportProject} />;
  }

  // View Mode: Login (If no user after continue)
  if (!user && viewMode !== 'welcome') return <LoginView onLogin={handleLogin} />;

  if (viewMode === 'placement') {
    return <PlacementTestView onFinish={handlePlacementFinish} onSkip={handlePlacementSkip} />;
  }
  
  if (viewMode === 'setup') {
    return <div className="p-10 text-center">Loading Setup...</div>;
  }

  return (
    <div className="min-h-screen bg-rose-50 pb-20 font-inter">
      {loading && <div className="fixed inset-0 z-[100] bg-rose-500/90 flex flex-col items-center justify-center text-white font-black"><div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>Mẹ đang soạn giáo án...</div>}
      
      {/* Header with Timer */}
      <header className="bg-white px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => !loading && setViewMode('dashboard')}>
          <div className="bg-rose-500 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"><i className="fas fa-heart"></i></div>
          <div>
            <h1 className="text-sm font-black text-rose-600">Mẹ chiên giòn</h1>
            <p className="text-[10px] font-black uppercase text-slate-400">
               Day {stats?.learningState?.day || 1}
            </p>
          </div>
        </div>
        
        {/* Smart Timer Display */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
          <i className="fas fa-clock text-rose-500 animate-pulse"></i>
          <span className="text-xs font-black text-slate-600">Hôm nay: {formatTimer(dailyTimer)}</span>
        </div>

        <div className="w-10 h-10 rounded-full border-2 border-rose-100 overflow-hidden"><img src={user?.avatar} alt="avatar" /></div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {viewMode === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Weekly Quiz Banner Check */}
            {(stats?.learningState?.day || 1) % 7 === 0 && !stats?.learningState?.completed && (
               <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-[3rem] text-white text-center shadow-xl animate-bounce">
                  <h2 className="text-3xl font-black mb-2">Đến hẹn lại lên!</h2>
                  <p className="mb-6">Hôm nay là ngày kiểm tra định kỳ Tuần {Math.floor((stats?.learningState?.day || 7)/7)}. Cố lên con nhé!</p>
                  <button onClick={() => setViewMode('weekly-quiz')} className="px-8 py-3 bg-white text-indigo-600 rounded-2xl font-black shadow-lg">Làm bài kiểm tra ngay</button>
               </div>
            )}

            <div className="bg-white p-10 rounded-[3rem] border-4 border-rose-100 shadow-xl flex flex-col md:flex-row items-center gap-8">
              <div className="text-8xl">👩‍🏫</div>
              <div className="flex-1 text-center md:text-left space-y-4">
                <h2 className="text-3xl font-black">Bài {stats?.learningState?.day}: {stats?.learningState?.topic}</h2>
                <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest">
                  {user?.proficiencyLevel ? `Chương trình: ${user.proficiencyLevel}` : 'Chương trình SGK Lớp 5'}
                </p>
                
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-100"><div className="h-full bg-rose-500 transition-all" style={{ width: `${((stats?.learningState?.day || 1) / 90) * 100}%` }}></div></div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={startLesson} disabled={loading} className="flex-1 px-8 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all disabled:opacity-50">
                    {stats?.learningState?.completed ? 'Học bài tiếp theo' : 'Bắt đầu học ngay'}
                  </button>
                  <button onClick={() => setViewMode('game-hub')} className="px-8 py-4 bg-indigo-100 text-indigo-600 rounded-2xl font-black hover:bg-indigo-200 transition-all">
                    Chơi Game ôn tập
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-indigo-500 p-8 rounded-[2.5rem] text-white flex items-center justify-between cursor-pointer shadow-xl hover:scale-95 transition-all" onClick={() => setViewMode('game-hub')}>
                  <div><h3 className="text-2xl font-black">Xưởng Game</h3><p className="font-bold opacity-80">Ôn tập cực vui!</p></div>
                  <div className="text-6xl">🎮</div>
                </div>
                
                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-col justify-center cursor-pointer hover:border-emerald-200 transition-all" onClick={handleDownloadProject}>
                   <div className="flex items-center gap-4 text-emerald-600 mb-2">
                      <i className="fas fa-save text-3xl"></i>
                      <h3 className="text-xl font-black text-slate-800">Lưu dự án</h3>
                   </div>
                   <p className="text-xs text-slate-400 font-bold">Tải file về để lưu tiến độ an toàn nhé.</p>
                </div>
            </div>

            {/* Study Stats Chart */}
            {renderStudyChart()}
            
            {/* Quick stats for daily timer on mobile */}
            <div className="md:hidden text-center text-slate-400 text-xs font-bold pt-4">
               Đã học hôm nay: {formatTimer(dailyTimer)}
            </div>
          </div>
        )}

        {viewMode === 'lesson' && stats?.learningState && (
          <LessonView 
            key={stats.learningState.day} 
            lesson={stats.learningState} 
            previousLesson={null} 
            onComplete={completeLesson} 
            onToggleMastered={() => {}} 
          />
        )}

        {viewMode === 'weekly-quiz' && user && (
          <WeeklyQuizView 
            weekNumber={Math.floor((stats?.learningState?.day || 7) / 7)}
            grade={user.grade}
            historyTopics={stats?.history.slice(-7).map(h => h.topic) || []}
            onFinish={handleWeeklyQuizFinish}
            onExit={() => setViewMode('dashboard')}
          />
        )}

        {viewMode === 'review' && (
          <ReviewSection 
            words={getAllLearnedWords()} 
            title="Ôn tập từ vựng" 
            onReviewComplete={() => {}} 
            onPause={() => {}} 
            onExit={() => setViewMode('dashboard')} 
          />
        )}

        {viewMode === 'game-hub' && (
          <div className="space-y-8 animate-fadeIn">
             <div className="text-center"><h2 className="text-3xl font-black text-slate-900">Khu vui chơi</h2><p className="text-slate-500 font-bold italic">Cùng Mẹ ôn lại các từ đã học nhé!</p></div>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { id: 'game-1', icon: '🎈', name: 'Bắn Bong Bóng' },
                  { id: 'game-2', icon: '🔍', name: 'Thợ Săn Chữ' },
                  { id: 'game-3', icon: '🧺', name: 'Phân Loại Từ' },
                  { id: 'game-4', icon: '🧩', name: 'Ghép Đôi' },
                  { id: 'game-5', icon: '🐝', name: 'Spelling Bee' },
                  { id: 'game-6', icon: '🏗️', name: 'Xây Câu' }
                ].map(g => (
                  <div key={g.id} onClick={() => setViewMode(g.id as any)} className="bg-white p-8 rounded-[2rem] border-4 border-rose-50 hover:border-rose-400 cursor-pointer shadow-sm text-center transition-all hover:scale-105">
                    <div className="text-5xl mb-4">{g.icon}</div>
                    <h4 className="font-black text-slate-800 text-sm uppercase">{g.name}</h4>
                  </div>
                ))}
             </div>
             <button onClick={() => setViewMode('dashboard')} className="w-full py-4 text-slate-400 font-black uppercase text-xs">Quay lại trang chủ</button>
          </div>
        )}

        {viewMode === 'game-1' && <BalloonPopGame words={stats?.learningState?.vocabulary || []} onExit={() => setViewMode('game-hub')} />}
        {viewMode === 'game-2' && <WordSearchGame words={stats?.learningState?.vocabulary || []} onExit={() => setViewMode('game-hub')} />}
        {viewMode === 'game-3' && <CategorizerGame words={stats?.learningState?.vocabulary || []} onExit={() => setViewMode('game-hub')} />}
        {viewMode === 'game-4' && <WordGame vocabList={stats?.learningState?.vocabulary || []} onExit={() => setViewMode('game-hub')} />}
        {viewMode === 'game-5' && <SpellingGame words={stats?.learningState?.vocabulary || []} onExit={() => setViewMode('game-hub')} />}
        {viewMode === 'game-6' && <SentenceBuilder words={stats?.learningState?.vocabulary || []} onExit={() => setViewMode('game-hub')} />}

        {viewMode === 'summary' && (
          <div className="text-center space-y-8 py-10 animate-scaleIn">
            <div className="text-9xl">🥳</div>
            <h2 className="text-4xl font-black text-rose-500">Giỏi hơn Cún gián rồi!</h2>
            <p className="text-xl font-bold text-slate-600 px-6">Con đã hoàn thành bài học xuất sắc.</p>
            <div className="inline-block px-6 py-2 bg-slate-100 rounded-full text-slate-500 font-black">
               Thời gian học: {formatTimer(dailyTimer)}
            </div>
            
            <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
               <button onClick={handleDownloadProject} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all">
                  <i className="fas fa-save"></i> Tải dự án về máy
               </button>
               <button onClick={() => setViewMode('dashboard')} className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-xl hover:bg-rose-600 transition-all">
                  Về trang chủ
               </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
