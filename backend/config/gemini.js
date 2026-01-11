import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let visionModel = null;
let chatModel = null;

export const initGemini = () => {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  visionModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  chatModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  console.log('✅ Gemini AI Initialized');
};

export const getVisionModel = () => visionModel;
export const getChatModel = () => chatModel;
export const getGenAI = () => genAI;
