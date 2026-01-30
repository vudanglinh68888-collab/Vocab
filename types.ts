
export interface RootAnalysis {
  root: string;
  prefix: string;
  suffix: string;
  explanation: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  ipa: string;
  definition: string;
  vietnameseDefinition: string;
  example: string;
  grade: number; 
  topic: string;
  rootAnalysis: RootAnalysis;
  synonyms: string[];
  antonyms: string[];
  mnemonicHint: string;
  learnedAt: number; 
  reviewCount: number;
  isMastered?: boolean;
  interval: number;
  easiness: number;
  nextReview: number;
}

export interface LessonState {
  day: number;
  lesson_id: number;
  topic: string;
  vocabulary: VocabularyItem[];
  sentence_pattern: string;
  completed: boolean;
  completedAt?: string; // Lưu ngày hoàn thành (YYYY-MM-DD)
}

export interface VirtualGift {
  id: string;
  name: string;
  icon: string;
}

export interface StudyStats {
  totalLearned: number;
  streak: number;
  lastStudyDate: string;
  dailyStudySeconds: number; // Thời gian học hôm nay (giây)
  weeklyScores: { week: number, score: number, date: string }[]; // Lịch sử điểm kiểm tra tuần
  unlockedGifts: VirtualGift[];
  learningState?: LessonState;
  history: { day: number; topic: string; words: string[]; date?: string; seconds?: number }[];
  currentTrack?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  grade: number; // Vẫn giữ grade cho logic cũ
  proficiencyLevel?: string; // B1, B2, C1, IELTS 5.0, etc.
  email?: string;
  status?: string;
  preferences?: {
    dailyGoal: number;
    reminders: boolean;
    soundEnabled: boolean;
  };
}

export interface ReadingPassage {
  title: string;
  contentEn: string;
  contentVi: string;
}

export enum ViewMode {
  CHATS = 'CHATS',
  SETTINGS = 'SETTINGS'
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastSeen?: string;
  isAI?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isMe: boolean;
}

export interface PlacementQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string; // The correct option text
  difficulty: 'Easy' | 'Medium' | 'Hard';
}
