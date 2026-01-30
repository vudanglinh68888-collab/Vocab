
import { GoogleGenAI, Type } from "@google/genai";
import { VocabularyItem, LessonState, PlacementQuestion } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const VOCAB_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    ipa: { type: Type.STRING },
    definition: { type: Type.STRING },
    vietnameseDefinition: { type: Type.STRING },
    example: { type: Type.STRING },
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
    mnemonicHint: { type: Type.STRING }
  },
  required: ['word', 'ipa', 'definition', 'vietnameseDefinition', 'example', 'topic', 'rootAnalysis', 'synonyms', 'antonyms', 'mnemonicHint']
};

// Helper function to safely parse JSON from AI response
const cleanAndParseJSON = (text: string) => {
  try {
    // 1. Remove markdown code blocks
    let cleanText = text.replace(/```json\n?|```/g, '').trim();
    
    // 2. Find the first '{' and last '}'
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    } else {
      throw new Error("No JSON object found in response");
    }

    // 3. Simple cleanup for common AI JSON mistakes (like trailing commas)
    cleanText = cleanText.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error. Raw text:", text, "Error:", e);
    throw new Error("AI trả về dữ liệu không đúng định dạng. Vui lòng thử lại.");
  }
};

export const generateLessonForDay = async (
  day: number, 
  grade: number, 
  proficiencyLevel?: string,
  historyContext?: string
): Promise<LessonState> => {
  // Retry mechanism for stability
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      // Điều chỉnh prompt dựa trên trình độ
      let levelPrompt = `TRÌNH ĐỘ: Lớp ${grade} (Sách giáo khoa Việt Nam).`;
      if (proficiencyLevel) {
        levelPrompt = `TRÌNH ĐỘ HỌC SINH: ${proficiencyLevel}. Hãy điều chỉnh độ khó từ vựng phù hợp với trình độ này trong phạm vi chương trình Lớp ${grade}.`;
      }
      
      let contextPrompt = "";
      if (historyContext) {
        contextPrompt = `CÁC CHỦ ĐỀ ĐÃ HỌC GẦN ĐÂY: ${historyContext}. Hãy chọn chủ đề MỚI, KHÁC với các chủ đề trên để bài học phong phú.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Bạn là "Mẹ chiên giòn", gia sư Tiếng Anh cho học sinh tiểu học.
        NHIỆM VỤ: Tạo bài học cho NGÀY THỨ ${day} trong lộ trình 90 ngày.
        ${levelPrompt}
        ${contextPrompt}
        CHỦ ĐỀ: Chọn 1 chủ đề trong sách giáo khoa Tiếng Anh lớp ${grade} phù hợp với ngày thứ ${day}.
        
        YÊU CẦU:
        1. Tạo 10-12 từ vựng quan trọng (Key vocabulary) của chủ đề đó.
        2. Một mẫu câu giao tiếp (sentence_pattern) đặc trưng của bài học.
        3. Giải thích hóm hỉnh, dễ hiểu cho trẻ em 10-11 tuổi.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              vocabulary: { type: Type.ARRAY, items: VOCAB_SCHEMA },
              sentence_pattern: { type: Type.STRING }
            },
            required: ['topic', 'vocabulary', 'sentence_pattern']
          }
        }
      });

      const text = response.text || "{}";
      const data = cleanAndParseJSON(text);

      // Validate data stability
      if (!data.vocabulary || !Array.isArray(data.vocabulary) || data.vocabulary.length === 0) {
        throw new Error("AI returned empty vocabulary list");
      }

      return {
        day,
        lesson_id: day,
        topic: data.topic,
        vocabulary: data.vocabulary.map((v: any) => ({
          ...v,
          id: Math.random().toString(36).substr(2, 9),
          grade,
          learnedAt: Date.now(),
          nextReview: Date.now(),
          reviewCount: 0,
          interval: 0,
          easiness: 2.5
        })),
        sentence_pattern: data.sentence_pattern,
        completed: false
      };
    } catch (e) {
      console.warn(`Attempt ${attempt + 1} failed:`, e);
      lastError = e;
      // Wait 1s before retry
      await new Promise(res => setTimeout(res, 1000));
    }
  }
  
  throw lastError || new Error("Failed to generate lesson after 3 attempts");
};

export const generatePlacementTest = async (): Promise<PlacementQuestion[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tạo 10 câu hỏi trắc nghiệm kiểm tra kiến thức Tiếng Anh Lớp 5 (theo chương trình Bộ Giáo Dục Việt Nam - Global Success/i-Learn Smart Start).
    
    Yêu cầu phân bổ:
    - 3 câu mức Cơ bản (Nhận biết từ vựng quen thuộc: Daily routine, School subjects...).
    - 4 câu mức Khá (Hiểu nghĩa trong ngữ cảnh, chia động từ đơn giản).
    - 3 câu mức Giỏi (Từ vựng nâng cao hơn, cấu trúc câu ghép, giới từ...).
    
    Định dạng Output JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] }
              },
              required: ["id", "question", "options", "correctAnswer", "difficulty"]
            }
          }
        }
      }
    }
  });

  const text = response.text || "{}";
  const data = cleanAndParseJSON(text);
  return data.questions;
};

export const generateWeeklyTest = async (grade: number, learnedTopics: string[]): Promise<PlacementQuestion[]> => {
  const topicsStr = learnedTopics.length > 0 ? learnedTopics.join(", ") : "các chủ đề cơ bản lớp 5";
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tạo bài kiểm tra định kỳ hàng tuần cho học sinh Lớp ${grade}.
    CHỦ ĐỀ CẦN KIỂM TRA: ${topicsStr}.
    
    YÊU CẦU:
    - Tạo 15 câu hỏi trắc nghiệm tổng hợp (Từ vựng, Ngữ pháp, Đọc hiểu ngắn).
    - Độ khó: 5 câu Dễ, 7 câu Trung bình, 3 câu Khó.
    - Nội dung phải bám sát các chủ đề đã học.
    
    Định dạng Output JSON giống như Placement Test.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] }
              },
              required: ["id", "question", "options", "correctAnswer", "difficulty"]
            }
          }
        }
      }
    }
  });

  const text = response.text || "{}";
  const data = cleanAndParseJSON(text);
  return data.questions;
};

// Function to generate an AI avatar image from a description
export const generateAIAvatar = async (description: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `Create a cute, vibrant, and friendly avatar for a Vietnamese child learning English based on this description: ${description}. The style should be adventure-like and high quality.`,
        },
      ],
    },
  });
  
  // Iterate through parts to find the image data
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64EncodeString: string = part.inlineData.data;
      return `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
    }
  }
  throw new Error("Could not find generated image in response");
};

// Function to evaluate a sentence provided by the user using a target vocabulary word
export const evaluateSentence = async (word: string, sentence: string): Promise<any> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Bạn là "Mẹ chiên giòn", gia sư Tiếng Anh tiểu học. 
    Hãy chấm bài cho bé lớp 5 khi đặt câu với từ "${word}".
    CÂU CỦA BÉ: "${sentence}"
    
    Trả về JSON:
    - score: 0-100.
    - feedback: Nhận xét ngắn gọn, vui vẻ, khích lệ (Tiếng Việt).
    - correction: Câu sửa lỗi (nếu sai).
    - vietnamese: Dịch nghĩa câu đúng.`,
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
  
  const text = response.text || "{}";
  return cleanAndParseJSON(text);
};
