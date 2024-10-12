import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: "https://emp-43577534.netlify.app",
  credentials: true,
  exposedHeaders: ["Authorization"]
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// below import route
import userRoutes from "./routes/emp.routes";
import authRoutes from "./routes/auth.routes";
import workspaceRoutes from "./routes/workspace.routes";
import ApiResponse from "./utils/ApiResponse";
import { CustomeErr } from "./utils/ApiError";

// routes declarations
const mainRoute = "/api/v1"
app.use(`${mainRoute}/emp`, userRoutes);
app.use(`${mainRoute}/auth`, authRoutes);
app.use(`${mainRoute}/workspace`, workspaceRoutes);

app.use((err: CustomeErr, req: Request, res: Response, next: NextFunction) => {
  console.log("cccc" ,err)
  res.send(new ApiResponse(err.statusCode,null, err.message))
  return;
})

export default app;
