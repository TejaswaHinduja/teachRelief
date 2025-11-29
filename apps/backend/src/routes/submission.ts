import  express,{ Router } from "express";
import { prisma } from "@repo/db";


const router:Router=express.Router()

router.post("/submission",async (req,res)=>{
    const {assignmentId,studentId,pdfUrl,extractedText}=req.body;

    if(!assignmentId||!studentId||!pdfUrl||!extractedText){
        res.status(403).json({message:"send all the fields"})
    }
    else{
        await prisma.submission.create({
            data:{
                assignmentId,
                studentId,
                pdfUrl,
                extractedText
            }
        })

    }



})