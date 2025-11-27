import OpenAI from "openai";
import dotenv from "dotenv"
dotenv.config();

export async function compareAi(data:string){
    
const client = new OpenAI({
	baseURL: "https://router.huggingface.co/v1",
	apiKey: process.env.HF_TOKEN,
});

const chatCompletion = await client.chat.completions.create({
	model: "openai/gpt-oss-120b:nebius",
    messages: [
        {
            role: "user",
            content: "data",
        },
    ],
});

if(!chatCompletion){
    return console.log(Error)
}
//@ts-ignore
console.log(chatCompletion.choices[0].message);
}

