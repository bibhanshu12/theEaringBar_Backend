import { PrismaClient } from "../generated/prisma";
// import {PrismaClient} from "@prisma/client";
import {Response,Request,NextFunction} from "express";
import { ApiError } from "../utils/apiErrorUtils";
import { doMail } from "../utils/transportEmail";
import { newsLetterMail, orderNotificationMail } from "../seeds/mailSeeds";

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

    // console.log(cart);

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

    // console.log("total Price: ",totalAmount,orderItemsData);
    

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
      const orderId = req.params.orderitemid;
      
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
      await prisma.order.update({
        where: { id: orderId },
        data:{
          status:"CANCELLED"
        }
      });
  
      return res.json({ success: true, message: "Order Cancelled! " });
    } catch (err: any) {
      return next(err);
    }
  };


export const getOrder=async(req:Request,res:Response)=>{

 try{
   const userId=req.user?.id;

  const Order= await prisma.order.findMany({
    where:{
      userId
    }
  })

  if(!Order){
    throw new ApiError(400,"Order not found");
  }

  res.status(200).json({success:"true",orders:Order});
  
 }catch(err:any){

  throw new ApiError(400,err.message)
 }


}
//  update the status if want to delete   softly 
//recommended this one 
export const updateOrderStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const orderId  = req.params.orderid;
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


export const getOrderItems=async(req:Request,res:Response)=>{

    try{

      const orderId=req.params.orderid

      const orders= await prisma.orderItem.findMany({
        where:{
          orderId
        }
      })
      if(!orders){
        throw new ApiError(400,"No orders Found! ")
      }
     res.status(200).json({sucess:"true",data:orders});

    }catch(err:any){
      throw new ApiError(400,"unable to show the order Items! ")
    }

}


export const doMailOrder=async(req:Request,res:Response)=>{

    try{
      const userId=req.user?.id;
      const {addressId,orderId}=req.body;

      if(!addressId || !orderId ||!userId){
        throw new ApiError(400,"AddressId and OrderId are required");
      }

      const getAccount=await prisma.user.findFirst({
        where:{
          id:userId
        },
        select:{
          email:true,
          firstName:true,
          lastName:true,
        }

      })

      if(!getAccount){
        throw new ApiError(400,"No account detail Found!!");
      }
      const orders= await prisma.orderItem.findMany({
        where:{
          orderId
        },
        include:{
          product:true
        }
      })

      const addresses=await prisma.address.findFirst({
        where:{
          id:addressId
        }
      })

      const mail="mithilaornaments@gmail.com"

      try{

doMail(await orderNotificationMail(mail,orders,addresses,getAccount));

      }catch(err){
        throw new ApiError(400,"Error occur while doing mail");
      }
      
      res.status(200).json({Success:"true"})
      return;
      // res.status(200).json({success:"true",account:getAccount,Data:orders, address:addresses})

      
      
    }catch(err){
      throw new ApiError(400,"Error while mailing")
    }
  }

export const doNewsLetterMail=async(req:Request,res:Response)=>{
  
  try{

    const fromMail= req.body;

    doMail( await (newsLetterMail(fromMail.email)));
    
    res.status(200).json({sucess:"True"});
    return;

  }catch(err){

    throw new ApiError(400,"Failed to Send Mail! ")
  }

}



export const placeOrderAndMail = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Extract & validate userId + addressId
    const userId = req.user?.id;
    const { addressId } = req.body as { addressId: string };
    if (!userId || !addressId) {
      throw new ApiError(400, "Authenticated user and addressId are required");
    }

    // 2️⃣ Load the user’s cart (un-ordered) with its cartItems → product & color
    const cart = await prisma.cart.findFirst({
      where: { userId, isOrdered: false },
      include: {
        cartItems: {
          include: { product: true, color: true },
        },
      },
    });
    if (!cart || cart.cartItems.length === 0) {
      throw new ApiError(400, "Cart is empty or not found");
    }

    // 3️⃣ Compute totalAmount and build orderItemsData
    let totalAmount = 0;
    const orderItemsData = cart.cartItems.map((ci) => {
      const pricePerUnit = ci.product.price;
      totalAmount += pricePerUnit * ci.quantity;
      return {
        productId: ci.productId,
        colorId: ci.colorId || undefined,
        quantity: ci.quantity,
        price: pricePerUnit,
      };
    });
    const discountAmt = cart.discountAmount || 0;
    const finalAmount = totalAmount - discountAmt;

    // 4️⃣ Create the Order (with nested OrderItems), then mark cart as ordered
    const newOrder = await prisma.order.create({
      data: {
        userId,
        cartId: cart.id,
        addressId,
        totalAmount,
        finalAmount,
        offerId: cart.offerId || undefined,
        discountAmount: discountAmt,
        status: "PENDING",
        orderItems: { create: orderItemsData },
      },
      include: {
        orderItems: true,
      },
    });
    await prisma.cart.update({
      where: { id: cart.id },
      data: { isOrdered: true },
    });

    // 5️⃣ Decrement each Product.stock (and ProductColor.stock if color was chosen)
    for (const oi of newOrder.orderItems) {
      // 5a. Decrement base product stock
      await prisma.product.update({
        where: { id: oi.productId },
        data: { stock: { decrement: oi.quantity } },
      });

      // 5b. Decrement color‐variant stock via composite key
      if (oi.colorId) {
        await prisma.productColor.update({
          where: {
            productId_colorId: {
              productId: oi.productId,
              colorId: oi.colorId,
            },
          },
          data: { stock: { decrement: oi.quantity } },
        });
      }
    }

    // 6️⃣ Refetch the newly created OrderItems with updated Product.stock
    const recentOrderItems = await prisma.orderItem.findMany({
      where: { orderId: newOrder.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true, // UPDATED stock
          },
        },
        color: { select: { id: true, name: true } },
      },
    });

    // 7️⃣ Fetch “upgrade products” for website display (exclude from email)
    //    Here we take the 10 most recently created products
    const upgradeProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
      },
    });

    // 8️⃣ Send email with ONLY the recent order items (no upgradeProducts)
    //    Fetch user info + address for the email
    const [getAccount, shippingAddress] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true, lastName: true },
      }),
      prisma.address.findUnique({ where: { id: addressId } }),
    ]);
    if (!getAccount) throw new ApiError(404, "User account not found");
    if (!shippingAddress) throw new ApiError(404, "Shipping address not found");

    try {
      await doMail(
        await orderNotificationMail(
          "mithilaornaments@gmail.com",  // recipient
          recentOrderItems,             // only what was just ordered
          shippingAddress,
          getAccount
        )
      );
    } catch (mailErr) {
      throw new ApiError(500, "Order placed but failed to send email");
    }

    // 9️⃣ Return JSON: order + upgradeProducts (so website can render upgrades)
    return res.status(201).json({
      success: true,
      order: {
        id: newOrder.id,
        userId: newOrder.userId,
        totalAmount: newOrder.totalAmount,
        finalAmount: newOrder.finalAmount,
        status: newOrder.status,
        placedAt: newOrder.createdAt,
        items: recentOrderItems.map((oi) => ({
          product: {
            id: oi.product.id,
            name: oi.product.name,
            price: oi.product.price,
            remainingStock: oi.product.stock,
          },
          color: oi.color?.name || null,
          quantity: oi.quantity,
          price: oi.price,
        })),
      },
      upgradeProducts, // these will be shown on the website, not in the email
    });
  } catch (err: any) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    console.error("placeOrderAndMail error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
