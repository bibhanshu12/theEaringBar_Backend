import { Router } from "express";
import { getAllUsers, Signup } from "../controllers/User_Controller";
import { validate } from "../middleware/validateMiddleware";
import { signUpInput } from "../validation/index";
import { catchAsync } from "../utils/catchAsync";
import { isauthenticated } from "../middleware/authMiddleware";

const router = Router();

router.post("/signup", validate(signUpInput), catchAsync(Signup));
router.get("/allusers", isauthenticated, catchAsync(getAllUsers));

export default router;
