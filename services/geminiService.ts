
import { GoogleGenAI, Type } from "@google/genai";

export const getSuggestedEmoji = async (name: string, category: string, observation?: string): Promise<string> => {
  try {
    // Create instance inside the function to ensure it uses the current API key context
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sugira um único emoji que melhor represente um presente ou a relação para esta pessoa:
      Nome: ${name}
      Categoria: ${category}
      Observação: ${observation || 'Nenhuma'}
      Responda APENAS com o caractere do emoji.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    // Access .text property directly (not as a method)
    const emoji = (response.text || '').trim();
    // Validate if it's a reasonably short string (covering multi-codepoint emojis) or fallback
    return (emoji && emoji.length <= 8) ? emoji : '🎂';
  } catch (error) {
    console.error("Erro ao buscar emoji do Gemini:", error);
    return '🎂';
  }
};
