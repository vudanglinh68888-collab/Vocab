
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
  cefr: 'B2' | 'C1';
  topic: string;
  rootAnalysis: RootAnalysis;
  synonyms: string[];
  antonyms: string[];
  ieltsParaphrases: string[]; 
  mnemonicHint: string;
  learnedAt: number;
  reviewCount: number;
  isMastered?: boolean;
  srsLevel: number; // 0 to 4 (4 is mastered)
  nextReviewAt: number; // timestamp for next scheduled review
}

export interface ReadingPassage {
  title: string;
  contentEn: string;
  contentVi: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'context-fill';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  wordId: string;
}

export interface StudyStats {
  totalLearned: number;
  currentDay: number;
  streak: number;
  lastStudyDate: string;
  quizScore: number;
}

export type Topic = 
  | 'Education' | 'Environment' | 'Technology' | 'Health' | 'Society' 
  | 'Economy' | 'Art' | 'Psychology' | 'Work' | 'Travel' 
  | 'Media' | 'Crime' | 'Government' | 'Culture' | 'Science' 
  | 'Communication' | 'Food' | 'Sport' | 'History' | 'Housing' 
  | 'Advertising' | 'Youth' | 'Elderly' | 'Globalization' | 'Transport' 
  | 'Energy' | 'Fashion' | 'Law' | 'Family' | 'Personalities';

export const TOPICS: Topic[] = [
  'Education', 'Environment', 'Technology', 'Health', 'Society', 
  'Economy', 'Art', 'Psychology', 'Work', 'Travel', 
  'Media', 'Crime', 'Government', 'Culture', 'Science', 
  'Communication', 'Food', 'Sport', 'History', 'Housing', 
  'Advertising', 'Youth', 'Elderly', 'Globalization', 'Transport', 
  'Energy', 'Fashion', 'Law', 'Family', 'Personalities'
];
