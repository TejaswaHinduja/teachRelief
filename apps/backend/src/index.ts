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
    origin:"http://localhost:3000",
    credentials:true
}))
app.use("/api", router)
app.use("/api", graderoutes)
app.use("/api", assignmentRoutes)
app.use("/api", submissionRoutes)


app.listen(1000)