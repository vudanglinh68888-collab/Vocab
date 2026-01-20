
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
