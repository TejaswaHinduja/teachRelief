import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/authroutes";
import graderoutes from "./routes/graderoute";
import assignmentRoutes from "./routes/assignment";
import submissionRoutes from "./routes/submission";


const app=express();
app.set("trust proxy",1);
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:["https://teachrelief.tejaswahinduja.me" ,
    "http://localhost:3000"
],
    credentials:true
}))
app.use("/api", router)
app.use("/api", graderoutes)
app.use("/api", assignmentRoutes)
app.use("/api", submissionRoutes)


app.listen(3000,"0.0.0.0")
