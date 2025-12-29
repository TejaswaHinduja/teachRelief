import rateLimit from "express-rate-limit"
import { AuthRequest } from "./protect";


export const ocrLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 4, // 4 OCR requests per hour per user
  //@ts-ignore
  keyGenerator:(req:AuthRequest)=>req.user.id,
  message: { error: "OCR limit reached. Try again later." }
});
