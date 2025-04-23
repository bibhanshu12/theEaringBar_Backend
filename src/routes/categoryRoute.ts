import express  from "express";
import { isAdmin, isauthenticated } from "../middleware/authMiddleware";
import { addCategory, getCategory } from "../controllers/Category_Controllers";


export const router = express.Router();


router.post('/add',isauthenticated,isAdmin,addCategory);
router.get('/getcategory',isauthenticated,isAdmin,getCategory);


