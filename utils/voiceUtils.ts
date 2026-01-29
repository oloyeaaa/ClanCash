
import { GoogleGenAI, Type } from "@google/genai";

interface ParsedExpense {
  name: string;
  price: number;
  category: string;
}

/**
 * Parses a voice command using Gemini AI.
 * Handles variations like 'Add Netflix 15.99 to Entertainment' or more natural language.
 * Uses structured output (JSON) for reliable parsing.
 */
export const parseVoiceCommand = async (text: string): Promise<ParsedExpense | null> => {
  if (!text) return null;

  // Initialize the Gemini API client right before making an API call to ensure it uses the current API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Use gemini-3-flash-preview for efficient text parsing and extraction
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{
          text: `Parse this financial command into structured data: "${text}". 
          Extract the item name, the numerical price, and the most relevant category.
          Available categories: Housing, Groceries, Utilities, Entertainment, Transport, Other.
          If the category is not specified or doesn't fit, map it to 'Other'.`
        }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: 'The name of the item or service.',
            },
            price: {
              type: Type.NUMBER,
              description: 'The numerical amount spent.',
            },
            category: {
              type: Type.STRING,
              description: 'Must be one of: Housing, Groceries, Utilities, Entertainment, Transport, Other.',
            },
          },
          required: ["name", "price", "category"],
        },
      },
    });

    // Extract text directly from the response object as per Gemini SDK guidelines
    const result = JSON.parse(response.text || '{}');
    
    return {
      name: result.name || 'Unknown Item',
      price: typeof result.price === 'number' ? result.price : 0,
      category: result.category || 'Other'
    };
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return null;
  }
};
