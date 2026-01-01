import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv"
dotenv.config()
const apikey = process.env.GEMINI_API_KEY;

//@ts-ignore
const ai = new GoogleGenAI({ apikey });

/**
 * Extracts JSON from a string that may contain extra text
 */
function extractJSON(text: string): { grade: string; feedback: string } | null {
  // First, try to strip markdown code blocks
  let cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  
  // Try direct parsing first
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed.grade && parsed.feedback) {
      return parsed;
    }
  } catch (e) {
    // Continue to other methods
  }

  // Try to find JSON object using regex (handles cases with text before/after)
  const jsonMatch = cleaned.match(/\{[\s\S]*"grade"[\s\S]*"feedback"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.grade && parsed.feedback) {
        return parsed;
      }
    } catch (e) {
      // Continue
    }
  }

  // Try to find any JSON object in the text
  const anyJsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (anyJsonMatch) {
    try {
      const parsed = JSON.parse(anyJsonMatch[0]);
      if (parsed.grade && parsed.feedback) {
        return parsed;
      }
    } catch (e) {
      // Continue
    }
  }

  return null;
}

export async function compareAi(studentsText: string, solutionText: string): Promise<{ grade: string; feedback: string }> {
  const prompt = `You are a teacher grading a student's assignment. Compare the teacher's solution with the student's submission and provide a grade.

Teacher's Solution:
${solutionText}

Student's Submission:
${studentsText}

IMPORTANT: In your feedback, do NOT use LaTeX, math symbols with backslashes, or special characters. Use plain text only (e.g., write "sqrt(npq)" instead of "$\\sqrt{npq}$", write "lambda" instead of "$\\lambda$").

CRITICAL: You MUST respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks, no extra text):
{"grade": "A/B/C/D/F or percentage like 85%", "feedback": "your detailed feedback here in plain text"}`

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    //@ts-ignore
    let textResponse: string = response.text || "";
    
    console.log("Raw AI Response:", textResponse); // Debug log

    // Try to extract and parse JSON
    const parsed = extractJSON(textResponse);
    
    if (parsed) {
      // Ensure grade and feedback are strings
      return {
        grade: String(parsed.grade || "N/A"),
        feedback: String(parsed.feedback || "No feedback provided")
      };
    }

    // If parsing failed, try to extract grade and feedback manually
    // Look for patterns like "grade": "..." or grade: ...
    const gradeMatch = textResponse.match(/"grade"\s*:\s*"([^"]+)"/i) || 
                       textResponse.match(/grade\s*:\s*"?([A-F0-9%]+)"?/i);
    const feedbackMatch = textResponse.match(/"feedback"\s*:\s*"([^"]+)"/i) ||
                          textResponse.match(/feedback\s*:\s*"([^"]+)"/i);

    if (gradeMatch && gradeMatch[1] && feedbackMatch && feedbackMatch[1]) {
      return {
        grade: gradeMatch[1].trim(),
        feedback: feedbackMatch[1].trim()
      };
    }

    // Last resort: save the raw response as feedback
    console.error("Failed to parse AI response. Raw response:", textResponse);
    return {
      grade: "Error",
      feedback: `Grading encountered an error. Raw AI response: ${textResponse.substring(0, 500)}${textResponse.length > 500 ? '...' : ''}`
    };
  } catch (error) {
    console.error("Error calling AI service:", error);
    return {
      grade: "Error",
      feedback: `Failed to grade submission: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

