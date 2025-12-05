import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv"
dotenv.config()
const apikey=process.env.GEMINI_API_KEY;
console.log(apikey)
//@ts-ignore
const ai = new GoogleGenAI({apikey});

export async function compareAi(studentsText:string,solutionText:string):Promise<{grade:string;feedback:string}> {
  const prompt=`You are a teacher grading a student's assignment , Just compare the two texts and if they are similar return a satisfacotry grade.Teachers Solution ${solutionText} Students Submission ${studentsText}`
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:prompt
  });
  //@ts-ignore
  const result=JSON.parse(response.text)||'{"grade:N/A","feedback:grading failed"}'
  return result
  
}
