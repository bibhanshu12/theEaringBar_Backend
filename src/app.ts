
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
 import {router} from "../src/routes/userRoute"
 import {router as addressRouter} from "../src/routes/addressRoute"
 import {router as productRouter} from "../src/routes/productRoute"
 import cookieParser from "cookie-parser"
import {router as categoryRouter} from "../src/routes/categoryRoute"
// import { Request,Response } from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.get("/check",(req:Request,res:Response)=>{
    
//     res.json({msg:"I am alive"})
// })
app.use('/api',router);
app.use('/api',addressRouter);
app.use('/api',productRouter)
app.use('/api',categoryRouter)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
