
import { GoogleGenAI, Type } from "@google/genai";
import { VocabularyItem, Topic, ReadingPassage, QuizQuestion } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const VOCAB_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    ipa: { type: Type.STRING },
    definition: { type: Type.STRING },
    vietnameseDefinition: { type: Type.STRING },
    example: { type: Type.STRING },
    cefr: { type: Type.STRING, enum: ['B2', 'C1'] },
    topic: { type: Type.STRING },
    rootAnalysis: {
      type: Type.OBJECT,
      properties: {
        root: { type: Type.STRING },
        prefix: { type: Type.STRING },
        suffix: { type: Type.STRING },
        explanation: { type: Type.STRING }
      },
      required: ['root', 'prefix', 'suffix', 'explanation']
    },
    synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
    antonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
    ieltsParaphrases: { type: Type.ARRAY, items: { type: Type.STRING } },
    mnemonicHint: { type: Type.STRING }
  },
  required: [
    'word', 'ipa', 'definition', 'vietnameseDefinition', 'example', 
    'cefr', 'topic', 'rootAnalysis', 'synonyms', 'antonyms', 
    'ieltsParaphrases', 'mnemonicHint'
  ]
};

const BATCH_SCHEMA = {
  type: Type.ARRAY,
  items: VOCAB_SCHEMA
};

const PASSAGE_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      contentEn: { type: Type.STRING },
      contentVi: { type: Type.STRING }
    },
    required: ['title', 'contentEn', 'contentVi']
  }
};

const QUIZ_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      type: { type: Type.STRING, enum: ['multiple-choice', 'context-fill'] },
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswer: { type: Type.STRING },
      explanation: { type: Type.STRING },
      wordId: { type: Type.STRING }
    },
    required: ['id', 'type', 'question', 'correctAnswer', 'explanation', 'wordId']
  }
};

export const generateDailySet = async (topic: Topic, count: number = 10): Promise<VocabularyItem[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Acting as a professional IELTS Tutor, generate a list of ${count} high-level (B2-C1) academic words for the topic: ${topic}. 
    Each word must have detailed etymology, mnemonics, and specific IELTS paraphrases.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: BATCH_SCHEMA,
    },
  });

  const data = JSON.parse(response.text);
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  return data.map((item: any) => ({
    ...item,
    id: Math.random().toString(36).substr(2, 9),
    learnedAt: now,
    reviewCount: 0,
    srsLevel: 0,
    nextReviewAt: now + oneDay // First review in 1 day
  }));
};

export const generateReadingPassages = async (words: string[]): Promise<ReadingPassage[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write 2 short IELTS-style passages (100-150 words) using these words: ${words.join(', ')}. Include Vietnamese translations.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: PASSAGE_SCHEMA,
    },
  });
  return JSON.parse(response.text);
};

export const generateQuiz = async (words: VocabularyItem[]): Promise<QuizQuestion[]> => {
  const wordDetails = words.map(w => `${w.word} (Def: ${w.definition}, VN: ${w.vietnameseDefinition}, Ex: ${w.example})`).join('; ');
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 5-question IELTS vocabulary quiz based on these words: ${wordDetails}. 
    Mix 'multiple-choice' (meaning/synonym) and 'context-fill' (fill in the sentence). 
    For 'multiple-choice', provide 4 options. For 'context-fill', the correctAnswer is the word itself. 
    Ensure distractors are plausible for B2-C1 level.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: QUIZ_SCHEMA,
    },
  });
  return JSON.parse(response.text);
};

export const getTutorAdvice = async (stats: any): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Acting as a motivational IELTS Tutor, give a brief (2-sentence) advice to a student who has learned ${stats.totalLearned} words and is on day ${stats.currentDay}.`,
  });
  return response.text;
};

export const analyzeSpecificWord = async (word: string): Promise<VocabularyItem> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze: "${word}". Provide root, prefix, suffix, mnemonic, synonyms, antonyms, and IELTS paraphrase examples.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: VOCAB_SCHEMA,
    },
  });
  const data = JSON.parse(response.text);
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  return { 
    ...data, 
    id: Math.random().toString(36).substr(2, 9), 
    learnedAt: now, 
    reviewCount: 0,
    srsLevel: 0,
    nextReviewAt: now + oneDay
  };
};
