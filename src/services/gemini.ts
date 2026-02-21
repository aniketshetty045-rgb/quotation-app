import { GoogleGenAI, Type } from "@google/genai";

export async function generateSmartDescription(productName: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, professional 1-sentence sales description for a product named "${productName}" to be used in a business quotation. Keep it professional and concise.`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
}

export async function generateSmartTerms(docType: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 3 standard professional business terms and conditions for a "${docType}". Return them as a simple bulleted list.`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
}

export async function parsePdfWithGemini(base64Pdf: string, docType: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) throw new Error("Gemini API Key is missing. Please check your environment variables.");
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Pdf,
            },
          },
          {
            text: `Extract all professional business data from this ${docType} PDF. 
            Focus on identifying the customer details, every line item (name, quantity, price, tax rate), and the final totals.
            If data is missing, use empty strings or 0.`,
          },
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            customer: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                companyName: { type: Type.STRING },
                mobile: { type: Type.STRING },
                email: { type: Type.STRING },
                address: { type: Type.STRING },
              },
              required: ['name'],
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  price: { type: Type.NUMBER },
                  gst: { type: Type.NUMBER, description: 'GST percentage' },
                  hsn: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['name', 'quantity', 'price'],
              },
            },
            totals: {
              type: Type.OBJECT,
              properties: {
                subTotal: { type: Type.NUMBER },
                totalTax: { type: Type.NUMBER },
                grandTotal: { type: Type.NUMBER },
                docNumber: { type: Type.STRING },
                date: { type: Type.STRING, description: 'YYYY-MM-DD' },
              },
            },
          },
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    throw error;
  }
}
