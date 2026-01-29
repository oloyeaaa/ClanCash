
import { GoogleGenAI, Type } from "@google/genai";

interface ParsedExpense {
  name: string;
  price: number;
  category: string;
  paymentMethod?: string;
  notes?: string;
}

/**
 * Parses a voice command using Gemini AI.
 * Handles complex variations like 'Add $45 for gas at Shell using my Credit Card for the road trip'.
 */
export const parseVoiceCommand = async (text: string): Promise<ParsedExpense | null> => {
  if (!text) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{
          text: `You are a financial data extractor. Parse the following voice command: "${text}".
          
          Extract the following information:
          1. item_name: The primary product or service purchased.
          2. amount: The numerical cost.
          3. category: Choose the most relevant from [Housing, Groceries, Utilities, Entertainment, Transport, Other].
          4. payment_method: If mentioned, extract how it was paid (e.g., Apple Pay, Debit Card, Visa, Cash).
          5. notes: Any additional context or reason for the expense (e.g., 'birthday gift', 'monthly subscription').
          
          Rules:
          - If multiple items are mentioned, pick the most significant one.
          - If category is ambiguous, use 'Other'.
          - If payment_method or notes aren't present, return null for those fields.`
        }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            item_name: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            payment_method: { type: Type.STRING, nullable: true },
            notes: { type: Type.STRING, nullable: true },
          },
          required: ["item_name", "amount", "category"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    
    return {
      name: result.item_name || 'Unknown Item',
      price: typeof result.amount === 'number' ? result.amount : 0,
      category: result.category || 'Other',
      paymentMethod: result.payment_method || undefined,
      notes: result.notes || undefined
    };
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return null;
  }
};