import express, { Router } from "express";
import gentoken from "../middleware/jwt";
import bcrypt from "bcrypt";
import { prisma } from "@repo/db";
import { AuthRequest, protect } from "../middleware/protect";

const router: Router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(403).json({ message: "Fill all the fields" })
        }

        const checkdb = await prisma.user.findUnique({
            where: { email }
        })
        if (!checkdb) {
            return res.status(403).json({ message: "Please sign up" })
        }
        const checkpass = await bcrypt.compare(password, checkdb.passwordHash)
        if (!checkpass) {
            return res.status(403).json({ message: "invalid creds" })
        }
        gentoken(checkdb.id, res)

        res.status(200).json({
            message: "Logged In",
            name: checkdb.name,
            email: checkdb.email,
            role: checkdb.role
        })
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error during login" })
    }
})

router.post("/signUp", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(403).json({ message: "Fill all the fields" })
        }

        const exisitingUser = await prisma.user.findUnique({
            where: { email }
        })
        if (exisitingUser) {
            return res.status(409).json({ message: "User already exists,Please log in" })
        }
        const passwordHash = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role
            }
        })
        gentoken(user.id, res);
        res.status(201).json({
            message: "Signed Up!",
            user: {
                name: user.name,
                email: user.email,
                role
            }
        });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error during signup" })
    }
})

router.post("/createroom", protect, async (req: AuthRequest, res) => {
    try {
        //@ts-ignore
        const teacherId = req.user.id; // req.user.id is already a string
        const code = teacherId + Date.now().toString().slice(-4);

        const room = await prisma.room.create({
            data: {
                code,
                teacherId
            }
        })
        res.status(201).json({
            roomId:room.id,
            message: "room created",
            code: room.code
        })
    }
    catch (error) {
        console.log(error)
    }
})
/*router.get("/chats/:roomId",async(req , res) =>{
  try{
      const roomId=req.params.roomId;
      const messages=await prisma.chat.findMany({
          where:{
              roomId:roomId
          },
          orderBy:{
              id:"desc"
          },
          take:50
      })
      res.json({messages})
  }
  catch(e){
      console.log(e)
    }
})*/

router.post("/joinroom", protect, async (req, res) => {
    try {
        const { roomCode } = req.body;
        //@ts-ignore
        const userId = req.user.id;
        //@ts-ignore
        if (req.user.role !== "STUDENT") {
            return res.status(403).json({ message: "Not authorized" })
        }
        const checkRoom = await prisma.room.findUnique({
            where: { code: roomCode }
        })
        if (!checkRoom) {
            return res.status(403).json({ message: "No such room" })
        }
        const checkMembership = await prisma.roomMembership.findFirst({
            where: {
                studentId: userId,
                roomId: checkRoom.id
            }
        })
        if (checkMembership) {
            return res.json({ 
                message: "Already joined",
                roomId: checkRoom.id
             }
                
            )
        }
        else {
            await prisma.roomMembership.create({
                data: {
                    roomId: checkRoom.id,
                    studentId: userId
                }
            })
            return res.json({
                message: "Room joined",
                roomId: checkRoom.id
            })
        }
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: "Error joining room" })
    }
})


router.get("/room/:roomCode", protect, async (req, res) => {
    try {
        const { roomCode } = req.params;

        const room = await prisma.room.findUnique({
            where: { code: roomCode }
        });

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        return res.json({
            roomId: room.id, 
            code: room.code,
            name: room.name,
            teacherId: room.teacherId
        });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ message: "Error fetching room details" });
    }
})

router.get("/myrooms",protect, async (req:AuthRequest,res) =>{
    const teacherId=req.user?.id
    const getRooms=await prisma.room.findMany({
        where:{teacherId},
        select:{
            name:true,
            code:true,
            createdAt:true
        }
    })
    return res.json({getRooms})

})

export default router;
