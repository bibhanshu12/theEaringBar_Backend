import express from "express";
import { addProduct } from "../controllers/Product_Controller";
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
  (req, res, next) => {
    console.log(">>>> req.body:", req.body);
    console.log(">>>> req.files:", req.files?.map(f => f.fieldname, f => f.originalname));
    next();
  },
  validate(addProductSchema),
  addProduct
);
