import express, { Router } from "express";
import { prisma } from "@repo/db";
import { protect, AuthRequest } from "../middleware/protect";

const router: Router = express.Router()

router.post("/createAssignment", protect, async (req: AuthRequest, res) => {
    try {
        const { title, roomId, pdfUrl, solutionText } = req.body;

        if (!title || !roomId || !pdfUrl || !solutionText) {
            return res.status(403).json({ message: "please enter all the fields" })
        }

        const assignment = await prisma.assignment.create({
            data: {
                title,
                roomId,
                pdfUrl,
                solutionText
            }
        })

        return res.status(201).json({
            message: "Assignment created successfully",
            assignmentId: assignment.id
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error creating assignment" })
    }
})

export default router;