
import { GoogleGenAI, Type } from "@google/genai";
import { CodeState } from "../types";

const API_KEY = process.env.API_KEY || "";

export const modifyCodeWithAI = async (
  prompt: string,
  currentState: CodeState,
  history: { role: 'user' | 'model', content: string }[]
): Promise<CodeState> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [
      { 
        role: 'user', 
        parts: [{ 
          text: `You are an expert web developer. Modify the current HTML and CSS based on the user's request.
          Current HTML:
          ${currentState.html}
          
          Current CSS:
          ${currentState.css}
          
          User Request: ${prompt}` 
        }] 
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          html: { type: Type.STRING },
          css: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["html", "css"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const chatAboutCode = async (
  query: string,
  currentState: CodeState,
  history: { role: 'user' | 'model', content: string }[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const contents = [
    ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
    { 
      role: 'user', 
      parts: [{ 
        text: `The user has a question about this code:
        HTML: ${currentState.html}
        CSS: ${currentState.css}
        
        Question: ${query}` 
      }] 
    }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    // @ts-ignore
    contents: contents,
    config: {
      systemInstruction: "You are a helpful coding assistant. Explain the code and suggest improvements if asked."
    }
  });

  return response.text || "I'm sorry, I couldn't process that.";
};
