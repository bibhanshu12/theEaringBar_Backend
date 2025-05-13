// src/app.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { router as userRouter } from "./routes/userRoute";
import { router as addressRouter } from "./routes/addressRoute";
import { router as productRouter } from "./routes/productRoute";
import { router as categoryRouter } from "./routes/categoryRoute";
import { router as orderRouter } from "./routes/OrderRoute";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// 1) CORS + Cookies
app.use(
  cors({
    origin: ["http://localhost:5173","http:/:5174"],
    credentials: true,
  })
);
app.use(cookieParser());

// 2) CONDITIONAL JSON PARSER
//    If the request is multipart/form-data, skip JSON parsing entirely.
const conditionalJson = (req: Request, res: Response, next: NextFunction) => {
  const contentType = (req.headers["content-type"] || "").toLowerCase();
  if (contentType.startsWith("multipart/form-data")) {
    return next();
  }
  // otherwise parse JSON bodies up to 10mb
  express.json({ limit: "10mb" })(req, res, next);
};

app.use(conditionalJson);

// 3) URL-ENCODED PARSER (for simple form posts)
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 4) Mount your routers (Multer is used inside productRouter for multipart endpoints)
app.use("/api", userRouter);
app.use("/api", addressRouter);
app.use("/api", productRouter);
app.use("/api/category", categoryRouter);
app.use("/api", orderRouter);

// 5) Error handler
app.use(
  (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error(err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Something went wrong!",
    });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
