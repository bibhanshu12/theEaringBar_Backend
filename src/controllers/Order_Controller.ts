import { PrismaClient } from "../generated/prisma";
// import {PrismaClient} from "@prisma/client";
import {Response,Request,NextFunction} from "express";
import { ApiError } from "../utils/apiErrorUtils";

const prisma= new PrismaClient();


export const placeOrder=async(req:Request,res:Response)=>{

try{

    const userId=req.user?.id ;
    const {addressId}=req.body as {addressId:string};

    if(!addressId ||!userId){
        throw new ApiError(400,"Address needed to Proceed");
    }

    const cart = await prisma.cart.findFirst({
        where:{ 
            userId,
            isOrdered:false
        },
        include:{
            cartItems:{
                include:{
                    product:true,
                    color:true
                }
            }
        }
    })
    if (!cart || cart.cartItems.length === 0) {
        throw new ApiError(400, "Cart is empty");
      }

    console.log(cart);

    let totalAmount=0;

    const orderItemsData= cart?.cartItems.map((ci)=>{
        const itemPrice=ci.product.price;
        const  itemTotal=itemPrice * ci.quantity;
        totalAmount +=itemTotal;


        return ({
            productId:ci.productId,
            colorId:ci.colorId,
            quantity:ci.quantity,
            price:itemPrice
        })
    })

    console.log("total Price: ",totalAmount,orderItemsData);

    // Calculate final amount (considering any discounts from cart)
    const finalAmount = cart.discountAmount 
      ? totalAmount - cart.discountAmount 
      : totalAmount;

    const order = await prisma.order.create({
        data: {
          userId,
          cartId:cart.id,
          addressId,                // optional if nullable
          totalAmount,
          finalAmount, // Add this required field
          offerId: cart.offerId, // Add this to track which offer was used
          discountAmount: cart.discountAmount, // Add this to track discount
          status:   "PENDING",
          orderItems: {
            create: orderItemsData
          }
        },
        include: {
          orderItems: true,
          cart: { include: { cartItems: true } }  // if you want the cart in the response
        }
      });
  

      await prisma.cart.update({
        where: { id: cart.id },
        data:  { isOrdered: true }
      });
  
      res.status(201).json({ success: true, order });
    // res.status(200).json({status:"Success",msg:"Order Placed!",cart})

}catch(err:any){
    res.status(400).json({status:"Unsuccess",msg:"Failed to add Order",err:err.message})
    return;
}


}

//delete only pending! or its the hard delete 
export const deleteOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = req.params;
  
      // 1️⃣ Load the order and check status
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true },
      });
      if (!order) {
        throw new ApiError(404, "Order not found");
      }
      if (order.status !== "PENDING") {
        throw new ApiError(
          400,
          `Cannot delete order with status "${order.status}". Only PENDING orders may be deleted.`
        );
      }
  
      // 2️⃣ Delete the order (cascades away orderItems if onDelete: Cascade)
      await prisma.order.delete({
        where: { id: orderId },
      });
  
      return res.json({ success: true, message: "Order deleted" });
    } catch (err: any) {
      return next(err);
    }
  };


  
//  update the status if want to delete   softly 
//recommended this one 
export const updateOrderStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body as { status: "PENDING" | "CONFIRMED" | "PAID" | "CANCELLED" | "REFUNDED" };
  
      // 1️⃣ Validate incoming status
      const validStatuses = ["PENDING","CONFIRMED","PAID","CANCELLED","REFUNDED"];
      if (!validStatuses.includes(status)) {
        throw new ApiError(400, `Invalid status "${status}".`);
      }
  
      // 2️⃣ Check order exists
      const existing = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true },
      });
      if (!existing) {
        throw new ApiError(404, "Order not found");
      }
  
      // 3️⃣ (Optional) enforce valid transitions
      // e.g. you might disallow going from PAID → PENDING, etc.
      // if (existing.status === "REFUNDED") { throw new ApiError(400, "Cannot change status of a refunded order"); }
  
      // 4️⃣ Perform update
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: { orderItems: true, cart: true }
      });
  
      return res.json({
        success: true,
        message: `Order status updated to "${status}".`,
        order: updated,
      });
    } catch (err: any) {
      return next(err);
    }
  };


