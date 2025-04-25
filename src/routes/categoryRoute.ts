import express  from "express";
import { isAdmin, isauthenticated } from "../middleware/authMiddleware";
import { addCategory, getCategory } from "../controllers/Category_Controllers";
import { addColor, getColors } from "../controllers/color_Controllers";


export const router = express.Router();


router.post('/add',isauthenticated,isAdmin,addCategory);
router.get('/getcategory',isauthenticated,isAdmin,getCategory);




router.post('/addcolor',isauthenticated,isAdmin,addColor);
router.get('/getcolors',isauthenticated,isAdmin,getColors);

