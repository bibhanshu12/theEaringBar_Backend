import express from "express";
import { addProduct, allProducts, deleteProduct } from "../controllers/Product_Controller";
import { validate } from "../middleware/validateMiddleware";
import { addProductSchema } from "../validation/index";
import { upload } from "../middleware/multerfileuploader";
import { isAdmin, isauthenticated } from "../middleware/authMiddleware";

export const router = express.Router();

router.post(
  "/addproduct",
  isauthenticated,
  isAdmin,
  upload.array("images", 5),
  validate(addProductSchema),
  addProduct
);

router.delete("/delproduct/:productId",isauthenticated,isAdmin,deleteProduct);
router.get("/allproducts",isauthenticated,isAdmin,allProducts);
