
import React, { useState, useEffect } from 'react';
import { LessonState, VocabularyItem } from '../types';
import VocabularyCard from './VocabularyCard';

interface Props {
  lesson: LessonState;
  previousLesson: LessonState | null;
  onComplete: () => void;
  onToggleMastered: (id: string) => void;
}

type Step = 'review' | 'vocabulary' | 'sentence' | 'game';

const LessonView: React.FC<Props> = ({ lesson, previousLesson, onComplete, onToggleMastered }) => {
  const [currentStep, setCurrentStep] = useState<Step>(previousLesson ? 'review' : 'vocabulary');
  const [vocabIdx, setVocabIdx] = useState(0);
  const [reviewWord, setReviewWord] = useState<VocabularyItem | null>(null);
  const [reviewAnswer, setReviewAnswer] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (previousLesson && previousLesson.vocabulary.length > 0) {
      const randomWord = previousLesson.vocabulary[Math.floor(Math.random() * previousLesson.vocabulary.length)];
      setReviewWord(randomWord);
    }
  }, [previousLesson]);

  // Handle corrupt/empty lesson data gracefully
  if (!lesson || !lesson.vocabulary || lesson.vocabulary.length === 0) {
     return (
        <div className="text-center p-10 space-y-4">
           <div className="text-6xl">🔧</div>
           <h3 className="text-xl font-black text-slate-600">Bài học đang được bảo trì</h3>
           <p>Mẹ đang soạn lại bài này. Con vui lòng quay lại sau nhé!</p>
           <button onClick={() => window.location.reload()} className="px-6 py-2 bg-rose-500 text-white rounded-xl font-black">Tải lại</button>
        </div>
     );
  }

  const handleReview = () => {
    if (!reviewWord || isTransitioning) return;
    setIsTransitioning(true);

    const isCorrect = reviewAnswer.toLowerCase().trim() === reviewWord.word.toLowerCase().trim();
    if (isCorrect) {
      setReviewFeedback("Nở to hơn nở rộ rồi! Con vẫn nhớ bài cũ giỏi quá.");
      setTimeout(() => {
        setCurrentStep('vocabulary');
        setIsTransitioning(false);
      }, 1500);
    } else {
      setReviewFeedback(`Ơ kìa Gà ơi! Từ đó là "${reviewWord.word}" mà. Học lại với mẹ nha!`);
      setTimeout(() => {
         setCurrentStep('vocabulary');
         setIsTransitioning(false);
      }, 2000);
    }
  };

  const nextVocab = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // Small delay to prevent double clicks and allow animation
    setTimeout(() => {
      if (vocabIdx < lesson.vocabulary.length - 1) {
        setVocabIdx(vocabIdx + 1);
      } else {
        setCurrentStep('sentence');
      }
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-2xl mx-auto">
      {/* Lesson Header */}
      <div className="bg-white p-6 rounded-[2rem] border-4 border-rose-100 shadow-lg text-center">
        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Day {lesson.day} • Lesson {lesson.lesson_id}</span>
        <h2 className="text-3xl font-black text-slate-900 mt-1">{lesson.topic}</h2>
      </div>

      {currentStep === 'review' && reviewWord && (
        <div className="bg-amber-50 p-10 rounded-[3rem] border-4 border-amber-200 shadow-xl text-center space-y-6">
          <div className="text-6xl">🤔</div>
          <h3 className="text-2xl font-black text-slate-800">Mẹ kiểm tra bài cũ tí!</h3>
          <p className="text-lg font-bold text-slate-500">Nghĩa của từ này là: <br/> <span className="text-amber-600 text-2xl">"{reviewWord.vietnameseDefinition}"</span></p>
          <input 
            type="text" 
            value={reviewAnswer} 
            onChange={(e) => setReviewAnswer(e.target.value)}
            disabled={!!reviewFeedback}
            placeholder="Viết từ tiếng Anh vào đây..."
            className="w-full p-4 rounded-2xl border-2 border-amber-200 outline-none focus:border-amber-500 font-bold text-center"
          />
          {reviewFeedback && <p className="font-black text-rose-500 animate-bounce">{reviewFeedback}</p>}
          <button 
            onClick={handleReview} 
            disabled={isTransitioning}
            className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black shadow-lg disabled:opacity-50"
          >
            Mẹ xem con đúng chưa!
          </button>
        </div>
      )}

      {currentStep === 'vocabulary' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-4">
             <span className="text-xs font-black text-slate-400 uppercase">Từ vựng {vocabIdx + 1}/{lesson.vocabulary.length}</span>
             <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 transition-all" style={{ width: `${((vocabIdx+1)/lesson.vocabulary.length)*100}%` }}></div>
             </div>
          </div>
          <VocabularyCard item={lesson.vocabulary[vocabIdx]} onToggleMastered={onToggleMastered} />
          <button 
            onClick={nextVocab} 
            disabled={isTransitioning}
            className="w-full py-6 bg-rose-500 text-white rounded-[2rem] font-black text-xl shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:scale-100"
          >
             {vocabIdx < lesson.vocabulary.length - 1 ? 'Sang từ tiếp theo' : 'Học mẫu câu hay'} 
             {isTransitioning ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-arrow-right"></i>}
          </button>
        </div>
      )}

      {currentStep === 'sentence' && (
        <div className="bg-indigo-500 p-10 rounded-[3rem] text-white shadow-2xl text-center space-y-8 animate-scaleIn">
          <div className="text-6xl">🗣️</div>
          <h3 className="text-2xl font-black">Mẫu câu của ngày hôm nay</h3>
          <div className="p-8 bg-white/10 rounded-[2rem] border-2 border-white/20">
            <p className="text-3xl font-black italic">"{lesson.sentence_pattern}"</p>
          </div>
          <p className="font-bold opacity-80 italic">Mẹ dặn con: Hãy dùng mẫu câu này khi nói chuyện với bạn bè nhé!</p>
          <button onClick={() => setCurrentStep('game')} className="w-full py-5 bg-white text-indigo-600 rounded-2xl font-black text-xl shadow-lg hover:bg-slate-50 transition-colors">Con thuộc rồi, đi chơi game thôi!</button>
        </div>
      )}

      {currentStep === 'game' && (
        <div className="bg-white p-10 rounded-[3rem] border-8 border-yellow-400 shadow-2xl text-center space-y-8 animate-fadeIn">
           <div className="text-7xl animate-bounce">🎁</div>
           <h3 className="text-3xl font-black text-slate-900">Thử thách cuối cùng!</h3>
           <p className="text-lg font-bold text-slate-500">Con đã hoàn thành bài học xuất sắc. Nhấn nút dưới để mẹ tổng kết và tặng quà nhé!</p>
           <button onClick={onComplete} className="w-full py-5 bg-yellow-400 text-slate-900 rounded-2xl font-black text-xl shadow-lg hover:bg-yellow-300 transition-colors">Hoàn thành bài học!</button>
        </div>
      )}
    </div>
  );
};

export default LessonView;
