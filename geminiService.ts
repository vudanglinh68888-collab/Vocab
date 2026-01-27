
import { GoogleGenAI, Type } from "@google/genai";
import { VocabularyItem, Topic, ReadingPassage } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const VOCAB_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    ipa: { type: Type.STRING },
    definition: { type: Type.STRING },
    vietnameseDefinition: { type: Type.STRING },
    example: { type: Type.STRING },
    grade: { type: Type.INTEGER, description: 'Lớp học từ 2 đến 9' },
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
    mnemonicHint: { type: Type.STRING, description: 'Mẹo ghi nhớ bằng tiếng Việt theo phong cách Bà Bô' }
  },
  required: [
    'word', 'ipa', 'definition', 'vietnameseDefinition', 'example', 
    'grade', 'topic', 'rootAnalysis', 'synonyms', 'antonyms', 'mnemonicHint'
  ]
};

export const generateDailySet = async (topic: Topic, count: number = 5, grade: number = 2): Promise<VocabularyItem[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Bạn là "Bà Bô" - một người mẹ giỏi tiếng Anh đang dạy con. Hãy tạo ${count} từ vựng phù hợp cho học sinh LỚP ${grade} thuộc chủ đề ${topic}. 
    - Từ vựng bám sát chương trình phổ thông.
    - MnemonicHint giải thích kiểu "mẹ dạy con".`,
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
    contents: `Con của bạn ("Bà Bô") vừa viết câu: "${userSentence}" với từ "${word}". 
    Hãy nhận xét như một người mẹ đang chấm bài cho con.
    QUY TẮC QUAN TRỌNG: 
    - Nếu con làm đúng hoặc điểm >= 80, trong câu nhận xét MUST bao gồm cụm từ "nhanh hơn Bông Béo rồi!".
    - Nếu con làm sai hoặc điểm < 80, trong câu nhận xét MUST bao gồm cụm từ "cố lên không Bông Đồng Hồ chạy nhanh hơn bây giờ!".
    Trả về JSON: { "score": number, "feedback": "nhận xét", "correction": "câu đúng", "vietnamese": "nghĩa tiếng Việt" }`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text.trim());
};

export const getDailyPerformanceReview = async (learnedWords: string[], stats: any): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Hôm nay con đã học xong bài. Từ đã học: ${learnedWords.join(', ')}. 
    Hãy viết một đoạn tổng kết kiểu "Bà Bô" khen ngợi hoặc dặn dò con. 
    Lưu ý: Nếu kết quả tốt hãy nhắc đến việc con "nhanh hơn Bông Béo", nếu chưa tốt hãy nhắc con "Bông Đồng Hồ đang chạy nhanh đấy".`,
  });
  return response.text;
};

export const generateReadingPassages = async (words: string[], grade: number): Promise<ReadingPassage[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Viết 2 mẩu chuyện cực ngắn dành cho trẻ lớp ${grade} có dùng các từ: ${words.join(', ')}. Trả về mảng JSON {title, contentEn, contentVi}.`,
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
