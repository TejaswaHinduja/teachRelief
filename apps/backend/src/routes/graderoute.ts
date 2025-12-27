import express,{Router} from "express";
import { compareAi } from "../services/gpt";
import { prisma } from "@repo/db";
import { AuthRequest, protect } from "../middleware/protect";
import { run } from "../services/mistral";

const router:Router =express.Router();

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
router.post("/ocr",protect,async(req:AuthRequest,res)=>{
  const {pdfUrl}=req.body;
  if(!pdfUrl){
    return res.status(400).json({error:"Missing pdfUrl"})
  }
  try {
    const extractedText=await run(pdfUrl);               
    res.json({ 
      success: true,
      text:extractedText
     },);    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed" });
  }
})

router.post("/gradeAi",protect,async(req:AuthRequest,res)=>{
  const submissionId=req.body.submissionId ;
  const assignmentId=req.body.assignmentId ;
  if(!assignmentId||!submissionId){
    return res.json({message:"assignmend doesnt exist"})
  }
  
  const studentsText=await prisma.submission.findUnique({
    where:{
      id:submissionId
    },
    select:{
      extractedText:true
    }
  })
  const teachersSolution=await prisma.assignment.findUnique({
    where:{
      id:assignmentId
    },
    select:{
      solutionText:true
    }
  })
  if(!studentsText||!teachersSolution){
    return res.status(403).json({message:"rubrics not provided yet"})
  }

  const {grade,feedback}=await compareAi(
    studentsText.extractedText,
    teachersSolution.solutionText
  )

  const savegrades=await prisma.submission.update({
    where:
    {id:submissionId},
    data:{
      grade,
      feedback,
      gradedAt:new Date()
    }
  })
  return res.json({savegrades})

})

export default router
