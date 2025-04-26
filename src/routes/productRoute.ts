import express from "express";
import { addProduct, allProducts, deleteProduct, updateProduct } from "../controllers/Product_Controller";
import { validate } from "../middleware/validateMiddleware";
import { addProductSchema, updateProductSchema } from "../validation/index";
import { upload } from "../middleware/multerfileuploader";
import { isAdmin, isauthenticated } from "../middleware/authMiddleware";
import { addCart, deletecartItem, showCart } from "../controllers/Cart_Controller";

export const router = express.Router();

router.post(
  "/addproduct",
  isauthenticated,
  isAdmin,
  upload.array("images", 5),
  validate(addProductSchema),
  addProduct
);

router.post(
  "/updateproduct/:productId",
  isauthenticated,
  isAdmin,
  upload.array("images", 5),
  validate(updateProductSchema),
  updateProduct
);
router.delete("/delproduct/:productId",isauthenticated,isAdmin,deleteProduct);
router.get("/allproducts",isauthenticated,isAdmin,allProducts);


//cart routes

router.post('/addcart',isauthenticated,addCart);
router.get('/getcart',isauthenticated,showCart);
router.delete('/deletecartitem',isauthenticated,deletecartItem);