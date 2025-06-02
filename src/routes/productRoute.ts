import express from "express";
import { addProduct, allProducts, assignOfferToProduct, batchProductsByIds, createOffer, deleteOffer, deleteProduct, freshDrops, getAllLinkedProductByOfferId, getAllOffer, getProductsById, getProductsColorById, getSearchProduct, updateOffer, updateProduct } from "../controllers/Product_Controller";
import { validate } from "../middleware/validateMiddleware";
import { addProductSchema, updateProductSchema } from "../validation/index";
import { upload } from "../middleware/multerfileuploader";
import { isAdmin, isauthenticated } from "../middleware/authMiddleware";
import { addCart, deletecartItem, showCart } from "../controllers/Cart_Controller";
import { catchAsync } from "../utils/catchAsync";

export const router = express.Router();

// router.post(
//   "/addproduct",isauthenticated,isAdmin,
//   upload.array("images", 5),
//   validate(addProductSchema),
//   addProduct
// );

// router.post(
//   "/updateproduct/:productId",
//   isauthenticated,isAdmin,
//   upload.array("images", 5),
//   validate(updateProductSchema),
//   catchAsync(updateProduct)
// );

router.post(
  "/addproduct",
  isauthenticated,
  isAdmin,
  upload.array("images", 5),
  validate(addProductSchema),
  catchAsync(addProduct)
);

router.post(
  "/updateproduct/:productId",
  isauthenticated,
  isAdmin,
  upload.array("images", 5),
  validate(updateProductSchema),
  catchAsync(updateProduct)
);
router.delete("/delproduct/:productId",isauthenticated,isAdmin,deleteProduct);
router.get("/allproducts",allProducts);
router.get('/singleproduct/:id',getProductsById);
router.get("/freshdrops",catchAsync(freshDrops))
router.get('/product/getcolors/:id',isauthenticated,getProductsColorById)
router.post('/products/batch',isauthenticated,catchAsync(batchProductsByIds))
// router.put('/updatecolors/:productId',updateProductColorStock);
router.get('/products/search',catchAsync(getSearchProduct))


//cart routes

router.post('/addcart',isauthenticated,catchAsync(addCart));
router.get('/getcart',isauthenticated,showCart);
router.delete('/deletecartitem',isauthenticated,deletecartItem);






//Offer Section

router.post('/addoffer',isauthenticated,isAdmin,createOffer);
router.post('/product/addoffer',isauthenticated,isAdmin,assignOfferToProduct);
router.get('/getoffer',isauthenticated,isAdmin,getAllOffer);
router.get('/getoffer/:id',isauthenticated,isAdmin,getAllLinkedProductByOfferId);
router.delete("/deleteoffer/:id",isauthenticated,isAdmin,deleteOffer);
router.put("/updateoffer/:id",isauthenticated,isAdmin,updateOffer);