import express  from "express";
import { isAdmin, isauthenticated } from "../middleware/authMiddleware";
import { addCategory, deleteCategory, getCategory,  getProductByCategory,  searchCategoriesByName, updateCategory } from "../controllers/Category_Controllers";
import { addColor, getColorById, getColors } from "../controllers/color_Controllers";
import { catchAsync } from "../utils/catchAsync";


export const router = express.Router();


// router.post('/add',isauthenticated,isAdmin,addCategory);
// router.get('/getcategory',isauthenticated,isAdmin,getCategory);
// router.get('/getcategory/:q',isauthenticated,isAdmin,searchCategoriesByName);
// router.put('/update/:id',isauthenticated,isAdmin,updateCategory);
// router.delete('/delete/:id',isauthenticated,isAdmin,deleteCategory);
// router.get("/products/category/:categoryId",getProductByCategory);



// router.post('/addcolor',isauthenticated,isAdmin,addColor);
// router.get('/getcolors',isauthenticated,isAdmin,getColors);
// router.delete('deletecolor',isauthenticated,isAdmin,getCategory);

// router.delete('/delete')

router.post('/add',isauthenticated,isAdmin,addCategory);
router.get('/getcategory',getCategory);
router.get('/getcategory/:q',searchCategoriesByName);
router.put('/update/:id',isauthenticated,isAdmin,updateCategory);
router.delete('/delete/:id',isauthenticated,isAdmin,deleteCategory);
router.get("/products/category/:categoryId",getProductByCategory);



router.post('/addcolor',isauthenticated,isAdmin,addColor);
router.get('/getcolors',isauthenticated,isAdmin,getColors);
router.delete('deletecolor',isauthenticated,isAdmin,getCategory);
router.get('/colors/:id',catchAsync(getColorById))