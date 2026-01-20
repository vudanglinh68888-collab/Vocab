
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

export interface ReadingPassage {
  title: string;
  contentEn: string;
  contentVi: string;
}

export interface StudyStats {
  totalLearned: number;
  currentDay: number;
  streak: number;
  lastStudyDate: string;
  quizScore: number;
  totalSeconds: number;
  history: { date: string; seconds: number }[];
}

export type Topic = 
  | 'Family' | 'School' | 'Animals' | 'Colors' | 'Toys' 
  | 'Hobbies' | 'Fruits' | 'Sports' | 'Nature' | 'Superheroes' 
  | 'Space' | 'Ocean' | 'Dressing' | 'Food' | 'Daily Routine';

export const TOPICS: Topic[] = [
  'Family', 'School', 'Animals', 'Colors', 'Toys', 
  'Hobbies', 'Fruits', 'Sports', 'Nature', 'Superheroes', 
  'Space', 'Ocean', 'Dressing', 'Food', 'Daily Routine'
];

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  preferences?: {
    dailyGoal: number;
    reminders: boolean;
    soundEnabled: boolean;
  };
}

export enum ViewMode {
  HOME = 'home',
  CHATS = 'chats',
  SETTINGS = 'settings',
  PROFILE = 'profile'
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
