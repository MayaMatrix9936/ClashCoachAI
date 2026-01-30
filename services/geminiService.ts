import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AttackPlanRequest, AttackPlanResponse } from '../types';

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
  // Fail fast with a clear message for local dev
  throw new Error("Missing GEMINI_API_KEY (set it in .env.local).");
}

const ai = new GoogleGenAI({ apiKey });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateAttackPlan = async (
  request: AttackPlanRequest,
  options?: { onProgress?: (step: number) => void }
): Promise<AttackPlanResponse> => {
  try {
    options?.onProgress?.(0);
    const armyBase64 = await fileToBase64(request.armyImage);
    const baseBase64 = await fileToBase64(request.baseImage);

    // Define the schema to force Gemini to return structured data
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        armyAnalysis: { type: Type.STRING, description: "Analysis of the user's army strengths/weaknesses." },
        baseWeaknesses: { type: Type.STRING, description: "Key vulnerabilities in the enemy base." },
        criticalAdvice: { type: Type.STRING, description: "Top 1-2 critical things to avoid." },
        steps: {
          type: Type.ARRAY,
          description: "A list of 3 to 5 distinct phases of the attack.",
          items: {
            type: Type.OBJECT,
            properties: {
              phaseName: { type: Type.STRING, description: "e.g., 'Phase 1: Funneling' or 'Phase 2: Main Push'" },
              description: { type: Type.STRING, description: "Detailed instructions for this step." },
              troopsUsed: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "List of specific troops/spells used in this phase (e.g. ['Golem', 'Wizard'])." 
              },
            },
            required: ["phaseName", "description", "troopsUsed"]
          }
        }
      },
      required: ["armyAnalysis", "baseWeaknesses", "criticalAdvice", "steps"]
    };

    // Step 1: Generate Structured Plan with Gemini 3 Pro
    const prompt = `
      You are an expert strategic game coach.
      Goal: "${request.goal}".
      
      Analyze the Army Image and Enemy Base Image.
      Create a step-by-step attack plan.
      Break the attack into 3 to 5 distinct phases.
      Use explicit numeric counts for troops and spells (no vague phrases like "a line of", "several", or "some").
      Every deploy instruction must include a direction, using both clock position and cardinal direction (e.g., "Deploy 2 Dragons at 3 o'clock (east)").
    `;

    options?.onProgress?.(1);
    await sleep(2000);
    const jsonResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: request.armyImage.type, data: armyBase64 } },
          { inlineData: { mimeType: request.baseImage.type, data: baseBase64 } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    if (!jsonResponse.text) throw new Error("No response text generated");
    options?.onProgress?.(2);
    
    const planData: AttackPlanResponse = JSON.parse(jsonResponse.text);
    options?.onProgress?.(3);
    await sleep(2000);
    options?.onProgress?.(4);
    await sleep(2000);
    return planData;

  } catch (error: unknown) {
    console.error("Error generating attack plan:", error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to analyze strategy: ${message}`);
  }
};