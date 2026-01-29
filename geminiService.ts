
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
    grade: { type: Type.INTEGER, description: 'Lớp học từ 5 đến 9' },
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

const EVAL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER },
    feedback: { type: Type.STRING },
    correction: { type: Type.STRING },
    vietnamese: { type: Type.STRING }
  },
  required: ['score', 'feedback', 'correction', 'vietnamese']
};

export const generateDailySet = async (topic: Topic, count: number = 5, grade: number = 5, streak: number = 0, totalLearned: number = 0, excludedWords: string[] = []): Promise<VocabularyItem[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Bạn là "Mẹ chiên giòn". Hãy tạo ${count} từ vựng Tiếng Anh học thuật phù hợp cho học sinh LỚP ${grade} (trong khoảng lớp 5-9). 
    Chủ đề: ${topic}. 
    KHÔNG ĐƯỢC trùng với: ${excludedWords.slice(-50).join(', ')}.
    - Giải thích dí dỏm, mẹ dạy con.
    - Tập trung vào từ vựng nâng cao hơn một chút so với tiểu học.`,
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
  const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tạo 20 từ vựng nền tảng cực hay cho học sinh LỚP ${grade} (khối 5-9). Trả về JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: VOCAB_SCHEMA },
    },
  });
  
  const data = JSON.parse(response.text.trim());
  return data.map((item: any) => ({
    ...item,
    id: Math.random().toString(36).substr(2, 9),
    learnedAt: Date.now() - 86400000,
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
    QUY TẮC NHẬN XÉT:
    - Nếu đúng (>=80đ): Phải có câu "nở to hơn nở rộ rồi".
    - Nếu sai (<80đ): Phải có câu "nở rộ nở to hơn rồi. Cẩn thận!".`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: EVAL_SCHEMA
    }
  });
  return JSON.parse(response.text.trim());
};

export const getDailyPerformanceReview = async (learnedWords: string[], stats: any): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tổng kết ngày cho con. Nếu con học tốt hãy nói con "nở to hơn nở rộ rồi", nếu chưa tốt hãy dặn "nở rộ nở to hơn rồi. Cẩn thận!".`,
  });
  return response.text;
};

export const generateReadingPassages = async (words: string[], grade: number): Promise<ReadingPassage[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Viết 2 mẩu chuyện tiếng Anh trình độ LỚP ${grade} (khối 5-9) chứa các từ: ${words.join(', ')}. JSON {title, contentEn, contentVi}.`,
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

// Fix: Implement generateAIAvatar to allow kids to create their own custom profile pictures using gemini-2.5-flash-image
export const generateAIAvatar = async (description: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `Create a cute, friendly, kid-friendly cartoon-style profile avatar for an educational app. Character description: ${description}`,
        },
      ],
    },
  });

  // Find the image part in the response candidates
  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData) {
    const base64Data = part.inlineData.data;
    const mimeType = part.inlineData.mimeType || 'image/png';
    return `data:${mimeType};base64,${base64Data}`;
  }
  
  throw new Error("Mẹ chưa vẽ xong bức tranh này rồi con ơi!");
};
