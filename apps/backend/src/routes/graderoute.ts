import express,{Router} from "express";
import { compareAi } from "../services/gpt";

const router:Router =express.Router();

router.post("/ocr", async (req, res) => {
  const { pdfUrl } = req.body;
  if (!pdfUrl) return res.status(400).json({ error: "Missing pdfUrl" });

  try {
    const ocrResponse = await fetch("http://localhost:8000/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdf_url: pdfUrl }),
    });

    const data = await ocrResponse.json();
   // compareAi(data)
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OCR service failed" });
  }
});

export default router
