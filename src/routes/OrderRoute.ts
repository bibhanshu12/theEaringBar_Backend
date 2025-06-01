import { Router } from "express";
import { isAdmin, isauthenticated } from "../middleware/authMiddleware";
import { deleteOrder, doMailOrder, doNewsLetterMail, getOrder, getOrderItems, placeOrder, placeOrderAndMail, updateOrderStatus } from "../controllers/Order_Controller";
import { catchAsync } from "../utils/catchAsync";

export const router= Router();



router.post('/order/addorder',isauthenticated,placeOrder);
router.delete('/order/deleteorder/:orderitemid',isauthenticated,catchAsync(deleteOrder))
router.post('/order/updateorder/:orderid',isauthenticated,isAdmin,catchAsync(updateOrderStatus))
router.get('/order/getorders',isauthenticated,getOrder)
router.get('/order/getorderItems/:orderid',isauthenticated,getOrderItems);


router.post('/order/mailorder',isauthenticated,catchAsync(placeOrderAndMail))
router.post('/newsletter/suscribe',doNewsLetterMail)


