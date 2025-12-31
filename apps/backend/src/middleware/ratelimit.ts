import rateLimit from "express-rate-limit"
import { AuthRequest } from "./protect";


export const ocrLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 4, // 4 OCR requests per hour per IP
  //@ts-ignore
  //keyGenerator:(req:AuthRequest)=>req.user.id, //to make requests per user
  
  message: { error: "OCR limit reached. Try again later." }
});
