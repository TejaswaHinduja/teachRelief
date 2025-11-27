import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv"
dotenv.config()
const apikey=process.env.GEMINI_API_KEY;
console.log(apikey)
//@ts-ignore
const ai = new GoogleGenAI({apikey});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}
main();