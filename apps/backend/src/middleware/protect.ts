import jwt, { JwtPayload } from "jsonwebtoken";
import { Request,Response,NextFunction } from "express";

const secret=process.env.JWT_SECRET ||"!23";

export interface AuthRequest extends Request {
  user?: { id: string }; 
}



export function protect(req:AuthRequest,res:Response,next:NextFunction){
    const token=req.cookies.jwt;
    if(!token){
        return res.status(400).json({message:"Inavlid creds"})
    }
    try {
        const decoded=jwt.verify(token,secret) as JwtPayload & {id :string};
    if(!decoded || !decoded.id){
        return res.status(400).json({message:"not authorized"})
    }

    req.user={id:decoded.id} 
    next()}
    catch(error){
        return res.status(403).json({message:"token invalid"})
    }
}