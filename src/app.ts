// src/app.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { contentSecurityPolicy } from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import sanitizeHtml from "sanitize-html";

import { router as userRouter } from "./routes/userRoute";
import { router as addressRouter } from "./routes/addressRoute";
import { router as productRouter } from "./routes/productRoute";
import { router as categoryRouter } from "./routes/categoryRoute";
import { router as orderRouter } from "./routes/OrderRoute";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// 0) SECURITY HEADERS + CSP
app.use(helmet());
app.disable("x-powered-by");
app.use(
  contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

// 1) CORS + Cookies
const rawOrigins = process.env.CORS_ORIGINS || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);
app.use(cookieParser());

// 2) RATE LIMITING
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// 3) HTTP PARAMETER POLLUTION
app.use(hpp());

// 4) CONDITIONAL JSON PARSER + GLOBAL XSS SANITIZER
app.use((req: Request, res: Response, next: NextFunction) => {
  // 1) Parse JSON body if not multipart
  const ct = (req.headers["content-type"] || "").toLowerCase();
  if (ct.startsWith("multipart/form-data")) {
    return next();
  }
  express.json({ limit: "10mb" })(req, res, () => {
    // 2) Recursively sanitize any string fields in req.body
    const sanitize = (obj: any): any => {
      if (typeof obj === "string") {
        return sanitizeHtml(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      if (obj && typeof obj === "object") {
        for (const key of Object.keys(obj)) {
          obj[key] = sanitize(obj[key]);
        }
      }
      return obj;
    };
    req.body = sanitize(req.body);
    next();
  });
});

// 5) URL‑ENCODED PARSER
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 6) ROUTES
app.use("/api", userRouter);
app.use("/api", addressRouter);
app.use("/api", productRouter);
app.use("/api/category", categoryRouter);
app.use("/api", orderRouter);


app.use(
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
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
