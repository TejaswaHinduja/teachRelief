import rateLimit from "express-rate-limit"


export const ocrLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 OCR requests per hour per IP
  message: { error: "OCR limit reached. Try again later." }
});
