import express  from "express";
import { isAdmin, isauthenticated } from "../middleware/authMiddleware";
import { addCategory, deleteCategory, getCategory,  searchCategoriesByName, updateCategory } from "../controllers/Category_Controllers";
import { addColor, getColors } from "../controllers/color_Controllers";


export const router = express.Router();


router.post('/add',isauthenticated,isAdmin,addCategory);
router.get('/getcategory',isauthenticated,isAdmin,getCategory);
router.get('/getcategory/:q',isauthenticated,isAdmin,searchCategoriesByName);
router.put('/update/:id',isauthenticated,isAdmin,updateCategory);
router.delete('/delete/:id',isauthenticated,isAdmin,deleteCategory)



router.post('/addcolor',isauthenticated,isAdmin,addColor);
router.get('/getcolors',isauthenticated,isAdmin,getColors);
router.delete('deletecolor',isauthenticated,isAdmin,getCategory);

// router.delete('/delete')
