import jwt from "jsonwebtoken";
import { Response } from "express";

const secret=process.env.JWT_SECRET || "!23";
console.log(secret)

export default function gentoken(id:string,res:Response){
    const token=jwt.sign({id},secret,{
        expiresIn:"7d",
    });
    res.cookie("jwt",token,{
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        sameSite:"strict",
        secure:process.env.NODE_ENV !=="development"
    });
    return token;
}
