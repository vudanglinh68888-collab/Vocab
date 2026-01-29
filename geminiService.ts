
import { GoogleGenAI, Type } from "@google/genai";
import { VocabularyItem, Topic, ReadingPassage, TOPICS } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const VOCAB_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    ipa: { type: Type.STRING },
    definition: { type: Type.STRING },
    vietnameseDefinition: { type: Type.STRING },
    example: { type: Type.STRING },
    grade: { type: Type.INTEGER, description: 'Lớp học từ 4 đến 9' },
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
    mnemonicHint: { type: Type.STRING, description: 'Mẹo ghi nhớ hài hước của Mẹ chiên giòn' }
  },
  required: [
    'word', 'ipa', 'definition', 'vietnameseDefinition', 'example', 
    'grade', 'topic', 'rootAnalysis', 'synonyms', 'antonyms', 'mnemonicHint'
  ]
};

export const generateDailySet = async (topic: Topic, count: number = 5, grade: number = 5, streak: number = 0, totalLearned: number = 0, excludedWords: string[] = []): Promise<VocabularyItem[]> => {
  let difficulty = "trình độ Lớp 4-5 cơ bản";
  if (grade >= 6 && grade <= 7) difficulty = "trình độ Academic English trung học (Intermediate)";
  if (grade >= 8) difficulty = "trình độ IELTS B2-C1 (Advanced)";
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Bạn là "Mẹ chiên giòn". Hãy tạo ${count} từ vựng Tiếng Anh thuộc ${difficulty} phù hợp cho học sinh LỚP ${grade}. 
    Chủ đề: ${topic}. 
    CỰC KỲ QUAN TRỌNG: KHÔNG ĐƯỢC chọn bất kỳ từ nào trong danh sách ĐÃ THUỘC sau: [${excludedWords.join(', ')}].
    - Giải thích dí dỏm, mẹ dạy con.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: VOCAB_SCHEMA },
    },
  });

  const data = JSON.parse(response.text.trim());
  return data.map((item: any) => ({
    ...item,
    id: Math.random().toString(36).substr(2, 9),
    learnedAt: Date.now(),
    reviewCount: 0,
    interval: 0,
    easiness: 2.5,
    nextReview: Date.now()
  }));
};

export const generateInitialBatch = async (grade: number): Promise<VocabularyItem[]> => {
  let difficulty = grade <= 5 ? "Lớp 4-5" : grade <= 7 ? "Intermediate" : "IELTS B2-C1";
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Bạn là "Mẹ chiên giòn". Hãy tạo 20 từ vựng Tiếng Anh khởi đầu thuộc trình độ ${difficulty} phù hợp cho học sinh LỚP ${grade}. 
    Các từ vựng nên đa dạng chủ đề. Giải thích dí dỏm phong cách mẹ dạy con.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: VOCAB_SCHEMA },
    },
  });

  const data = JSON.parse(response.text.trim());
  return data.map((item: any) => ({
    ...item,
    id: Math.random().toString(36).substr(2, 9),
    learnedAt: Date.now(),
    reviewCount: 0,
    interval: 0,
    easiness: 2.5,
    nextReview: Date.now()
  }));
};

export const evaluateSentence = async (word: string, userSentence: string): Promise<{ score: number, feedback: string, correction: string, vietnamese: string }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Mẹ chiên giòn chấm bài con viết: "${userSentence}" (từ: ${word}).
    QUY TẮC:
    - Nếu score >= 80: Nhận xét có "nở to hơn nở rộ rồi".
    - Nếu score < 80: Nhận xét là "nở rộ nở to hơn rồi. Cẩn thận!".`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          correction: { type: Type.STRING },
          vietnamese: { type: Type.STRING }
        },
        required: ['score', 'feedback', 'correction', 'vietnamese']
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const getDailyPerformanceReview = async (learnedWords: string[], stats: any): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tổng kết ngày cho con. Nếu tốt khen "nở to hơn nở rộ rồi", chưa tốt dặn "nở rộ nở to hơn rồi. Cẩn thận!".`,
  });
  return response.text;
};

export const generateReadingPassages = async (words: string[], grade: number): Promise<ReadingPassage[]> => {
  const difficulty = grade >= 8 ? "IELTS Reading Passage" : "Short Academic Story";
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Viết 2 mẩu chuyện tiếng Anh trình độ ${difficulty} cho học sinh LỚP ${grade} chứa các từ: ${words.join(', ')}. JSON {title, contentEn, contentVi}.`,
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
  return JSON.parse(response.text.trim());
};

export const generateAIAvatar = async (description: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Cute cartoon avatar: ${description}` }] }
  });
  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData) return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
  throw new Error("Lỗi vẽ hình!");
};
