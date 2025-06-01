    import { Router } from "express";
    import { forgetPassword, getAllUsers, mailCode, signIn, signOut, signUp, verifyCode } from "../controllers/User_Controller";
    import { validate } from "../middleware/validateMiddleware";
    import { signUpInput,signInInput } from "../validation/index";
    import { catchAsync } from "../utils/catchAsync";
    import { isAdmin, isauthenticated } from "../middleware/authMiddleware";


    export const router=Router();


    router.post('/signup',validate(signUpInput),catchAsync(signUp));
    router.post('/signin',validate(signInInput),catchAsync(signIn));
    router.post("/signout",isauthenticated,catchAsync(signOut));
    router.post('/passwordchange',isauthenticated,catchAsync(forgetPassword))
    router.get('/allusers',isauthenticated,isAdmin,catchAsync(getAllUsers));
    router.post('/user/forgotpassword',mailCode);
    router.post('/user/verifyCode',verifyCode);


