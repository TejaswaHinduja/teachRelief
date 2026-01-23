import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/authroutes";
import graderoutes from "./routes/graderoute";
import assignmentRoutes from "./routes/assignment";
import submissionRoutes from "./routes/submission";
import { createFacilitator } from "./facilitator";


const app=express();

app.use(express.json());
app.use(cookieParser());
const corsMiddleware = cors({
    origin: ["https://teachrelief.tejaswahinduja.me", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200
});
app.use(corsMiddleware);
// Initialize and mount x402-open facilitator
// This exposes: GET /facilitator/supported, POST /facilitator/verify, POST /facilitator/settle
(async () => {
  try {
    const facilitator = await createFacilitator();
    const { createExpressAdapter } = await import("x402-open");
    createExpressAdapter(facilitator, app, "/facilitator");
    console.log("[x402-open] Facilitator endpoints mounted at /facilitator");
  } catch (error) {
    console.error("[x402-open] Failed to initialize facilitator:", error);
    console.warn("[x402-open] Payment functionality will be disabled");
  }
})();

app.use("/api", router)
app.use("/api", graderoutes)
app.use("/api", assignmentRoutes)
app.use("/api", submissionRoutes)


app.listen(1000,"0.0.0.0")
