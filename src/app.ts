import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/userRoute";
import cookieParser from "cookie-parser";
// Configure environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
