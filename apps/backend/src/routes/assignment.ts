import express,{Router} from "express";

import { prisma } from "@repo/db";
const router:Router=express.Router()

router.post("/createAssignment",async (req,res)=>{
    const {title,roomId,pdfUrl}=req.body;
    if(!title||!roomId||!pdfUrl){
        return res.status(403).json({message:"please enter all the fields"})
    }
    else{
        await prisma.assignment.create({
            data:{
                title:title,
                roomId:roomId,
                pdfUrl:pdfUrl,
                solutionText:"123"
            }
        })
    }

})