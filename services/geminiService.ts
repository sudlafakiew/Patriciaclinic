import { GoogleGenAI } from "@google/genai";
import { Service } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateConsultationPlan = async (
  symptoms: string,
  availableServices: Service[],
  customerName: string
): Promise<{ recommendation: string; recommendedServices: string[] }> => {
  if (!apiKey) {
    return {
      recommendation: "กรุณาตั้งค่า API KEY เพื่อใช้งานฟีเจอร์ AI (Please configure API Key)",
      recommendedServices: []
    };
  }

  const serviceList = availableServices.map(s => `- ${s.name} (${s.category}): ${s.price} THB`).join('\n');

  const prompt = `
    Act as a professional beauty clinic consultant.
    Customer Name: ${customerName}
    Customer Concerns/Desires: "${symptoms}"

    Available Services Menu:
    ${serviceList}

    Task:
    1. Analyze the customer's concern.
    2. Recommend 1-3 most suitable services from the menu.
    3. Write a polite, professional, and persuasive consultation note in Thai language explaining why these treatments are good for them.
    4. Return the response in JSON format.

    Response Format (JSON):
    {
      "recommendation": "The consultation note in Thai...",
      "recommendedServices": ["Exact Name of Service 1", "Exact Name of Service 2"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      recommendation: "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI (Error connecting to AI)",
      recommendedServices: []
    };
  }
};

export const generateServiceImage = async (serviceName: string, category: string): Promise<string | null> => {
  if (!apiKey) return null;

  const prompt = `A professional, photorealistic, high-quality aesthetic clinic promotional image for a service called "${serviceName}" (Category: ${category}). 
  The image should be clean, minimalist, soft lighting, spa-like atmosphere, and reassuring. 
  Focus on the result or the feeling of the treatment. 
  Do not include text in the image. Square aspect ratio.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Iterate through parts to find the image
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};