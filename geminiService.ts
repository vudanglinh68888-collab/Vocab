
import { GoogleGenAI, Type } from "@google/genai";
import { VocabularyItem, Topic } from "./types";

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

export const generateVocabulary = async (topic: Topic): Promise<VocabularyItem> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a high-level B2 or C1 IELTS academic vocabulary word related to the topic: ${topic}. 
    Focus on words that are frequently used in IELTS Writing Task 2 and Reading. 
    Provide an etymological breakdown (root, prefix, suffix) to help with long-term memory.
    Include specific 'IELTS Paraphrases' which are phrases or words often used to rewrite this word in IELTS exams.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: VOCAB_SCHEMA,
    },
  });

  const data = JSON.parse(response.text);
  return {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
  };
};

export const analyzeSpecificWord = async (word: string): Promise<VocabularyItem> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following word for IELTS B2-C1 level study: "${word}". 
    Provide root, prefix, suffix, mnemonic hints, synonyms, antonyms, and IELTS paraphrase examples.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: VOCAB_SCHEMA,
    },
  });

  const data = JSON.parse(response.text);
  return {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
  };
};
