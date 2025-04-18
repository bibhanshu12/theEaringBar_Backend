import { Router } from "express";
import { getAllUsers, Signup } from "../controllers/User_Controller.ts";
import { validate } from "../middleware/validateMiddleware.ts";
import { signUpInput,signInInput } from "../validation/index.ts";
import { catchAsync } from "../utils/catchAsync.ts";
import { isauthenticated } from "../middleware/authMiddleware.ts";


export const router=Router();


router.post('/signup',validate(signUpInput),catchAsync(Signup));
router.get('/allusers',isauthenticated,catchAsync(getAllUsers))


