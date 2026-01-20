
import { GoogleGenAI, Type } from "@google/genai";
// Removed QuizQuestion as it is not exported from types.ts
import { VocabularyItem, Topic, ReadingPassage } from "./types";

// Always use named parameter for apiKey and use process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const VOCAB_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    ipa: { type: Type.STRING },
    definition: { type: Type.STRING },
    vietnameseDefinition: { type: Type.STRING },
    example: { type: Type.STRING },
    grade: { type: Type.INTEGER },
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
    mnemonicHint: { type: Type.STRING, description: 'Giải thích mẹo ghi nhớ bằng tiếng Việt một cách hài hước và dễ nhớ cho trẻ em' }
  },
  required: [
    'word', 'ipa', 'definition', 'vietnameseDefinition', 'example', 
    'grade', 'topic', 'rootAnalysis', 'synonyms', 'antonyms', 'mnemonicHint'
  ]
};

const BATCH_SCHEMA = {
  type: Type.ARRAY,
  items: VOCAB_SCHEMA
};

export const generateDailySet = async (topic: Topic, count: number = 8, grade: number = 2): Promise<VocabularyItem[]> => {
  // Use 'gemini-3-flash-preview' for basic generation tasks
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Bạn là giáo viên tiếng Anh cho trẻ em Việt Nam. Hãy tạo danh sách ${count} từ vựng tiếng Anh chủ đề ${topic} phù hợp cho học sinh Lớp ${grade}. 
    - Giải thích từ vựng đơn giản.
    - PHẦN mnemonicHint PHẢI LÀ TIẾNG VIỆT, dùng hình ảnh liên tưởng vui nhộn.
    - Phân tích root (gốc từ) nếu có.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: BATCH_SCHEMA,
    },
  });

  // Use response.text property directly
  const data = JSON.parse(response.text.trim());
  return data.map((item: any) => ({
    ...item,
    id: Math.random().toString(36).substr(2, 9),
    learnedAt: Date.now(),
    reviewCount: 0,
    grade: grade,
    interval: 0,
    easiness: 2.5,
    nextReview: Date.now()
  }));
};

export const generateReadingPassages = async (words: string[], grade: number = 2): Promise<ReadingPassage[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Viết 2 mẩu chuyện ngắn vui nhộn cho học sinh lớp ${grade} sử dụng các từ: ${words.join(', ')}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
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
      },
    },
  });
  // Use response.text property directly
  return JSON.parse(response.text.trim());
};

export const getTutorAdvice = async (stats: any): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Bạn là chú Gấu Tutor thông thái. Hãy nhắn nhủ một câu cổ vũ cực kỳ đáng yêu cho bé đã học được ${stats.totalLearned} từ.`,
  });
  // Use response.text property directly
  return response.text;
};
