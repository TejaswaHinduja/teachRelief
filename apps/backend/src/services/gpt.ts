import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv"
dotenv.config()
const apikey = process.env.GEMINI_API_KEY;

//@ts-ignore
const ai = new GoogleGenAI({ apikey });

export async function compareAi(studentsText: string, solutionText: string): Promise<{ grade: string; feedback: string }> {
  const prompt = `You are a teacher grading a student's assignment. Compare the teacher's solution with the student's submission and provide a grade.

Teacher's Solution:
${solutionText}

Student's Submission:
${studentsText}

Respond with ONLY a JSON object (no markdown, no code blocks) in this exact format:
{"grade": "A/B/C/D/F or percentage", "feedback": "your feedback here"}`

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:prompt
  });

  //@ts-ignore
  let textResponse: string = response.text || "";

  // Strip markdown code blocks if present (```json ... ```)
  textResponse = textResponse.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    const result = JSON.parse(textResponse);
    return result;
  } catch (e) {
    console.error("Failed to parse Gemini response:", textResponse);
    return { grade: "N/A", feedback: "Grading failed - could not parse AI response" };
  }
}

