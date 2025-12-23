import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateRentalAdvice = async (query: string, language: 'EN' | 'SW') => {
  try {
    const systemInstruction = `You are "Rafiki wa Nyumba" (House Friend), an expert AI assistant for NIKONEKTI, a Tanzanian rental housing platform. 
    Your goal is to help tenants and landlords in Tanzania (Dar es Salaam, Dodoma, etc.).
    
    Key characteristics:
    - Language: Respond in ${language === 'SW' ? 'Swahili (Kiswahili sanifu mixed with common street terms if appropriate)' : 'English'}.
    - Tone: Helpful, trustworthy, and culturally aware.
    - Topics: Rental prices, avoiding "dalali" (broker) scams, tenancy agreements, tenant rights, mobile money payments (M-Pesa/Tigo/Airtel).
    - Currency: Always use TZS (Tanzanian Shillings).
    - Advice: 
      - Warn users never to pay without seeing the house.
      - Explain that NIKONEKTI verifies landlords.
      - Suggest specific areas based on budget if asked (e.g., "Sinza is good for students", "Masaki is high-end").
    
    Keep responses concise (under 100 words) and easy to read on mobile.`;

    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model,
      contents: query,
      config: {
        systemInstruction,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === 'SW' 
      ? "Samahani, mtandao unasumbua kidogo. Tafadhali jaribu tena."
      : "Sorry, I'm having trouble connecting right now. Please try again.";
  }
};