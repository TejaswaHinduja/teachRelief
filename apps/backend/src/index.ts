import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/authroutes";
import graderoutes from "./routes/graderoute";
import assignmentRoutes from "./routes/assignment";
import submissionRoutes from "./routes/submission";


const app=express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["https://teachrelief.tejaswahinduja.me", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200
}))
app.use("/api", router)
app.use("/api", graderoutes)
app.use("/api", assignmentRoutes)
app.use("/api", submissionRoutes)


app.listen(1000,"0.0.0.0")
