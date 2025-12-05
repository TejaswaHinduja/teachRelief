import  express,{ Router } from "express";
import { prisma } from "@repo/db";
import { protect, AuthRequest } from "../middleware/protect";


const router:Router=express.Router()

router.post("/submission", protect, async (req: AuthRequest, res) => {
    try {
        const { assignmentId, pdfUrl, extractedText } = req.body;
        //@ts-ignore
        const studentId = req.user.id; 

        if (!assignmentId || !pdfUrl || !extractedText) {
            return res.status(403).json({ message: "send all the required fields" })
        }

        const submission = await prisma.submission.create({
            data: {
                assignmentId,
                studentId,
                pdfUrl,
                extractedText
            }
        })
        return res.status(201).json({
            message: "Submission created successfully",
            submissionId: submission.id
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error creating submission" })
    }
})
//for teacher to view all the submissions
router.post("/view/submissions",protect,async(req:AuthRequest,res)=>{
    const {assignmentId}=req.body;
    if(!assignmentId){
        return res.json({message:"please click on a assignment first"})
    }
    
    const seeSubmissions=await prisma.assignment.findMany({
        where:{
            id:assignmentId
        },
        select:{
            submissions:true,
        }
    })
    return res.json({submissions:seeSubmissions})
    
})

export default router;