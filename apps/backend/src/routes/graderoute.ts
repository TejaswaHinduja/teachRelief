import express, { Router } from "express";
import { compareAi } from "../services/gpt";
import { prisma } from "@repo/db";
import { AuthRequest, protect } from "../middleware/protect";
import { run } from "../services/mistral";
import { ocrLimiter } from "../middleware/ratelimit";
import { validatePdf } from "../utils/pdfValidator";
import dotenv from "dotenv";

dotenv.config();

const router: Router = express.Router();

/*router.post("/ocr", async (req, res) => {
  const { pdfUrl } = req.body;
  if (!pdfUrl) return res.status(400).json({ error: "Missing pdfUrl" });

  try {
    const ocrResponse = await fetch("http://localhost:8000/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdf_url: pdfUrl }),
    });
    const data = await ocrResponse.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OCR service failed" });
  }
});*/

router.post("/ocr", ocrLimiter, protect, async (req: AuthRequest, res) => {
  const { pdfUrl } = req.body;
  if (!pdfUrl) {
    return res.status(400).json({ error: "Missing pdfUrl" })
  }

  // Validate PDF before running expensive OCR
  const validation = await validatePdf(pdfUrl);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const extractedText = await run(pdfUrl);
    res.json({
      success: true,
      text: extractedText,
      pageCount: validation.pageCount
    },);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
})

// Configure payment middleware for gradeAi endpoint
// This requires payment before accessing the AI grading service
const receivingWallet = process.env.X402_RECEIVING_WALLET;
const facilitatorUrl = process.env.X402_FACILITATOR_URL || "http://localhost:1000/facilitator";
const network = (process.env.X402_NETWORK || "base-sepolia") as "base-sepolia" | "base";
const gradingPrice = process.env.X402_GRADING_PRICE || "$0.0001";

// Setup payment middleware asynchronously
(async () => {
  if (receivingWallet) {
    try {
      // Dynamic import for ES module
      const { paymentMiddleware } = await import("x402-express");
      router.post(
        "/gradeAi",
        paymentMiddleware(
          receivingWallet as `0x${string}`, // EVM address with 0x prefix
          {
            "POST /api/gradeAi": {
              price: gradingPrice,
              network: network, // base-sepolia or base
            },
          },
          {
            url: facilitatorUrl as `http://${string}` | `https://${string}`,
          }
        ),
        protect,
        async (req: AuthRequest, res) => {
          await handleGradeAi(req, res);
        }
      );
      console.log(`[x402-open] Payment middleware configured for /api/gradeAi (network: ${network})`);
    } catch (error) {
      console.error("[x402-open] Failed to load payment middleware:", error);
      // Fallback: route without payment
      router.post("/gradeAi", protect, async (req: AuthRequest, res) => {
        await handleGradeAi(req, res);
      });
    }
  } else {
    // Fallback: route without payment if wallet not configured
    console.warn("[x402-open] X402_RECEIVING_WALLET not set, grading endpoint will not require payment");
    router.post("/gradeAi", protect, async (req: AuthRequest, res) => {
      await handleGradeAi(req, res);
    });
  }
})();

async function handleGradeAi(req: AuthRequest, res: express.Response) {
  const submissionId = req.body.submissionId;
  const assignmentId = req.body.assignmentId;
  if (!assignmentId || !submissionId) {
    return res.json({ message: "assignmend doesnt exist" })
  }

  const studentsText = await prisma.submission.findUnique({
    where: {
      id: submissionId
    },
    select: {
      extractedText: true
    }
  })
  const teachersSolution = await prisma.assignment.findUnique({
    where: {
      id: assignmentId
    },
    select: {
      solutionText: true
    }
  })
  if (!studentsText || !teachersSolution) {
    return res.status(403).json({ message: "rubrics not provided yet" })
  }

  const { grade, feedback } = await compareAi(
    studentsText.extractedText,
    teachersSolution.solutionText
  )

  const savegrades = await prisma.submission.update({
    where:
      { id: submissionId },
    data: {
      grade,
      feedback,
      gradedAt: new Date()
    }
  })
  return res.json({ savegrades });
}


export default router
