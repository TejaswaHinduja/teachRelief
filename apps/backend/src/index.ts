import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/authroutes";
import graderoutes from "./routes/graderoute";


const app=express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
}))
app.use("/api",router)
app.use("/api",graderoutes)


app.listen(1000)