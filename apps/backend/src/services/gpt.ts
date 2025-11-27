import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv"
dotenv.config()
const apikey=process.env.GEMINI_API_KEY;
console.log(apikey)
//@ts-ignore
const ai = new GoogleGenAI({apikey});

export async function compareAi(data:string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:"can you sort this ",
  });
  console.log(response.text);
}
