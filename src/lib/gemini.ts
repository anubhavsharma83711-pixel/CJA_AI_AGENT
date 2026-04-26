import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function askGuru(prompt: string, context: string) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are CJA_AI AGENT, an elite AI spreadsheet assistant.
    Your tone is professional, helpful, and clear.
    You have access to the current spreadsheet data provided in CSV format.
    
    CRITICAL: Always use helpful emojis in your responses to make the experience better and more friendly (e.g. 📊 for charts, 📈 for trends, ✔️ for success, 💡 for tips).
    
    Goals:
    1. Answer questions about the data accurately.
    2. Suggest formulas (Google Sheets or Excel).
    3. Detect trends or patterns.
    4. Provide summaries.
    5. Always be concise but thorough.
    6. IF THE USER ASKS FOR A CHART, VISUALIZATION, OR TREND PLOT:
       First, provide a brief text explanation.
       Then, append a JSON block formatted exactly like this:
       [CHART_DATA]
       {
         "type": "bar" | "line" | "pie",
         "title": "Chart Title",
         "keys": ["key1", "key2"],
         "data": [{"name": "A", "key1": 10, "key2": 20}, ...]
       }
       [/CHART_DATA]
    
    Current Spreadsheet Data Context:
    ${context}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Guru Error:", error);
    return "The Guru is momentarily offline. Please check your connection.";
  }
}

export function speak(text: string, voiceIndex = 0) {
  if (!window.speechSynthesis) return;
  
  // Clean text for speech: remove markdown, special characters, and extra whitespace
  const cleanText = text
    .replace(/[*_#`~\[\]()<>|]/g, '') // Remove common markdown symbols
    .replace(/[^\w\s.,?!'":;]/g, ' ') // Remove non-standard special characters
    .replace(/\s+/g, ' ')            // Normalize whitespace
    .trim();

  if (!cleanText) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(cleanText);
  let voices = window.speechSynthesis.getVoices();
  
  // Try to find a better voice if voiceIndex is 0 (default)
  if (voiceIndex === 0 && voices.length > 0) {
    const preferredFemaleVoices = [
      "Microsoft Zira",
      "Samantha",
      "Victoria",
      "Google US English", // Usually high quality female by default
      "Google UK English Female",
      "Microsoft Aria",
      "Microsoft Jenny"
    ];
    
    // Sort or find based on preference
    const bestVoice = voices.find(v => preferredFemaleVoices.some(pv => v.name.includes(pv)));
    if (bestVoice) {
      utterance.voice = bestVoice;
    } else {
      // Fallback to searching for any voice with "female" in name if none of the above are found
      const anyFemale = voices.find(v => v.name.toLowerCase().includes('female'));
      utterance.voice = anyFemale || voices[0];
    }
  } else if (voices.length > 0) {
    utterance.voice = voices[voiceIndex % voices.length];
  }
  
  // Natural sounding parameters for a pleasant female voice
  utterance.rate = 1.0; 
  utterance.pitch = 1.1; // Slightly higher pitch for a clearer female tone
  utterance.volume = 1.0;
  
  window.speechSynthesis.speak(utterance);
}
