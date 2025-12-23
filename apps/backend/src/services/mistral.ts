import { Mistral } from "@mistralai/mistralai";
import dotenv from "dotenv"
dotenv.config();

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function run(pdfUrl:string) {
  const result = await mistral.ocr.process({
    model: "mistral-ocr-latest",
    document: {
      documentUrl: pdfUrl,
      type: "document_url",
    },
  });
  console.log(result);
}

