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
router.post("/view/submissions", protect, async (req: AuthRequest, res) => {
    const { assignmentId } = req.body;
    if (!assignmentId) {
        return res.json({ message: "please click on a assignment first" })
    }

    const seeSubmissions = await prisma.assignment.findMany({
        where: {
            id: assignmentId
        },
        select: {
            submissions: {
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            },
        }
    })
    if (!seeSubmissions) {
        return res.status(404).json({ message: "assignment not found" })
    }
    return res.json({ submissions: seeSubmissions[0]?.submissions || [] })

})

//for student to view their own submissions
router.get("/my-submissions", protect, async (req: AuthRequest, res) => {
    try {
        //@ts-ignore
        const studentId = req.user.id;
        
        const mySubmissions = await prisma.submission.findMany({
            where: {
                studentId: studentId
            },
            include: {
                assignment: {
                    select: {
                        id: true,
                        title: true,
                        roomId: true,
                        room: {
                            select: {
                                name: true,
                                code: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })
        
        return res.json({ submissions: mySubmissions })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error fetching submissions" })
    }
})

export default router;