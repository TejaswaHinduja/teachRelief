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

router.get("/assignment/:roomId", protect, async (req: AuthRequest, res) => {
    const studentId = req.user?.id
    const roomId = req.params.roomId;
    const checkRoomMembership = await prisma.roomMembership.findFirst({
        where: {
            studentId,
            roomId
        }
    })
    if (!checkRoomMembership) {
        return res.status(403).json({ message: "you are not part of the room, join room first" })
    }
    const getAssignments = await prisma.assignment.findMany({
        where: {
            roomId: roomId
        },
        select: {
            id: true,
            title: true,
        }
    });
    return res.json({ assignments: getAssignments })

})

router.get("/room/:roomId/assignment/:assignmentId", protect, async (req: AuthRequest, res) => {
    const roomId = req.params.roomId
    const studentId = req.user?.id;
    const assignmentId = req.params.assignmentId;
    const checkRoomMembership = await prisma.roomMembership.findFirst({
        where: {
            studentId,
            roomId
        }
    })
    if (!checkRoomMembership) {
        return res.json({ message: "not a part of room" })
    }
    const assignmentDetails = await prisma.assignment.findUnique({
        where: {
            id: assignmentId
        },
        select: {
            title: true,
            roomId: true,
            pdfUrl: true
        }
    })
    return res.json({ assignmentDetails })

})

router.get("/teacher/assignment/:roomId", protect, async (req: AuthRequest, res) => {
    const teacherId = req.user?.id;
    const roomId = req.params.roomId;
    const getAssignments = await prisma.assignment.findMany({
        where: {
            roomId
        },
        select: {
            title: true,
            pdfUrl: true,
            id: true,
            createdAt: true
        }
    })
    return res.json({ getAssignments })
})
export default router;